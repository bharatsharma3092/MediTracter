import { useEffect, useState } from 'react'
import { FullInventoryRow, ReorderListItem } from '@shared/types'
import { Button } from '@/components/common/Button'
import { EmptyState } from '@/components/common/EmptyState'
import { InventorySnapshot } from '@/components/reports/InventorySnapshot'
import { ReorderTable } from '@/components/reports/ReorderTable'
import { useExport } from '@/hooks/useExport'
import { reportService } from '@/services/reportService'

export default function ReportsPage() {
  const [tab, setTab] = useState<'reorder' | 'inventory'>('reorder')
  const [reorderRows, setReorderRows] = useState<ReorderListItem[]>([])
  const [inventoryRows, setInventoryRows] = useState<FullInventoryRow[]>([])
  const exporter = useExport()

  useEffect(() => {
    void Promise.all([reportService.reorder(), reportService.inventory()]).then(([reorder, inventory]) => {
      setReorderRows(reorder)
      setInventoryRows(inventory)
    })
  }, [])

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <Button variant={tab === 'reorder' ? 'primary' : 'secondary'} onClick={() => setTab('reorder')}>
            Reorder list
          </Button>
          <Button variant={tab === 'inventory' ? 'primary' : 'secondary'} onClick={() => setTab('inventory')}>
            Full inventory
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => void (tab === 'reorder' ? exporter.exportReorderPdf() : exporter.exportInventoryPdf())}>
            PDF
          </Button>
          <Button variant="secondary" onClick={() => void (tab === 'reorder' ? exporter.exportReorderXlsx() : exporter.exportInventoryXlsx())}>
            Excel
          </Button>
          <Button variant="secondary" onClick={() => void (tab === 'reorder' ? exporter.exportReorderCsv() : exporter.exportInventoryCsv())}>
            CSV
          </Button>
        </div>
      </div>
      {tab === 'reorder' ? (
        reorderRows.length > 0 ? <ReorderTable items={reorderRows} /> : <EmptyState title="Nothing to reorder" />
      ) : (
        <InventorySnapshot items={inventoryRows} />
      )}
    </div>
  )
}
