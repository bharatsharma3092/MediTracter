import { AlertWithItem } from '@shared/types'
import { generateAlerts, localDb } from './localDb'

function enrich() {
  const items = localDb.items()
  return generateAlerts()
    .filter((alert) => !alert.dismissed)
    .map((alert): AlertWithItem => {
      const item = items.find((entry) => entry.id === alert.itemId)
      return {
        ...alert,
        itemName: item?.name ?? 'Unknown item',
        itemType: item?.itemType ?? 'UNKNOWN',
        currentQty: item?.currentQty ?? 0,
        minQty: item?.minQty ?? 0,
        expiryDate: item?.expiryDate ?? null
      }
    })
    .sort((a, b) => new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime())
}

export const alertService = {
  async list() {
    return enrich()
  },
  async dismiss(id: string | string[]) {
    const ids = Array.isArray(id) ? id : [id]
    localDb.saveAlerts(localDb.alerts().map((alert) => (ids.includes(alert.id) ? { ...alert, dismissed: true } : alert)))
    return enrich()
  },
  async dismissAll() {
    localDb.saveAlerts(localDb.alerts().map((alert) => ({ ...alert, dismissed: true })))
    return []
  },
  async runCheck() {
    return enrich()
  }
}
