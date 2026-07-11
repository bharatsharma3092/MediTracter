import { useMemo, useState } from 'react'
import { ItemType, QuickListRow, SavedQuickList } from '@shared/types'
import { Button } from '@/components/common/Button'
import { Field, Input, Select } from '@/components/common/Input'
import { MedicineAutocomplete } from '@/components/common/MedicineAutocomplete'
import { Modal } from '@/components/common/Modal'
import { UNITS } from '@/config/constants'
import { useInventoryStore } from '@/store/inventoryStore'
import { quickListService } from '@/services/quickListService'
import { exportRowsCsv, exportRowsXlsx } from '@/utils/csvExporter'
import { exportQuickListPDF } from '@/utils/pdfExporter'
import { formatQty } from '@/utils/formatters'
import { formatDate } from '@/utils/dateUtils'

type View = 'build' | 'preview'

// Rows exported to CSV/Excel use friendly column headers.
function toExportRows(rows: QuickListRow[]) {
  return rows.map((row) => ({
    Medicine: row.name,
    Category: row.category,
    Quantity: row.requestedQty,
    Unit: row.unit
  }))
}

export function QuickListModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  // Read from the store directly — the inventory is already loaded by the
  // dashboard, so the modal never triggers its own fetch or change-listener.
  const items = useInventoryStore((state) => state.items)

  const [view, setView] = useState<View>('build')
  const [label, setLabel] = useState('')

  // Quantities keyed by inventory item id (string input so the field can be blank).
  const [invQty, setInvQty] = useState<Record<string, string>>({})

  // One-off medicines added from the full database.
  const [customRows, setCustomRows] = useState<QuickListRow[]>([])
  const [pendingMedicine, setPendingMedicine] = useState<{ name: string; category: string } | null>(null)
  const [pendingUnit, setPendingUnit] = useState<string>(UNITS[0])
  const [pendingQty, setPendingQty] = useState('')
  const [addError, setAddError] = useState('')

  // Built output + persistence. savedId tracks the persisted list this preview
  // maps to, so re-saving updates it instead of creating duplicates.
  const [builtRows, setBuiltRows] = useState<QuickListRow[]>([])
  const [savedId, setSavedId] = useState<string | null>(null)
  const [savedLists, setSavedLists] = useState<SavedQuickList[]>(() => quickListService.list())

  const medicines = useMemo(
    () =>
      items
        .filter((item) => item.itemType === ItemType.MEDICINE)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [items]
  )

  const selectedRows = useMemo<QuickListRow[]>(() => {
    const fromInventory = medicines
      .map((item): QuickListRow | null => {
        const qty = Number(invQty[item.id])
        if (!(qty > 0)) return null
        return {
          id: item.id,
          source: 'inventory',
          itemId: item.id,
          name: item.name,
          category: item.category,
          unit: item.unit,
          requestedQty: qty
        }
      })
      .filter((row): row is QuickListRow => row !== null)
    return [...fromInventory, ...customRows]
  }, [medicines, invQty, customRows])

  function reset() {
    setView('build')
    setLabel('')
    setInvQty({})
    setCustomRows([])
    setPendingMedicine(null)
    setPendingUnit(UNITS[0])
    setPendingQty('')
    setAddError('')
    setBuiltRows([])
    setSavedId(null)
  }

  function close() {
    reset()
    onClose()
  }

  function addCustom() {
    const qty = Number(pendingQty)
    const name = pendingMedicine?.name.trim() ?? ''
    if (!name || !(qty > 0)) return
    const lower = name.toLowerCase()
    if (medicines.some((m) => m.name.toLowerCase() === lower)) {
      setAddError('That medicine is already in the list above — set its quantity there.')
      return
    }
    if (customRows.some((r) => r.name.toLowerCase() === lower)) {
      setAddError('That medicine is already added below.')
      return
    }
    setCustomRows((rows) => [
      ...rows,
      quickListService.createRow({
        source: 'custom',
        name,
        category: pendingMedicine?.category || 'Medicine',
        unit: pendingUnit,
        requestedQty: qty
      })
    ])
    setPendingMedicine(null)
    setPendingUnit(UNITS[0])
    setPendingQty('')
    setAddError('')
  }

  function removeCustom(id: string) {
    setCustomRows((rows) => rows.filter((r) => r.id !== id))
  }

  function buildList() {
    if (selectedRows.length === 0) return
    setBuiltRows(selectedRows)
    setView('preview')
  }

  function saveCurrent() {
    if (builtRows.length === 0) return
    const entry = savedId
      ? quickListService.update(savedId, builtRows, label)
      : quickListService.save(builtRows, label)
    if (entry) setSavedId(entry.id)
    setSavedLists(quickListService.list())
  }

  function hydrateFromRows(rows: QuickListRow[]) {
    const medIds = new Set(medicines.map((m) => m.id))
    const nextQty: Record<string, string> = {}
    const nextCustom: QuickListRow[] = []
    for (const row of rows) {
      if (row.source === 'inventory' && row.itemId && medIds.has(row.itemId)) {
        nextQty[row.itemId] = String(row.requestedQty)
      } else {
        // Medicine no longer in inventory (or already custom) — keep it as a custom row.
        nextCustom.push(
          quickListService.createRow({
            source: 'custom',
            name: row.name,
            category: row.category,
            unit: row.unit,
            requestedQty: row.requestedQty
          })
        )
      }
    }
    setInvQty(nextQty)
    setCustomRows(nextCustom)
  }

  function loadSaved(list: SavedQuickList) {
    hydrateFromRows(list.rows)
    setLabel(list.label)
    setBuiltRows(list.rows)
    setSavedId(list.id)
    setView('preview')
  }

  function deleteSaved(id: string) {
    quickListService.remove(id)
    if (savedId === id) setSavedId(null)
    setSavedLists(quickListService.list())
  }

  const footer =
    view === 'build' ? (
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Input
          placeholder="List name (optional)"
          className="w-full max-w-xs"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{selectedRows.length} selected</span>
          <Button onClick={buildList} disabled={selectedRows.length === 0}>
            Build list
          </Button>
        </div>
      </div>
    ) : (
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setView('build')}>
            Back to edit
          </Button>
          <Button onClick={saveCurrent}>{savedId ? 'Update saved list' : 'Save list'}</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => exportQuickListPDF(builtRows, label)}>
            PDF
          </Button>
          <Button variant="secondary" onClick={() => exportRowsXlsx(toExportRows(builtRows), 'meditrack-quick-list.xlsx')}>
            Excel
          </Button>
          <Button variant="secondary" onClick={() => exportRowsCsv(toExportRows(builtRows), 'meditrack-quick-list.csv')}>
            CSV
          </Button>
        </div>
      </div>
    )

  return (
    <Modal
      open={open}
      onClose={close}
      size="xl"
      title="Quick needs list"
      subtitle="Pick saved medicines, type the quantity you need, and build a list — no stock math."
      footer={footer}
    >
      {view === 'build' ? (
        <div className="grid gap-6">
          <section className="grid gap-3">
            <h3 className="text-sm font-semibold text-gray-900">Saved medicines</h3>
            {medicines.length === 0 ? (
              <p className="rounded-md border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-500">
                No saved medicines yet. Add medicines to your inventory, or add one below.
              </p>
            ) : (
              <div className="divide-y divide-gray-100 rounded-md border border-gray-200">
                {medicines.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 px-4 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">
                        {item.category} · in stock {formatQty(item.currentQty, item.unit)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        step="0.1"
                        placeholder="Qty"
                        className="w-24"
                        value={invQty[item.id] ?? ''}
                        onChange={(e) => setInvQty((q) => ({ ...q, [item.id]: e.target.value }))}
                      />
                      <span className="w-12 text-xs text-gray-500">{item.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="grid gap-3">
            <h3 className="text-sm font-semibold text-gray-900">Add more medicine</h3>
            <div className="grid gap-3 rounded-md border border-gray-200 p-4">
              <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
                <Field label="Medicine">
                  <MedicineAutocomplete
                    name="quicklist-add"
                    clearOnSelect
                    onSelect={(medicine) => {
                      setPendingMedicine({ name: medicine.name, category: medicine.category || 'Medicine' })
                      setAddError('')
                    }}
                  />
                </Field>
                <Field label="Unit">
                  <Select value={pendingUnit} onChange={(e) => setPendingUnit(e.target.value)}>
                    {UNITS.map((unit) => (
                      <option key={unit}>{unit}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Quantity">
                  <Input
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="Qty"
                    className="w-28"
                    value={pendingQty}
                    onChange={(e) => setPendingQty(e.target.value)}
                  />
                </Field>
              </div>
              {pendingMedicine && (
                <p className="text-xs text-gray-600">
                  Selected: <span className="font-medium">{pendingMedicine.name}</span>
                </p>
              )}
              {addError && <p className="text-xs text-red-600">{addError}</p>}
              <div className="flex justify-end">
                <Button
                  variant="secondary"
                  onClick={addCustom}
                  disabled={!pendingMedicine || !(Number(pendingQty) > 0)}
                >
                  Add to list
                </Button>
              </div>
              {customRows.length > 0 && (
                <ul className="divide-y divide-gray-100 rounded-md border border-gray-200">
                  {customRows.map((row) => (
                    <li key={row.id} className="flex items-center gap-3 px-4 py-2 text-sm">
                      <span className="flex-1 truncate text-gray-900">{row.name}</span>
                      <span className="text-gray-600">{formatQty(row.requestedQty, row.unit)}</span>
                      <Button variant="ghost" onClick={() => removeCustom(row.id)} aria-label="Remove">
                        Remove
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {savedLists.length > 0 && (
            <section className="grid gap-3">
              <h3 className="text-sm font-semibold text-gray-900">Saved lists</h3>
              <ul className="divide-y divide-gray-100 rounded-md border border-gray-200">
                {savedLists.map((list) => (
                  <li key={list.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                    <button className="min-w-0 flex-1 text-left" onClick={() => loadSaved(list)}>
                      <span className="block truncate font-medium text-primary-700">{list.label}</span>
                      <span className="text-xs text-gray-500">
                        {list.rows.length} items · {formatDate(list.createdAt)}
                      </span>
                    </button>
                    <Button variant="ghost" onClick={() => deleteSaved(list.id)} aria-label="Delete">
                      Delete
                    </Button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Medicine</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Quantity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {builtRows.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-3 font-medium text-gray-950">{row.name}</td>
                  <td className="px-4 py-3 text-gray-600">{row.category}</td>
                  <td className="px-4 py-3 font-semibold text-gray-950">{formatQty(row.requestedQty, row.unit)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  )
}
