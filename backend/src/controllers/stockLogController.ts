import { Request, Response } from 'express'
import { z } from 'zod'
import { evaluateItem } from '../services/alertService'
import { id, getItems, getLogs, signedQty } from '../services/memoryStore'
import { LogType } from '../types/domain'
import { failure, success } from '../utils/responseHelper'

const stockLogSchema = z.object({
  itemId: z.string(),
  qtyChange: z.coerce.number().positive(),
  logType: z.enum(['INTAKE', 'CONSUMPTION', 'EXPIRED', 'DISCARDED']),
  notes: z.string().nullable().optional()
})

export const stockLogController = {
  list(req: Request, res: Response) {
    const item = getItems(req.user.id).find((entry) => entry.id === req.params.itemId)
    if (!item) return failure(res, 'Item not found', 404)
    return success(res, getLogs(req.user.id).filter((log) => log.itemId === item.id))
  },
  create(req: Request, res: Response) {
    const input = stockLogSchema.parse(req.body)
    const item = getItems(req.user.id).find((entry) => entry.id === input.itemId)
    if (!item) return failure(res, 'Item not found', 404)
    const qtyChange = signedQty(input.logType as LogType, input.qtyChange)
    const log = { id: id('log'), itemId: item.id, date: new Date().toISOString(), qtyChange, logType: input.logType as LogType, notes: input.notes ?? null }
    getLogs(req.user.id).push(log)
    item.currentQty = Math.max(0, item.currentQty + qtyChange)
    item.updatedAt = new Date().toISOString()
    evaluateItem(item)
    return success(res, log, 'Stock log created', 201)
  },
  remove(req: Request, res: Response) {
    const logs = getLogs(req.user.id)
    const index = logs.findIndex((log) => log.id === req.params.id)
    if (index < 0) return failure(res, 'Stock log not found', 404)
    const log = logs[index]
    const item = getItems(req.user.id).find((entry) => entry.id === log.itemId)
    if (!item) return failure(res, 'Item not found', 404)
    item.currentQty = Math.max(0, item.currentQty - log.qtyChange)
    item.updatedAt = new Date().toISOString()
    logs.splice(index, 1)
    evaluateItem(item)
    return success(res, { id: req.params.id }, 'Stock log deleted')
  }
}
