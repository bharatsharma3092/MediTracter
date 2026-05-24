import { Link } from 'react-router-dom'
import { Item } from '@shared/types'
import { formatDate } from '@/utils/dateUtils'
import { formatQty } from '@/utils/formatters'

export function ItemCard({ item }: { item: Item }) {
  return (
    <Link to={`/inventory/${item.id}`} className="block rounded-lg border border-gray-200 bg-white p-4 hover:border-primary-300">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-gray-950">{item.name}</p>
          <p className="text-sm text-gray-500">{item.category}</p>
        </div>
        <p className="text-sm font-semibold text-gray-900">{formatQty(item.currentQty, item.unit)}</p>
      </div>
      <p className="mt-3 text-xs text-gray-500">Expiry {formatDate(item.expiryDate)}</p>
    </Link>
  )
}
