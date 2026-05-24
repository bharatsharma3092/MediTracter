export type ItemType = 'MEDICINE' | 'EQUIPMENT'
export type LogType = 'INTAKE' | 'CONSUMPTION' | 'EXPIRED' | 'DISCARDED'
export type AlertType = 'LOW_STOCK' | 'EXPIRY_30' | 'EXPIRY_15' | 'EXPIRY_7' | 'REORDER_DUE'

export interface UserSettings {
  coverMonths: number
  consumptionWindow: number
  leadTimeDays: number
  bufferDays: number
  pushEnabled: boolean
  emailEnabled: boolean
}

export interface Item {
  id: string
  userId: string
  name: string
  itemType: ItemType
  category: string
  unit: string
  currentQty: number
  minQty: number
  reorderQty: number | null
  expiryDate: string | null
  dosageSchedule: string | null
  prescriptionReq: boolean
  storageCondition: string | null
  assignedTo: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface StockLog {
  id: string
  itemId: string
  date: string
  qtyChange: number
  logType: LogType
  notes: string | null
}

export interface Alert {
  id: string
  itemId: string
  alertType: AlertType
  triggeredAt: string
  dismissed: boolean
}

export interface RequestUser {
  id: string
  email: string
}
