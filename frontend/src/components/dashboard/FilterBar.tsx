import { FILTERS, InventoryFilter } from '@/config/constants'

export function FilterBar({ value, onChange }: { value: InventoryFilter; onChange: (value: InventoryFilter) => void }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {FILTERS.map((filter) => (
        <button
          key={filter.id}
          className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-semibold ${
            value === filter.id ? 'bg-primary-700 text-white' : 'bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50'
          }`}
          onClick={() => onChange(filter.id)}
        >
          {filter.label}
        </button>
      ))}
    </div>
  )
}
