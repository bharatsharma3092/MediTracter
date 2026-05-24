export function toDateInput(value: string | null | undefined) {
  if (!value) return ''
  return new Date(value).toISOString().slice(0, 10)
}

export function formatDate(value: string | null | undefined) {
  if (!value) return '-'
  return new Intl.DateTimeFormat(undefined, { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value))
}

export function daysBetween(from: Date, to: Date) {
  const oneDay = 24 * 60 * 60 * 1000
  return Math.ceil((startOfDay(to).getTime() - startOfDay(from).getTime()) / oneDay)
}

export function daysUntilExpiry(value: string | null | undefined) {
  if (!value) return null
  return daysBetween(new Date(), new Date(value))
}

export function isExpiringSoon(value: string | null | undefined, threshold = 30) {
  const days = daysUntilExpiry(value)
  return days !== null && days >= 0 && days <= threshold
}

export function isExpired(value: string | null | undefined) {
  const days = daysUntilExpiry(value)
  return days !== null && days < 0
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}
