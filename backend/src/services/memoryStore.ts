import {
  Alert,
  Item,
  LogType,
  StockLog,
  UserSettings
} from '../types/domain'

export const settings: UserSettings = {
  coverMonths: 1,
  consumptionWindow: 30,
  leadTimeDays: 3,
  bufferDays: 2,
  pushEnabled: true,
  emailEnabled: false
}

// User-scoped in-memory stores
const itemsByUser = new Map<string, Item[]>()
const logsByUser = new Map<string, StockLog[]>()
const alertsByUser = new Map<string, Alert[]>()

export function getItems(userId: string): Item[] {
  if (!itemsByUser.has(userId)) itemsByUser.set(userId, [])
  return itemsByUser.get(userId)!
}

export function getLogs(userId: string): StockLog[] {
  if (!logsByUser.has(userId)) logsByUser.set(userId, [])
  return logsByUser.get(userId)!
}

export function getAlerts(userId: string): Alert[] {
  if (!alertsByUser.has(userId)) alertsByUser.set(userId, [])
  return alertsByUser.get(userId)!
}

export const reorderLists: Array<{ id: string; userId: string; generatedAt: string; items: unknown[]; status: 'draft' | 'exported' }> = []

export function id(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export function signedQty(logType: LogType, qty: number) {
  return logType === 'INTAKE' ? Math.abs(qty) : -Math.abs(qty)
}
