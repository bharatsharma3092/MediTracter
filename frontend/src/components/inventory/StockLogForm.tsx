import { FormEvent, useState } from 'react'
import { Item, LogType, StockLogCreateInput } from '@shared/types'
import { Button } from '@/components/common/Button'
import { Field, Input, Select, Textarea } from '@/components/common/Input'

export function StockLogForm({ item, onSubmit }: { item: Item; onSubmit: (input: StockLogCreateInput) => Promise<void> }) {
  const [isSaving, setSaving] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setSaving(true)
    await onSubmit({
      itemId: item.id,
      qtyChange: Number(form.get('qtyChange')),
      logType: String(form.get('logType')) as LogType,
      notes: String(form.get('notes') || '') || null
    })
    setSaving(false)
    event.currentTarget.reset()
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Action">
          <Select name="logType" defaultValue={LogType.CONSUMPTION}>
            <option value={LogType.INTAKE}>Stock intake</option>
            <option value={LogType.CONSUMPTION}>Consumption</option>
            <option value={LogType.EXPIRED}>Expired</option>
            <option value={LogType.DISCARDED}>Discarded</option>
          </Select>
        </Field>
        <Field label={`Quantity (${item.unit})`}>
          <Input name="qtyChange" type="number" min="0.1" step="0.1" required />
        </Field>
      </div>
      <Field label="Notes">
        <Textarea name="notes" />
      </Field>
      <div className="flex justify-end">
        <Button type="submit" disabled={isSaving}>
          Log stock change
        </Button>
      </div>
    </form>
  )
}
