import { Item, StockLog, UserSettings } from '../types/domain'

export function consumptionRate(logs: StockLog[], windowDays: number) {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - windowDays)
  const consumed = logs
    .filter((log) => log.logType === 'CONSUMPTION' && new Date(log.date) >= cutoff)
    .reduce((sum, log) => sum + Math.abs(log.qtyChange), 0)
  return consumed / windowDays
}

export function calculateReorder(item: Item, logs: StockLog[], settings: UserSettings) {
  const rate = consumptionRate(logs, settings.consumptionWindow)
  const daysOfStockLeft = rate > 0 ? item.currentQty / rate : Number.POSITIVE_INFINITY
  const reorderTrigger = item.currentQty < item.minQty || daysOfStockLeft <= settings.leadTimeDays + settings.bufferDays
  const suggestedReorderQty = Math.ceil(Math.max(rate * settings.coverMonths * 30 - item.currentQty, item.minQty - item.currentQty, item.reorderQty ?? 0, 0))

  return {
    itemId: item.id,
    consumptionRate: rate,
    daysOfStockLeft,
    reorderTrigger,
    suggestedReorderQty
  }
}
