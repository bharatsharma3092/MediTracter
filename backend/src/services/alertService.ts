import { AlertType, Item } from '../types/domain'
import { getAlerts, getItems, getLogs, id, settings } from './memoryStore'
import { calculateReorder } from './reorderService'

function add(userId: string, itemId: string, alertType: AlertType) {
  const alerts = getAlerts(userId)
  const exists = alerts.some((alert) => alert.itemId === itemId && alert.alertType === alertType && !alert.dismissed)
  if (!exists) {
    alerts.push({ id: id('alert'), itemId, alertType, triggeredAt: new Date().toISOString(), dismissed: false })
  }
}

export function evaluateItem(item: Item) {
  const userId = item.userId
  if (item.currentQty < item.minQty) add(userId, item.id, 'LOW_STOCK')
  if (item.expiryDate) {
    const days = Math.ceil((new Date(item.expiryDate).getTime() - Date.now()) / 86400000)
    if (days >= 0 && days <= 7) add(userId, item.id, 'EXPIRY_7')
    else if (days >= 0 && days <= 15) add(userId, item.id, 'EXPIRY_15')
    else if (days >= 0 && days <= 30) add(userId, item.id, 'EXPIRY_30')
  }
  const calc = calculateReorder(item, getLogs(userId).filter((log) => log.itemId === item.id), settings)
  if (calc.reorderTrigger) add(userId, item.id, 'REORDER_DUE')
}

export function evaluateAll(userId: string) {
  getItems(userId).forEach(evaluateItem)
  return listAlerts(userId)
}

export function listAlerts(userId: string) {
  const userItems = getItems(userId)
  return getAlerts(userId)
    .filter((alert) => !alert.dismissed && userItems.some((item) => item.id === alert.itemId))
    .map((alert) => {
      const item = userItems.find((entry) => entry.id === alert.itemId)
      return {
        ...alert,
        itemName: item?.name ?? 'Unknown item',
        itemType: item?.itemType ?? 'UNKNOWN',
        currentQty: item?.currentQty ?? 0,
        minQty: item?.minQty ?? 0,
        expiryDate: item?.expiryDate ?? null
      }
    })
}
