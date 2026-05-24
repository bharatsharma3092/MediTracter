import { EquipmentCategory, MedicineCategory, Unit } from '@shared/types'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'

export const EXPIRY_ALERT_DAYS = [30, 15, 7] as const

export const MEDICINE_CATEGORIES = Object.values(MedicineCategory)
export const EQUIPMENT_CATEGORIES = Object.values(EquipmentCategory)
export const UNITS = Object.values(Unit)

export const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'medicine', label: 'Medicines' },
  { id: 'equipment', label: 'Equipment' },
  { id: 'low-stock', label: 'Low Stock' },
  { id: 'expiring', label: 'Expiring' },
  { id: 'reorder', label: 'Reorder' }
] as const

export type InventoryFilter = (typeof FILTERS)[number]['id']
