import { Item, ReorderCalculation, StockLog, LogType, UserSettings } from '@shared/types'

export function calculateConsumptionRate(logs: StockLog[], windowDays: number) {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - windowDays)

  const consumed = logs
    .filter((log) => log.logType === LogType.CONSUMPTION && new Date(log.date) >= cutoff)
    .reduce((sum, log) => sum + Math.abs(log.qtyChange), 0)

  return consumed / windowDays
}

export function calculateReorder(
  item: Item,
  logs: StockLog[],
  settings: Pick<UserSettings, 'coverMonths' | 'consumptionWindow' | 'leadTimeDays' | 'bufferDays'>
): ReorderCalculation {
  const consumptionRate = calculateConsumptionRate(logs, settings.consumptionWindow)
  const daysOfStockLeft = consumptionRate > 0 ? item.currentQty / consumptionRate : Number.POSITIVE_INFINITY
  const thresholdDays = settings.leadTimeDays + settings.bufferDays
  const stockBasedTrigger = item.currentQty <= item.minQty
  const reorderTrigger = stockBasedTrigger || daysOfStockLeft <= thresholdDays
  const calculatedQty = consumptionRate * settings.coverMonths * 30 - item.currentQty
  const minTopUp = Math.max(item.minQty - item.currentQty, 0)
  const suggestedReorderQty = Math.ceil(Math.max(calculatedQty, minTopUp, item.reorderQty ?? 0, 0))

  return {
    itemId: item.id,
    consumptionRate,
    daysOfStockLeft,
    reorderTrigger,
    suggestedReorderQty
  }
}

export function stockStatus(item: Item, logs: StockLog[], settings: UserSettings) {
  const reorder = calculateReorder(item, logs, settings)
  if (item.currentQty <= 0) return 'critical'
  if (item.currentQty < item.minQty || reorder.reorderTrigger) return 'low'
  return 'adequate'
}
