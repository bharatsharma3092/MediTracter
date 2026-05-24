import { useCallback, useEffect, useState } from 'react'
import { ItemCreateInput, ItemUpdateInput, StockLog, StockLogCreateInput } from '@shared/types'
import { useInventoryStore } from '@/store/inventoryStore'
import { inventoryService } from '@/services/inventoryService'
import { stockLogService } from '@/services/stockLogService'

export function useInventory() {
  const store = useInventoryStore()
  const [logsByItem, setLogsByItem] = useState<Record<string, StockLog[]>>({})

  const refresh = useCallback(async () => {
    store.setLoading(true)
    try {
      const items = await inventoryService.list()
      store.setItems(items)
      const pairs = await Promise.all(items.map(async (item) => [item.id, await stockLogService.list(item.id)] as const))
      setLogsByItem(Object.fromEntries(pairs))
      store.setError(null)
    } catch (error) {
      store.setError(error instanceof Error ? error.message : 'Unable to load inventory')
    } finally {
      store.setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
    const listener = () => void refresh()
    window.addEventListener('meditrack-data-change', listener)
    return () => window.removeEventListener('meditrack-data-change', listener)
  }, [refresh])

  return {
    ...store,
    logsByItem,
    refresh,
    createItem: async (input: ItemCreateInput) => {
      const item = await inventoryService.create(input)
      store.addItem(item)
      await refresh()
      return item
    },
    updateItem: async (id: string, input: ItemUpdateInput) => {
      const item = await inventoryService.update(id, input)
      if (item) store.updateItem(item)
      await refresh()
      return item
    },
    removeItem: async (id: string) => {
      await inventoryService.remove(id)
      store.removeItem(id)
      await refresh()
    },
    addStockLog: async (input: StockLogCreateInput) => {
      const log = await stockLogService.create(input)
      await refresh()
      return log
    },
    removeStockLog: async (id: string) => {
      await stockLogService.remove(id)
      await refresh()
    }
  }
}
