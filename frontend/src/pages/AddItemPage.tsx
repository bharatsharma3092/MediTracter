import { useNavigate } from 'react-router-dom'
import { ItemForm } from '@/components/inventory/ItemForm'
import { useInventory } from '@/hooks/useInventory'

export default function AddItemPage() {
  const navigate = useNavigate()
  const { createItem } = useInventory()
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <ItemForm
        onSubmit={async (input) => {
          const item = await createItem(input)
          navigate(`/inventory/${item.id}`)
        }}
      />
    </div>
  )
}
