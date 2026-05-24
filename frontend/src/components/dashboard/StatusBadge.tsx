import { Item, StockLog, UserSettings } from '@shared/types'
import { Badge } from '@/components/common/Badge'
import { isExpired, isExpiringSoon } from '@/utils/dateUtils'
import { stockStatus } from '@/utils/reorderCalculator'

export function StatusBadge({ item, logs, settings }: { item: Item; logs: StockLog[]; settings: UserSettings }) {
  if (isExpired(item.expiryDate)) return <Badge tone="red">Expired</Badge>
  if (item.currentQty <= 0) return <Badge tone="red">Critical</Badge>
  if (isExpiringSoon(item.expiryDate, 7)) return <Badge tone="red">Expires soon</Badge>
  if (item.currentQty < item.minQty) return <Badge tone="yellow">Low stock</Badge>
  if (stockStatus(item, logs, settings) === 'low') return <Badge tone="yellow">Reorder due</Badge>
  if (isExpiringSoon(item.expiryDate, 30)) return <Badge tone="yellow">Expiring</Badge>
  return <Badge tone="green">Adequate</Badge>
}
