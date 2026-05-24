import { LogType, StockLog, StockLogCreateInput } from '@shared/types'
import { localDb, generateAlerts } from './localDb'

export const stockLogService = {
  async list(itemId: string) {
    return localDb
      .logs()
      .filter((log) => log.itemId === itemId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  },
  async create(input: StockLogCreateInput) {
    const signedQty = input.logType === LogType.INTAKE ? Math.abs(input.qtyChange) : -Math.abs(input.qtyChange)
    const log: StockLog = {
      id: localDb.createId('log'),
      itemId: input.itemId,
      date: new Date().toISOString(),
      qtyChange: signedQty,
      logType: input.logType,
      notes: input.notes?.trim() || null
    }

    localDb.saveLogs([...localDb.logs(), log])
    localDb.saveItems(
      localDb.items().map((item) =>
        item.id === input.itemId
          ? { ...item, currentQty: Math.max(0, item.currentQty + signedQty), updatedAt: new Date().toISOString() }
          : item
      )
    )
    generateAlerts()
    return log
  },
  async remove(id: string) {
    const logs = localDb.logs()
    const log = logs.find((entry) => entry.id === id)
    if (!log) return
    localDb.saveLogs(logs.filter((entry) => entry.id !== id))
    localDb.saveItems(
      localDb.items().map((item) =>
        item.id === log.itemId
          ? { ...item, currentQty: Math.max(0, item.currentQty - log.qtyChange), updatedAt: new Date().toISOString() }
          : item
      )
    )
    generateAlerts()
  }
}
