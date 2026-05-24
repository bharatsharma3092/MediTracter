import {
  Alert,
  AlertType,
  Item,
  StockLog
} from '@shared/types'
import { calculateReorder } from '@/utils/reorderCalculator'
import { useSettingsStore } from '@/store/settingsStore'
import { useAuthStore } from '@/store/authStore'

function uid(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function getUserId(): string {
  const session = useAuthStore.getState().session
  return session?.user?.id ?? 'anonymous'
}

function userKey(key: string): string {
  return `${key}-${getUserId()}`
}

function read<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key)
  if (!raw) return fallback
  return JSON.parse(raw) as T
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
  window.dispatchEvent(new Event('meditrack-data-change'))
  return value
}

function writeQuiet<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
  return value
}

export const localDb = {
  get userId() {
    return getUserId()
  },
  items: () => read<Item[]>(userKey('meditrack-items'), []),
  logs: () => read<StockLog[]>(userKey('meditrack-stock-logs'), []),
  alerts: () => read<Alert[]>(userKey('meditrack-alerts'), []),
  saveItems: (items: Item[]) => write(userKey('meditrack-items'), items),
  saveLogs: (logs: StockLog[]) => write(userKey('meditrack-stock-logs'), logs),
  saveAlerts: (alerts: Alert[]) => writeQuiet(userKey('meditrack-alerts'), alerts),
  createId: uid
}

export function generateAlerts() {
  const settings = useSettingsStore.getState()
  const items = localDb.items()
  const logs = localDb.logs()
  const existing = localDb.alerts().filter((alert) => !alert.dismissed)
  const next = [...existing]

  const add = (itemId: string, alertType: AlertType) => {
    if (!next.some((alert) => alert.itemId === itemId && alert.alertType === alertType && !alert.dismissed)) {
      next.push({ id: uid('alert'), itemId, alertType, triggeredAt: new Date().toISOString(), dismissed: false })
    }
  }

  for (const item of items) {
    if (item.currentQty < item.minQty) add(item.id, AlertType.LOW_STOCK)
    if (item.expiryDate) {
      const days = Math.ceil((new Date(item.expiryDate).getTime() - Date.now()) / 86400000)
      if (days <= 7 && days >= 0) add(item.id, AlertType.EXPIRY_7)
      else if (days <= 15 && days >= 0) add(item.id, AlertType.EXPIRY_15)
      else if (days <= 30 && days >= 0) add(item.id, AlertType.EXPIRY_30)
    }
    const itemLogs = logs.filter((log) => log.itemId === item.id)
    if (calculateReorder(item, itemLogs, settings).reorderTrigger) add(item.id, AlertType.REORDER_DUE)
  }

  return localDb.saveAlerts(next)
}
