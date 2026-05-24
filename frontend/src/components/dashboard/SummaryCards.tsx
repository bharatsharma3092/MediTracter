import { Item, ItemType, StockLog } from '@shared/types'
import { useSettingsStore } from '@/store/settingsStore'
import { isExpiringSoon } from '@/utils/dateUtils'
import { calculateReorder } from '@/utils/reorderCalculator'

export function SummaryCards({ items, logsByItem }: { items: Item[]; logsByItem: Record<string, StockLog[]> }) {
  const settings = useSettingsStore()
  const medicineCount = items.filter((item) => item.itemType === ItemType.MEDICINE).length
  const lowStock = items.filter((item) => item.currentQty < item.minQty).length
  const expiring = items.filter((item) => isExpiringSoon(item.expiryDate, 30)).length
  const reorder = items.filter((item) => calculateReorder(item, logsByItem[item.id] ?? [], settings).suggestedReorderQty > 0).length
  const threshold = Math.max(settings.medicineThreshold, 1)
  const thresholdRatio = medicineCount / threshold
  const medicineTone =
    thresholdRatio >= 1
      ? 'border-red-300 bg-red-50 text-red-950'
      : thresholdRatio >= 0.8
        ? 'border-amber-300 bg-amber-50 text-amber-950'
        : 'border-emerald-300 bg-emerald-50 text-emerald-950'
  const stats = [
    ['Total Items', items.length],
    ['Medicines', medicineCount, `Threshold ${threshold}`, medicineTone],
    ['Low Stock', lowStock],
    ['Expiring Soon', expiring],
    ['Pending Reorder', reorder]
  ]

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {stats.map(([label, value, helper, tone]) => (
        <div key={label} className={`rounded-lg border p-5 ${tone ?? 'border-gray-200 bg-white text-gray-950'}`}>
          <p className={`text-sm font-medium ${tone ? 'text-current' : 'text-gray-500'}`}>{label}</p>
          <p className="mt-2 text-3xl font-bold">{value}</p>
          {helper ? <p className="mt-1 text-xs font-semibold">{helper}</p> : null}
        </div>
      ))}
    </section>
  )
}
