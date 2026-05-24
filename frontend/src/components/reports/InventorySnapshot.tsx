import { FullInventoryRow } from '@shared/types'
import { formatDate } from '@/utils/dateUtils'
import { formatQty } from '@/utils/formatters'

export function InventorySnapshot({ items }: { items: FullInventoryRow[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Used 30d</th>
              <th className="px-4 py-3">Days left</th>
              <th className="px-4 py-3">Expiry</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 font-semibold text-gray-950">{item.name}</td>
                <td className="px-4 py-3">{item.itemType}</td>
                <td className="px-4 py-3">{formatQty(item.currentQty, item.unit)}</td>
                <td className="px-4 py-3">{formatQty(item.consumptionLast30Days ?? 0, item.unit)}</td>
                <td className="px-4 py-3">{item.daysOfStockRemaining === undefined ? '-' : item.daysOfStockRemaining.toFixed(1)}</td>
                <td className="px-4 py-3">{formatDate(item.expiryDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
