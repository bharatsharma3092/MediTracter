export interface QuickListRow {
  id: string
  source: 'inventory' | 'custom'
  itemId?: string
  name: string
  category: string
  unit: string
  requestedQty: number
}

export interface SavedQuickList {
  id: string
  label: string
  createdAt: string
  rows: QuickListRow[]
}
