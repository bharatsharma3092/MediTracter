import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/common/Button'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { EmptyState } from '@/components/common/EmptyState'
import { Modal } from '@/components/common/Modal'
import { ItemDetail } from '@/components/inventory/ItemDetail'
import { StockLogForm } from '@/components/inventory/StockLogForm'
import { StockLogList } from '@/components/inventory/StockLogList'
import { useInventory } from '@/hooks/useInventory'

export default function ItemDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { items, logsByItem, addStockLog, removeStockLog, removeItem } = useInventory()
  const [logOpen, setLogOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const item = useMemo(() => items.find((entry) => entry.id === id), [id, items])

  if (!item) return <EmptyState title="Item not found">The item may have been deleted or has not finished loading.</EmptyState>
  const logs = logsByItem[item.id] ?? []

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap justify-end gap-3">
        <Button variant="secondary" onClick={() => setLogOpen(true)}>
          Log stock
        </Button>
        <Link to={`/inventory/${item.id}/edit`}>
          <Button variant="secondary">Edit</Button>
        </Link>
        <Button variant="danger" onClick={() => setDeleteOpen(true)}>
          Delete
        </Button>
      </div>
      <ItemDetail item={item} logs={logs} />
      <section className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="font-semibold text-gray-950">Audit log</h2>
        </div>
        <div className="p-5">
          <StockLogList logs={logs} unit={item.unit} onDelete={(logId) => void removeStockLog(logId)} />
        </div>
      </section>
      <Modal title={`Log stock for ${item.name}`} open={logOpen} onClose={() => setLogOpen(false)}>
        <StockLogForm
          item={item}
          onSubmit={async (input) => {
            await addStockLog(input)
            setLogOpen(false)
          }}
        />
      </Modal>
      <ConfirmDialog
        open={deleteOpen}
        title="Delete item"
        body="This removes the item and its stock history from this device."
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() => {
          void removeItem(item.id).then(() => navigate('/inventory'))
        }}
      />
    </div>
  )
}
