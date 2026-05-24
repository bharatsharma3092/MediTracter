export enum AlertType {
  LOW_STOCK = 'LOW_STOCK',
  EXPIRY_30 = 'EXPIRY_30',
  EXPIRY_15 = 'EXPIRY_15',
  EXPIRY_7 = 'EXPIRY_7',
  REORDER_DUE = 'REORDER_DUE'
}

export interface Alert {
  id: string
  itemId: string
  alertType: AlertType
  triggeredAt: string
  dismissed: boolean
}

export interface AlertWithItem extends Alert {
  itemName: string
  itemType: string
  currentQty: number
  minQty: number
  expiryDate: string | null
}

export interface AlertCheckResult {
  newAlerts: AlertType[]
  existingAlerts: AlertType[]
}