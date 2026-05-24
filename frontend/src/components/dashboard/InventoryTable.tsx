import { Link } from 'react-router-dom'
import { Item, ItemType, StockLog } from '@shared/types'
import { StatusBadge } from './StatusBadge'
import { formatDate } from '@/utils/dateUtils'
import { formatItemType, formatQty } from '@/utils/formatters'
import { useSettingsStore } from '@/store/settingsStore'
import { calculateReorder } from '@/utils/reorderCalculator'

export function InventoryTable({
  items,
  logsByItem,
  onDelete
}: {
  items: Item[]
  logsByItem: Record<string, StockLog[]>
  onDelete: (item: Item) => void
}) {
  const settings = useSettingsStore()
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Expiry</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item) => {
              const logs = logsByItem[item.id] ?? []
              const reorder = calculateReorder(item, logs, settings)
              return (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link to={`/inventory/${item.id}`} className="font-semibold text-gray-950 hover:text-primary-800">
                      {item.name}
                    </Link>
                    <p className="text-xs text-gray-500">{item.category}</p>
                  </td>
                  <td className="px-4 py-3">{formatItemType(item.itemType)}</td>
                  <td className="px-4 py-3">{formatQty(item.currentQty, item.unit)}</td>
                  <td className="px-4 py-3">{item.itemType === ItemType.MEDICINE ? formatDate(item.expiryDate) : '-'}</td>
                  <td className="px-4 py-3">
                    <StatusBadge item={item} logs={logs} settings={settings} />
                  </td>
                  <td className="px-4 py-3">{reorder.suggestedReorderQty > 0 ? formatQty(reorder.suggestedReorderQty, item.unit) : '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => onDelete(item)}
                      className="rounded-md px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
