import { Request, Response } from 'express'
import { consumptionRate, calculateReorder } from '../services/reorderService'
import { id, getItems, getLogs, reorderLists, settings } from '../services/memoryStore'
import { simplePdfBuffer } from '../services/pdfService'
import { success } from '../utils/responseHelper'

export const reportController = {
  reorder(req: Request, res: Response) {
    const items = getItems(req.user.id)
    const logs = getLogs(req.user.id)
    const rows = items
      .map((item) => {
        const calc = calculateReorder(item, logs.filter((log) => log.itemId === item.id), settings)
        return {
          itemId: item.id,
          itemName: item.name,
          category: item.category,
          currentStock: item.currentQty,
          qtyToOrder: calc.suggestedReorderQty,
          unit: item.unit,
          expiryDate: item.expiryDate,
          notes: item.notes,
          consumptionRate: calc.consumptionRate,
          daysOfStockLeft: calc.daysOfStockLeft
        }
      })
      .filter((row) => row.qtyToOrder > 0)
    const report = { id: id('reorder'), userId: req.user.id, generatedAt: new Date().toISOString(), items: rows, status: 'draft' as const }
    reorderLists.push(report)
    return success(res, report)
  },
  inventory(req: Request, res: Response) {
    const items = getItems(req.user.id)
    const logs = getLogs(req.user.id)
    const rows = items.map((item) => {
      const rate = consumptionRate(logs.filter((log) => log.itemId === item.id), 30)
      return {
        ...item,
        lastUpdated: item.updatedAt,
        consumptionLast30Days: rate * 30,
        daysOfStockRemaining: rate > 0 ? item.currentQty / rate : null
      }
    })
    return success(res, {
      generatedAt: new Date().toISOString(),
      items: rows,
      totalItems: rows.length,
      lowStockCount: rows.filter((item) => item.currentQty < item.minQty).length,
      expiringCount: rows.filter((item) => item.expiryDate && new Date(item.expiryDate).getTime() - Date.now() <= 30 * 86400000).length
    })
  },
  history(req: Request, res: Response) {
    return success(res, reorderLists.filter((report) => report.userId === req.user.id))
  },
  getPdf(req: Request, res: Response) {
    res.setHeader('content-type', 'application/pdf')
    res.send(simplePdfBuffer(`MediTrack report ${req.params.id}`))
  }
}
