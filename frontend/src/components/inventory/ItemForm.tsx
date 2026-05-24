import { FormEvent, useMemo, useState } from 'react'
import { DosageSchedule, Item, ItemCreateInput, ItemType, StorageCondition } from '@shared/types'
import { Button } from '@/components/common/Button'
import { Field, Input, Select, Textarea } from '@/components/common/Input'
import { MedicineAutocomplete } from '@/components/common/MedicineAutocomplete'
import { EQUIPMENT_CATEGORIES, MEDICINE_CATEGORIES, UNITS } from '@/config/constants'
import { toDateInput } from '@/utils/dateUtils'

export function ItemForm({
  item,
  onSubmit
}: {
  item?: Item
  onSubmit: (input: ItemCreateInput) => Promise<void>
}) {
  const [itemType, setItemType] = useState<ItemType>(item?.itemType ?? ItemType.MEDICINE)
  const [isSaving, setSaving] = useState(false)
  const categories = useMemo(() => (itemType === ItemType.MEDICINE ? MEDICINE_CATEGORIES : EQUIPMENT_CATEGORIES), [itemType])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setSaving(true)
    await onSubmit({
      name: String(form.get('name')),
      itemType,
      category: String(form.get('category')),
      unit: String(form.get('unit')),
      currentQty: Number(form.get('currentQty')),
      minQty: Number(form.get('minQty')),
      expiryDate: String(form.get('expiryDate') || '') || null,
      dosageSchedule: itemType === ItemType.MEDICINE ? (String(form.get('dosageSchedule')) as DosageSchedule) : null,
      prescriptionReq: form.get('prescriptionReq') === 'on',
      storageCondition: itemType === ItemType.MEDICINE ? (String(form.get('storageCondition')) as StorageCondition) : null,
      assignedTo: String(form.get('assignedTo') || '') || null,
      notes: String(form.get('notes') || '') || null
    })
    setSaving(false)
  }

  return (
    <form onSubmit={submit} className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Item name">
          <MedicineAutocomplete name="name" defaultValue={item?.name} required />
        </Field>
        <Field label="Type">
          <Select value={itemType} onChange={(event) => setItemType(event.target.value as ItemType)}>
            <option value={ItemType.MEDICINE}>Medicine</option>
            <option value={ItemType.EQUIPMENT}>Equipment</option>
          </Select>
        </Field>
        <Field label="Category">
          <Select name="category" defaultValue={item?.category ?? categories[0]} required>
            {categories.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </Select>
        </Field>
        <Field label="Unit">
          <Select name="unit" defaultValue={item?.unit ?? UNITS[0]} required>
            {UNITS.map((unit) => (
              <option key={unit}>{unit}</option>
            ))}
          </Select>
        </Field>
        <Field label="Current quantity">
          <Input name="currentQty" type="number" min="0" step="0.1" defaultValue={item?.currentQty ?? 0} required />
        </Field>
        <Field label="Minimum stock level">
          <Input name="minQty" type="number" min="0" step="0.1" defaultValue={item?.minQty ?? 1} required />
        </Field>
        <Field label="Expiry date">
          <Input name="expiryDate" type="date" defaultValue={toDateInput(item?.expiryDate)} disabled={itemType === ItemType.EQUIPMENT} />
        </Field>
        <Field label="Assigned to">
          <Input name="assignedTo" defaultValue={item?.assignedTo ?? ''} />
        </Field>
        {itemType === ItemType.MEDICINE ? (
          <>
            <Field label="Dosage schedule">
              <Select name="dosageSchedule" defaultValue={item?.dosageSchedule ?? DosageSchedule.AS_NEEDED}>
                <option value={DosageSchedule.ONCE}>Once daily</option>
                <option value={DosageSchedule.TWICE}>Twice daily</option>
                <option value={DosageSchedule.THRICE}>Thrice daily</option>
                <option value={DosageSchedule.AS_NEEDED}>As needed</option>
              </Select>
            </Field>
            <Field label="Storage">
              <Select name="storageCondition" defaultValue={item?.storageCondition ?? StorageCondition.ROOM_TEMP}>
                <option value={StorageCondition.ROOM_TEMP}>Room temp</option>
                <option value={StorageCondition.REFRIGERATED}>Refrigerated</option>
              </Select>
            </Field>
          </>
        ) : null}
      </div>
      <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
        <input type="checkbox" name="prescriptionReq" defaultChecked={item?.prescriptionReq ?? false} className="h-4 w-4 rounded border-gray-300" />
        Prescription required
      </label>
      <Field label="Notes">
        <Textarea name="notes" defaultValue={item?.notes ?? ''} />
      </Field>
      <div className="flex justify-end">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Saving' : 'Save item'}
        </Button>
      </div>
    </form>
  )
}
