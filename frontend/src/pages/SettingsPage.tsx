import { FormEvent } from 'react'
import { Button } from '@/components/common/Button'
import { Field, Input, Select } from '@/components/common/Input'
import { useSettingsStore } from '@/store/settingsStore'

export default function SettingsPage() {
  const settings = useSettingsStore()

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    settings.updateSettings({
      coverMonths: Number(form.get('coverMonths')),
      consumptionWindow: Number(form.get('consumptionWindow')),
      leadTimeDays: Number(form.get('leadTimeDays')),
      bufferDays: Number(form.get('bufferDays')),
      medicineThreshold: Number(form.get('medicineThreshold')),
      pushEnabled: form.get('pushEnabled') === 'on',
      emailEnabled: form.get('emailEnabled') === 'on'
    })
  }

  return (
    <form onSubmit={submit} className="grid gap-5 rounded-lg border border-gray-200 bg-white p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Cover months">
          <Input name="coverMonths" type="number" min="1" max="12" defaultValue={settings.coverMonths} />
        </Field>
        <Field label="Consumption window">
          <Select name="consumptionWindow" defaultValue={settings.consumptionWindow}>
            <option value={30}>30 days</option>
            <option value={60}>60 days</option>
            <option value={90}>90 days</option>
          </Select>
        </Field>
        <Field label="Lead time days">
          <Input name="leadTimeDays" type="number" min="0" defaultValue={settings.leadTimeDays} />
        </Field>
        <Field label="Buffer days">
          <Input name="bufferDays" type="number" min="0" defaultValue={settings.bufferDays} />
        </Field>
        <Field label="Medicine count threshold">
          <Input name="medicineThreshold" type="number" min="1" defaultValue={settings.medicineThreshold} />
        </Field>
      </div>
      <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
        <input type="checkbox" name="pushEnabled" defaultChecked={settings.pushEnabled} className="h-4 w-4 rounded border-gray-300" />
        Push alerts enabled
      </label>
      <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
        <input type="checkbox" name="emailEnabled" defaultChecked={settings.emailEnabled} className="h-4 w-4 rounded border-gray-300" />
        Email alerts enabled
      </label>
      <div className="flex justify-end">
        <Button type="submit">Save settings</Button>
      </div>
    </form>
  )
}
