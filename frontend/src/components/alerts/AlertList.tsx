import { useMemo, useState } from 'react'
import { AlertWithItem, LogType } from '@shared/types'
import { Button } from '@/components/common/Button'
import { EmptyState } from '@/components/common/EmptyState'
import { formatDate } from '@/utils/dateUtils'
import { formatAlertType, formatQty } from '@/utils/formatters'
import { useInventory } from '@/hooks/useInventory'
import { useSettingsStore } from '@/store/settingsStore'
import { calculateReorder } from '@/utils/reorderCalculator'

export function AlertList({
  alerts,
  onDismiss
}: {
  alerts: AlertWithItem[]
  onDismiss: (id: string | string[]) => void
}) {
  const { items, logsByItem, addStockLog } = useInventory()
  const settings = useSettingsStore()

  // Track expanded state for each medicine group
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})

  // Track active Quick Intake state
  const [activeIntakeItemId, setActiveIntakeItemId] = useState<string | null>(null)
  const [intakeQty, setIntakeQty] = useState<string>('')
  const [intakeNotes, setIntakeNotes] = useState<string>('')

  // Group alerts by itemId
  const groupedAlerts = useMemo(() => {
    const map = new Map<string, AlertWithItem[]>()
    alerts.forEach((alert) => {
      if (!map.has(alert.itemId)) {
        map.set(alert.itemId, [])
      }
      map.get(alert.itemId)!.push(alert)
    })

    return Array.from(map.entries()).map(([itemId, list]) => {
      const first = list[0]
      return {
        itemId,
        itemName: first.itemName,
        currentQty: first.currentQty,
        minQty: first.minQty,
        expiryDate: first.expiryDate,
        alerts: list
      }
    })
  }, [alerts])

  const toggleExpand = (itemId: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId]
    }))
  }

  const handleOpenReorder = (itemId: string, defaultSuggestedQty: number) => {
    if (activeIntakeItemId === itemId) {
      setActiveIntakeItemId(null)
    } else {
      setActiveIntakeItemId(itemId)
      setIntakeQty(String(defaultSuggestedQty))
      setIntakeNotes('Quick Intake to resolve low stock alert')
    }
  }

  const handleIntakeSubmit = async (itemId: string) => {
    const qty = Number(intakeQty)
    if (isNaN(qty) || qty <= 0) {
      alert('Please enter a valid positive quantity.')
      return
    }

    try {
      await addStockLog({
        itemId,
        qtyChange: qty,
        logType: LogType.INTAKE,
        notes: intakeNotes.trim() || 'Reorder Intake from Alerts'
      })
      setActiveIntakeItemId(null)
      setIntakeQty('')
      setIntakeNotes('')
    } catch (err) {
      console.error('Error logging quick intake:', err)
      alert('Failed to log stock change. Please try again.')
    }
  }

  if (alerts.length === 0) {
    return (
      <EmptyState title="No active alerts">
        Your tracked stock is currently inside its configured thresholds.
      </EmptyState>
    )
  }

  return (
    <div className="grid gap-4">
      {groupedAlerts.map((group) => {
        const isExpanded = expandedItems[group.itemId] ?? false
        const isIntakeOpen = activeIntakeItemId === group.itemId
        const alertCount = group.alerts.length

        // Find the full Item object and compute reorder metrics
        const fullItem = items.find((it) => it.id === group.itemId)
        const itemLogs = logsByItem[group.itemId] ?? []
        const reorderMetrics = fullItem ? calculateReorder(fullItem, itemLogs, settings) : null
        const suggestedQty = reorderMetrics?.suggestedReorderQty ?? Math.max(group.minQty - group.currentQty, 5)

        // Dynamic styling: Critical if stock is 0, Warning if stock is low
        const isCritical = group.currentQty <= 0
        const cardBorderClass = isCritical ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-amber-500'
        const badgeColorClass = isCritical ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'

        return (
          <div
            key={group.itemId}
            className={`rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow transition ${cardBorderClass}`}
          >
            <div className="p-4 space-y-3">
              {/* Header row */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-gray-950">{group.itemName}</h3>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${badgeColorClass}`}>
                    {alertCount} {alertCount === 1 ? 'alert' : 'alerts'}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="primary"
                    onClick={() => handleOpenReorder(group.itemId, suggestedQty)}
                    className="min-h-9 text-xs py-1.5 px-3"
                  >
                    {isIntakeOpen ? 'Cancel' : 'Reorder'}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => onDismiss(group.alerts.map((a) => a.id))}
                    className="min-h-9 text-xs py-1.5 px-3"
                  >
                    Dismiss All
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => toggleExpand(group.itemId)}
                    className="min-h-9 w-9 p-0 flex items-center justify-center text-gray-500 hover:text-gray-900"
                    aria-label={isExpanded ? 'Collapse card' : 'Expand card'}
                  >
                    <span className="text-sm font-bold transition transform duration-200 inline-block">
                      {isExpanded ? '▲' : '▼'}
                    </span>
                  </Button>
                </div>
              </div>

              {/* Status summary */}
              <div className="text-xs text-gray-500 flex items-center gap-4">
                <span>
                  Current Stock:{' '}
                  <span className={`font-semibold ${isCritical ? 'text-red-600' : 'text-amber-600'}`}>
                    {formatQty(group.currentQty)}
                  </span>{' '}
                  / minimum {formatQty(group.minQty)} {fullItem?.unit || 'tablets'}
                </span>
                {group.expiryDate && (
                  <span className="border-l border-gray-200 pl-4">
                    Expires: <span className="font-medium text-gray-700">{formatDate(group.expiryDate)}</span>
                  </span>
                )}
              </div>

              {/* Collapsible alerts checklist */}
              {isExpanded && (
                <div className="mt-3 rounded-md bg-gray-50 p-3 space-y-2 border border-gray-100 text-xs">
                  <p className="font-bold text-gray-600 uppercase tracking-wide text-[10px]">Active Warnings</p>
                  <div className="divide-y divide-gray-200/60 space-y-2">
                    {group.alerts.map((alert) => (
                      <div key={alert.id} className="pt-2 first:pt-0 flex items-center justify-between gap-3">
                        <div className="flex items-start gap-2">
                          <span className="text-amber-500 shrink-0">⚠️</span>
                          <div>
                            <p className="font-semibold text-gray-900">{formatAlertType(alert.alertType)}</p>
                            <p className="text-gray-500 text-[11px] mt-0.5">
                              {alert.alertType === 'LOW_STOCK'
                                ? `Quantity is below safety limit of ${formatQty(alert.minQty)}.`
                                : alert.alertType === 'REORDER_DUE'
                                ? `Suggested top-up purchase is ${suggestedQty} ${fullItem?.unit || 'tablets'}.`
                                : `Medicine warning trigger active.`}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          onClick={() => onDismiss(alert.id)}
                          className="min-h-7 h-7 text-[10px] px-2 text-gray-500 hover:text-red-600"
                        >
                          Dismiss
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Inline Quick Intake Reorder Form */}
              {isIntakeOpen && (
                <div className="mt-3 rounded-md bg-sky-50/50 p-4 border border-sky-100 space-y-3">
                  <h4 className="text-xs font-bold text-sky-950 flex items-center gap-1.5">
                    <span>⚡</span> Quick Reorder Intake
                  </h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-sky-900 uppercase">Intake Quantity ({fullItem?.unit || 'tablets'})</label>
                      <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={intakeQty}
                        onChange={(e) => setIntakeQty(e.target.value)}
                        className="min-h-9 rounded-md border border-gray-300 bg-white px-3 py-1 text-xs ring-offset-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-medium"
                      />
                      <p className="text-[10px] text-sky-800">
                        Pre-filled with recommended top-up: <span className="font-semibold">{suggestedQty}</span>
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-sky-900 uppercase">Intake Notes (Optional)</label>
                      <input
                        type="text"
                        value={intakeNotes}
                        onChange={(e) => setIntakeNotes(e.target.value)}
                        placeholder="E.g. Received new shipment"
                        className="min-h-9 rounded-md border border-gray-300 bg-white px-3 py-1 text-xs ring-offset-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <Button
                      variant="ghost"
                      onClick={() => setActiveIntakeItemId(null)}
                      className="min-h-8 text-xs py-1 px-3 text-sky-900"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => handleIntakeSubmit(group.itemId)}
                      className="min-h-8 text-xs py-1 px-3 bg-sky-700 hover:bg-sky-800 text-white"
                    >
                      Confirm Intake
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
