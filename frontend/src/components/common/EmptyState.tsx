import { ReactNode } from 'react'

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-gray-300 bg-white px-6 py-10 text-center">
      <h3 className="text-base font-semibold text-gray-950">{title}</h3>
      {children ? <p className="mt-2 text-sm text-gray-600">{children}</p> : null}
    </div>
  )
}
