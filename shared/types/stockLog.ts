export enum LogType {
  INTAKE = 'INTAKE',
  CONSUMPTION = 'CONSUMPTION',
  EXPIRED = 'EXPIRED',
  DISCARDED = 'DISCARDED'
}

export interface StockLog {
  id: string
  itemId: string
  date: string
  qtyChange: number
  logType: LogType
  notes: string | null
}

export interface StockLogCreateInput {
  itemId: string
  qtyChange: number
  logType: LogType
  notes?: string | null
}

export interface StockLogWithItem extends StockLog {
  itemName: string
}