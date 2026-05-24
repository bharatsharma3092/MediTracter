import { Item, StockLog } from '@shared/types'
import { Badge } from '@/components/common/Badge'
import { formatDate } from '@/utils/dateUtils'
import { formatDosage, formatItemType, formatQty, formatStorage } from '@/utils/formatters'

export function ItemDetail({ item, logs }: { item: Item; logs: StockLog[] }) {
  const used = logs.filter((log) => log.qtyChange < 0).reduce((sum, log) => sum + Math.abs(log.qtyChange), 0)
  return (
    <section className="grid gap-4 rounded-lg border border-gray-200 bg-white p-5 md:grid-cols-3">
      <div>
        <p className="text-sm font-medium text-gray-500">Current stock</p>
        <p className="mt-1 text-2xl font-bold text-gray-950">{formatQty(item.currentQty, item.unit)}</p>
        <p className="mt-1 text-sm text-gray-500">Minimum {formatQty(item.minQty, item.unit)}</p>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">Classification</p>
        <p className="mt-1 font-semibold text-gray-950">{formatItemType(item.itemType)}</p>
        <p className="mt-1 text-sm text-gray-500">{item.category}</p>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">Use history</p>
        <p className="mt-1 font-semibold text-gray-950">{formatQty(used, item.unit)} logged</p>
        <p className="mt-1 text-sm text-gray-500">{logs.length} audit entries</p>
      </div>
      <div className="md:col-span-3 grid gap-3 border-t border-gray-100 pt-4 sm:grid-cols-2 lg:grid-cols-4">
        <Meta label="Expiry" value={formatDate(item.expiryDate)} />
        <Meta label="Dosage" value={formatDosage(item.dosageSchedule)} />
        <Meta label="Storage" value={formatStorage(item.storageCondition)} />
        <Meta label="Assigned to" value={item.assignedTo ?? '-'} />
      </div>
      <div className="md:col-span-3 flex flex-wrap gap-2">
        {item.prescriptionReq ? <Badge tone="blue">Rx required</Badge> : null}
        {item.notes ? <span className="text-sm text-gray-600">{item.notes}</span> : null}
      </div>
    </section>
  )
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-gray-900">{value}</p>
    </div>
  )
}
