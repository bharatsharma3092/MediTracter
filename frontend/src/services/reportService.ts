import { FullInventoryRow, ReorderListItem } from '@shared/types'
import { localDb } from './localDb'
import { calculateConsumptionRate, calculateReorder } from '@/utils/reorderCalculator'
import { useSettingsStore } from '@/store/settingsStore'

export const reportService = {
  async reorder(): Promise<ReorderListItem[]> {
    const settings = useSettingsStore.getState()
    const logs = localDb.logs()
    return localDb
      .items()
      .map((item) => {
        const itemLogs = logs.filter((log) => log.itemId === item.id)
        const reorder = calculateReorder(item, itemLogs, settings)
        return {
          itemId: item.id,
          itemName: item.name,
          category: item.category,
          currentStock: item.currentQty,
          qtyToOrder: reorder.suggestedReorderQty,
          unit: item.unit,
          expiryDate: item.expiryDate,
          notes: item.notes,
          consumptionRate: reorder.consumptionRate,
          daysOfStockLeft: reorder.daysOfStockLeft
        }
      })
      .filter((row) => row.qtyToOrder > 0)
  },
  async inventory(): Promise<FullInventoryRow[]> {
    const settings = useSettingsStore.getState()
    const logs = localDb.logs()
    return localDb.items().map((item) => {
      const itemLogs = logs.filter((log) => log.itemId === item.id)
      const rate = calculateConsumptionRate(itemLogs, 30)
      return {
        ...item,
        lastUpdated: item.updatedAt,
        consumptionLast30Days: rate * 30,
        daysOfStockRemaining: rate > 0 ? item.currentQty / rate : undefined,
        reorderQty: calculateReorder(item, itemLogs, settings).suggestedReorderQty
      }
    })
  }
}
