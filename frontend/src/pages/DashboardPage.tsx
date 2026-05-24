import { useMemo, useState } from 'react'
import { Item, ItemType } from '@shared/types'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { FilterBar } from '@/components/dashboard/FilterBar'
import { InventoryTable } from '@/components/dashboard/InventoryTable'
import { SummaryCards } from '@/components/dashboard/SummaryCards'
import { SearchBar } from '@/components/common/SearchBar'
import { EmptyState } from '@/components/common/EmptyState'
import { InventoryFilter } from '@/config/constants'
import { useInventory } from '@/hooks/useInventory'
import { useSettingsStore } from '@/store/settingsStore'
import { isExpiringSoon } from '@/utils/dateUtils'
import { calculateReorder } from '@/utils/reorderCalculator'

export default function DashboardPage() {
  const { items, logsByItem, removeItem } = useInventory()
  const settings = useSettingsStore()
  const [filter, setFilter] = useState<InventoryFilter>('all')
  const [search, setSearch] = useState('')
  const [pendingDelete, setPendingDelete] = useState<Item | null>(null)
  const medicineCount = items.filter((item) => item.itemType === ItemType.MEDICINE).length
  const medicineThreshold = Math.max(settings.medicineThreshold, 1)
  const thresholdReached = medicineCount >= medicineThreshold

  const filtered = useMemo(
    () =>
      items.filter((item) => {
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.category.toLowerCase().includes(search.toLowerCase())
        const matchesFilter =
          filter === 'all' ||
          (filter === 'medicine' && item.itemType === ItemType.MEDICINE) ||
          (filter === 'equipment' && item.itemType === ItemType.EQUIPMENT) ||
          (filter === 'low-stock' && item.currentQty < item.minQty) ||
          (filter === 'expiring' && isExpiringSoon(item.expiryDate, 30)) ||
          (filter === 'reorder' && calculateReorder(item, logsByItem[item.id] ?? [], settings).suggestedReorderQty > 0)
        return matchesSearch && matchesFilter
      }),
    [filter, items, logsByItem, search, settings]
  )

  return (
    <div className="grid gap-6">
      {thresholdReached ? (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-950">
          <span className="font-semibold">Medicine threshold reached:</span> {medicineCount} medicines are tracked against a limit of {medicineThreshold}.
        </div>
      ) : null}
      <SummaryCards items={items} logsByItem={logsByItem} />
      <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
        <SearchBar value={search} onChange={setSearch} />
        <FilterBar value={filter} onChange={setFilter} />
      </div>
      {filtered.length > 0 ? (
        <InventoryTable items={filtered} logsByItem={logsByItem} onDelete={setPendingDelete} />
      ) : (
        <EmptyState title="No matching inventory" />
      )}
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete item"
        body={pendingDelete ? `This removes ${pendingDelete.name} and its stock history from this device.` : ''}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) return
          void removeItem(pendingDelete.id).then(() => setPendingDelete(null))
        }}
      />
    </div>
  )
}
