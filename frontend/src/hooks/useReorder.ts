import { Item, StockLog } from '@shared/types'
import { useSettingsStore } from '@/store/settingsStore'
import { calculateReorder } from '@/utils/reorderCalculator'

export function useReorder() {
  const settings = useSettingsStore()
  return {
    calculate: (item: Item, logs: StockLog[]) => calculateReorder(item, logs, settings)
  }
}
