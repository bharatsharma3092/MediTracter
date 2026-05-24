import { ReorderListItem } from '@shared/types'
import { formatDate } from '@/utils/dateUtils'
import { formatQty } from '@/utils/formatters'

export function ReorderTable({ items }: { items: ReorderListItem[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3">Current</th>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Expiry</th>
              <th className="px-4 py-3">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item) => (
              <tr key={item.itemId}>
                <td className="px-4 py-3">
                  <p className="font-semibold text-gray-950">{item.itemName}</p>
                  <p className="text-xs text-gray-500">{item.category}</p>
                </td>
                <td className="px-4 py-3">{formatQty(item.currentStock, item.unit)}</td>
                <td className="px-4 py-3 font-semibold text-gray-950">{formatQty(item.qtyToOrder, item.unit)}</td>
                <td className="px-4 py-3">{formatDate(item.expiryDate)}</td>
                <td className="px-4 py-3">{item.notes ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
