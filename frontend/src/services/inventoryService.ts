import { Item, ItemCreateInput, ItemUpdateInput } from '@shared/types'
import { localDb, generateAlerts } from './localDb'

function normalizeInput(input: ItemCreateInput): Item {
  const now = new Date().toISOString()
  return {
    id: localDb.createId('item'),
    userId: localDb.userId,
    name: input.name.trim(),
    itemType: input.itemType,
    category: input.category,
    unit: input.unit,
    currentQty: Number(input.currentQty),
    minQty: Number(input.minQty),
    reorderQty: null,
    expiryDate: input.expiryDate ? new Date(input.expiryDate).toISOString() : null,
    dosageSchedule: input.dosageSchedule ?? null,
    prescriptionReq: Boolean(input.prescriptionReq),
    storageCondition: input.storageCondition ?? null,
    assignedTo: input.assignedTo?.trim() || null,
    notes: input.notes?.trim() || null,
    createdAt: now,
    updatedAt: now
  }
}

export const inventoryService = {
  async list() {
    return localDb.items().sort((a, b) => a.name.localeCompare(b.name))
  },
  async get(id: string) {
    return localDb.items().find((item) => item.id === id) ?? null
  },
  async create(input: ItemCreateInput) {
    const item = normalizeInput(input)
    localDb.saveItems([...localDb.items(), item])
    generateAlerts()
    return item
  },
  async update(id: string, input: ItemUpdateInput) {
    let updated: Item | null = null
    const items = localDb.items().map((item) => {
      if (item.id !== id) return item
      updated = {
        ...item,
        ...input,
        currentQty: input.currentQty === undefined ? item.currentQty : Number(input.currentQty),
        minQty: input.minQty === undefined ? item.minQty : Number(input.minQty),
        expiryDate: input.expiryDate === undefined ? item.expiryDate : input.expiryDate ? new Date(input.expiryDate).toISOString() : null,
        assignedTo: input.assignedTo === undefined ? item.assignedTo : input.assignedTo?.trim() || null,
        notes: input.notes === undefined ? item.notes : input.notes?.trim() || null,
        updatedAt: new Date().toISOString()
      }
      return updated
    })
    localDb.saveItems(items)
    generateAlerts()
    return updated
  },
  async remove(id: string) {
    localDb.saveItems(localDb.items().filter((item) => item.id !== id))
    localDb.saveLogs(localDb.logs().filter((log) => log.itemId !== id))
    localDb.saveAlerts(localDb.alerts().filter((alert) => alert.itemId !== id))
  }
}
