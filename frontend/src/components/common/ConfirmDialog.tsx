import { Modal } from './Modal'
import { Button } from './Button'

export function ConfirmDialog({
  open,
  title,
  body,
  onCancel,
  onConfirm
}: {
  open: boolean
  title: string
  body: string
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <Modal title={title} open={open} onClose={onCancel}>
      <p className="text-sm text-gray-600">{body}</p>
      <div className="mt-5 flex justify-end gap-3">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Delete
        </Button>
      </div>
    </Modal>
  )
}
