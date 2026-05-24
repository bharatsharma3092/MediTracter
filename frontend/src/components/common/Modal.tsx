import { ReactNode } from 'react'
import { Button } from './Button'

export function Modal({
  title,
  open,
  onClose,
  children
}: {
  title: string
  open: boolean
  onClose: () => void
  children: ReactNode
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/40 p-4">
      <div className="w-full max-w-xl rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-950">{title}</h2>
          <Button variant="ghost" onClick={onClose} aria-label="Close modal">
            X
          </Button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
