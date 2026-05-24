import { create } from 'zustand'
import { Item } from '@shared/types'

interface InventoryState {
  items: Item[]
  isLoading: boolean
  error: string | null
  selectedItem: Item | null
  setItems: (items: Item[]) => void
  addItem: (item: Item) => void
  updateItem: (item: Item) => void
  removeItem: (id: string) => void
  setSelectedItem: (item: Item | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useInventoryStore = create<InventoryState>((set) => ({
  items: [],
  isLoading: false,
  error: null,
  selectedItem: null,
  setItems: (items) => set({ items }),
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  updateItem: (item) =>
    set((state) => ({
      items: state.items.map((i) => (i.id === item.id ? item : i)),
      selectedItem: state.selectedItem?.id === item.id ? item : state.selectedItem
    })),
  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
      selectedItem: state.selectedItem?.id === id ? null : state.selectedItem
    })),
  setSelectedItem: (item) => set({ selectedItem: item }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error })
}))