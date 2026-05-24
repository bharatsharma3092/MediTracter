import { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-gray-700">
      <span>{label}</span>
      {children}
    </label>
  )
}

const controlClass =
  'min-h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-primary-600 focus:ring-2 focus:ring-primary-100'

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${controlClass} ${props.className ?? ''}`} {...props} />
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`${controlClass} ${props.className ?? ''}`} {...props} />
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${controlClass} min-h-24 ${props.className ?? ''}`} {...props} />
}
