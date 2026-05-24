import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { EmptyState } from '@/components/common/EmptyState'
import { ItemForm } from '@/components/inventory/ItemForm'
import { useInventory } from '@/hooks/useInventory'

export default function EditItemPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { items, updateItem } = useInventory()
  const item = useMemo(() => items.find((entry) => entry.id === id), [id, items])

  if (!item) return <EmptyState title="Item not found" />
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <ItemForm
        item={item}
        onSubmit={async (input) => {
          await updateItem(item.id, input)
          navigate(`/inventory/${item.id}`)
        }}
      />
    </div>
  )
}
