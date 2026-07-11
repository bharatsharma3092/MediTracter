import { QuickListRow, SavedQuickList } from '@shared/types'
import { localDb } from './localDb'

function storageKey(): string {
  // Reuse localDb's per-user id so quick lists are isolated per profile,
  // but keep an entirely separate storage key from inventory data.
  return `meditrack-quick-lists-${localDb.userId}`
}

function read(): SavedQuickList[] {
  const raw = localStorage.getItem(storageKey())
  if (!raw) return []
  try {
    return JSON.parse(raw) as SavedQuickList[]
  } catch {
    return []
  }
}

function persist(lists: SavedQuickList[]) {
  localStorage.setItem(storageKey(), JSON.stringify(lists))
}

export const quickListService = {
  list(): SavedQuickList[] {
    return read().sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  },
  /** Build a row with a stable id so callers never hand-roll keys. */
  createRow(row: Omit<QuickListRow, 'id'>): QuickListRow {
    return { ...row, id: localDb.createId('qlrow') }
  },
  save(rows: QuickListRow[], label: string): SavedQuickList {
    const entry: SavedQuickList = {
      id: localDb.createId('quicklist'),
      label: label.trim() || 'Quick list',
      createdAt: new Date().toISOString(),
      rows
    }
    persist([entry, ...read()])
    return entry
  },
  update(id: string, rows: QuickListRow[], label: string): SavedQuickList | null {
    let updated: SavedQuickList | null = null
    const lists = read().map((list) => {
      if (list.id !== id) return list
      updated = { ...list, rows, label: label.trim() || list.label }
      return updated
    })
    if (updated) persist(lists)
    return updated
  },
  remove(id: string) {
    persist(read().filter((list) => list.id !== id))
  }
}
