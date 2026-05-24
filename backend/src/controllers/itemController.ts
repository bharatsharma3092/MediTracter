import { Request, Response } from 'express'
import { z } from 'zod'
import { promises as fsPromises } from 'fs'
import { success, failure } from '../utils/responseHelper'
import { evaluateItem } from '../services/alertService'
import { calculateReorder } from '../services/reorderService'
import { id, getItems, getLogs, settings } from '../services/memoryStore'
import { ItemType } from '../types/domain'

const itemSchema = z.object({
  name: z.string().min(1),
  itemType: z.enum(['MEDICINE', 'EQUIPMENT']),
  category: z.string().min(1),
  unit: z.string().min(1),
  currentQty: z.coerce.number().min(0),
  minQty: z.coerce.number().min(0),
  expiryDate: z.string().nullable().optional(),
  dosageSchedule: z.string().nullable().optional(),
  prescriptionReq: z.boolean().optional(),
  storageCondition: z.string().nullable().optional(),
  assignedTo: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  reorderQty: z.coerce.number().nullable().optional()
})

export const itemController = {
  list(req: Request, res: Response) {
    const query = req.query
    const items = getItems(req.user.id)
    const result = items
      .filter((item) => (query.type ? item.itemType === String(query.type).toUpperCase() : true))
      .filter((item) => (query.search ? item.name.toLowerCase().includes(String(query.search).toLowerCase()) : true))
    return success(res, result)
  },
  create(req: Request, res: Response) {
    const input = itemSchema.parse(req.body)
    const now = new Date().toISOString()
    const item = {
      id: id('item'),
      userId: req.user.id,
      name: input.name,
      itemType: input.itemType as ItemType,
      category: input.category,
      unit: input.unit,
      currentQty: input.currentQty,
      minQty: input.minQty,
      reorderQty: input.reorderQty ?? null,
      expiryDate: input.expiryDate ?? null,
      dosageSchedule: input.dosageSchedule ?? null,
      prescriptionReq: input.prescriptionReq ?? false,
      storageCondition: input.storageCondition ?? null,
      assignedTo: input.assignedTo ?? null,
      notes: input.notes ?? null,
      createdAt: now,
      updatedAt: now
    }
    getItems(req.user.id).push(item)
    evaluateItem(item)
    return success(res, item, 'Item created', 201)
  },
  getOne(req: Request, res: Response) {
    const item = getItems(req.user.id).find((entry) => entry.id === req.params.id)
    if (!item) return failure(res, 'Item not found', 404)
    return success(res, { ...item, stockLogs: getLogs(req.user.id).filter((log) => log.itemId === item.id) })
  },
  update(req: Request, res: Response) {
    const items = getItems(req.user.id)
    const index = items.findIndex((entry) => entry.id === req.params.id)
    if (index < 0) return failure(res, 'Item not found', 404)
    const input = itemSchema.partial().parse(req.body)
    items[index] = { ...items[index], ...input, updatedAt: new Date().toISOString() }
    evaluateItem(items[index])
    return success(res, items[index], 'Item updated')
  },
  remove(req: Request, res: Response) {
    const items = getItems(req.user.id)
    const index = items.findIndex((entry) => entry.id === req.params.id)
    if (index < 0) return failure(res, 'Item not found', 404)
    items.splice(index, 1)
    const logs = getLogs(req.user.id)
    for (let i = logs.length - 1; i >= 0; i -= 1) {
      if (logs[i].itemId === req.params.id) logs.splice(i, 1)
    }
    return success(res, { id: req.params.id }, 'Item deleted')
  },
  reorderCalc(req: Request, res: Response) {
    const item = getItems(req.user.id).find((entry) => entry.id === req.params.id)
    if (!item) return failure(res, 'Item not found', 404)
    return success(res, calculateReorder(item, getLogs(req.user.id).filter((log) => log.itemId === item.id), settings))
  },
  async importLocal(req: Request, res: Response) {
    try {
      const { filePath } = req.body
      if (!filePath) {
        return failure(res, 'filePath parameter is required', 400)
      }
      let fileContent: string
      try {
        fileContent = await fsPromises.readFile(filePath, 'utf-8')
      } catch (err) {
        return failure(res, `Failed to read file at ${filePath}. Make sure the path is correct.`, 404)
      }
      let data: any
      try {
        data = JSON.parse(fileContent)
      } catch (err) {
        return failure(res, 'File is not a valid JSON document', 400)
      }
      if (!data || typeof data !== 'object') {
        return failure(res, 'Invalid backup data format', 400)
      }
      const medicines = data.medicines ?? []
      const users = data.users ?? []
      return success(res, { medicines, users, monthDuration: data.monthDuration, version: data.version }, 'Backup file read successfully')
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error importing local backup'
      return failure(res, msg, 500)
    }
  }
}
