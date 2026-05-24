import { AlertType, DosageSchedule, ItemType, LogType, StorageCondition } from '@shared/types'

export function formatQty(qty: number, unit?: string | null) {
  return `${Number.isInteger(qty) ? qty : qty.toFixed(1)}${unit ? ` ${unit}` : ''}`
}

export function formatItemType(type: ItemType | string) {
  return type === ItemType.MEDICINE ? 'Medicine' : 'Equipment'
}

export function formatDosage(value: DosageSchedule | null | undefined) {
  const labels: Record<string, string> = {
    ONCE: 'Once daily',
    TWICE: 'Twice daily',
    THRICE: 'Thrice daily',
    AS_NEEDED: 'As needed'
  }
  return value ? labels[value] ?? value : '-'
}

export function formatStorage(value: StorageCondition | null | undefined) {
  const labels: Record<string, string> = {
    ROOM_TEMP: 'Room temp',
    REFRIGERATED: 'Refrigerated'
  }
  return value ? labels[value] ?? value : '-'
}

export function formatLogType(value: LogType) {
  const labels: Record<LogType, string> = {
    [LogType.INTAKE]: 'Intake',
    [LogType.CONSUMPTION]: 'Consumption',
    [LogType.EXPIRED]: 'Expired',
    [LogType.DISCARDED]: 'Discarded'
  }
  return labels[value]
}

export function formatAlertType(value: AlertType) {
  const labels: Record<AlertType, string> = {
    [AlertType.LOW_STOCK]: 'Low stock',
    [AlertType.EXPIRY_30]: 'Expires within 30 days',
    [AlertType.EXPIRY_15]: 'Expires within 15 days',
    [AlertType.EXPIRY_7]: 'Expires within 7 days',
    [AlertType.REORDER_DUE]: 'Reorder due'
  }
  return labels[value]
}
