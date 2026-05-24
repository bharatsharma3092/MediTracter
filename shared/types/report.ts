import { Item } from './item'

export interface ReorderListItem {
  itemId: string
  itemName: string
  category: string
  currentStock: number
  qtyToOrder: number
  unit: string
  expiryDate: string | null
  notes: string | null
  consumptionRate?: number
  daysOfStockLeft?: number
}

export interface ReorderReport {
  id: string
  generatedAt: string
  items: ReorderListItem[]
  status: 'draft' | 'exported'
}

export interface FullInventoryRow extends Item {
  lastUpdated: string
  consumptionLast30Days?: number
  daysOfStockRemaining?: number
}

export interface InventoryReport {
  generatedAt: string
  items: FullInventoryRow[]
  totalItems: number
  lowStockCount: number
  expiringCount: number
}

export interface ReportHistoryItem {
  id: string
  generatedAt: string
  type: 'reorder' | 'inventory'
  status: 'draft' | 'exported'
  itemCount: number
}