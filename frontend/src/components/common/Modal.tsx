import { ReactNode } from 'react'
import { Button } from './Button'

const sizes = {
  md: 'max-w-xl',
  lg: 'max-w-2xl',
  xl: 'max-w-3xl'
} as const

export function Modal({
  title,
  subtitle,
  open,
  onClose,
  size = 'md',
  footer,
  children
}: {
  title: string
  subtitle?: string
  open: boolean
  onClose: () => void
  size?: keyof typeof sizes
  footer?: ReactNode
  children: ReactNode
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/40 p-4">
      <div className={`flex max-h-[90vh] w-full ${sizes[size]} flex-col rounded-lg bg-white shadow-xl`}>
        <div className="flex items-start justify-between border-b border-gray-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-950">{title}</h2>
            {subtitle ? <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p> : null}
          </div>
          <Button variant="ghost" onClick={onClose} aria-label="Close modal">
            X
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {footer ? <div className="border-t border-gray-200 px-5 py-4">{footer}</div> : null}
      </div>
    </div>
  )
}
