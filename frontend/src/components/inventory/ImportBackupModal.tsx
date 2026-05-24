import { useState, DragEvent, ChangeEvent } from 'react'
import { Modal } from '../common/Modal'
import { Button } from '../common/Button'
import { localDb, generateAlerts } from '@/services/localDb'
import { api } from '@/services/api'
import { Item, ItemType, DosageSchedule, StorageCondition, MedicineCategory } from '@shared/types'

interface BackupUser {
  id: string
  name: string
}

interface BackupMedicine {
  id?: string
  userId?: string
  name: string
  stock: number
  unit: string
  dailyDosage?: number
  updatedAt?: number
}

interface ImportBackupModalProps {
  open: boolean
  onClose: () => void
}

export function ImportBackupModal({ open, onClose }: ImportBackupModalProps) {
  const [localPath, setLocalPath] = useState('C:\\Users\\Bharat\\Downloads\\Code & Projects\\mediplan-backup-2026-03-01.json')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [parsedData, setParsedData] = useState<{
    medicines: BackupMedicine[]
    users: BackupUser[]
    filename?: string
  } | null>(null)
  const [mergeStrategy, setMergeStrategy] = useState<'merge' | 'overwrite' | 'skip'>('merge')

  // Smart categorization based on name and unit
  function inferCategory(name: string, unit: string): string {
    const n = name.toLowerCase()
    const u = unit.toLowerCase()
    if (u.includes('ml') || u.includes('syrup') || n.includes('syrup')) return MedicineCategory.SYRUP
    if (u.includes('cap') || u.includes('capsule') || n.includes('capsule')) return MedicineCategory.CAPSULE
    if (u.includes('inj') || u.includes('injection') || n.includes('injection')) return MedicineCategory.INJECTION
    if (u.includes('drop') || n.includes('drops')) return MedicineCategory.DROPS
    if (u.includes('oint') || n.includes('cream') || n.includes('gel')) return MedicineCategory.OINTMENT
    if (n.includes('inhaler')) return MedicineCategory.INHALER
    if (n.includes('vitamin') || n.includes('multivitamin') || n.includes('supplement')) return MedicineCategory.SUPPLEMENT
    return MedicineCategory.TABLET // Default
  }

  // Map dailyDosage number to our DosageSchedule enum
  function mapDailyDosage(dosage?: number): DosageSchedule | null {
    if (!dosage || dosage <= 0) return null
    if (dosage === 1) return DosageSchedule.ONCE
    if (dosage === 2) return DosageSchedule.TWICE
    return DosageSchedule.THRICE
  }

  // Handle Drag Over
  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  // Process raw backup data
  const processRawData = (data: any, filename?: string) => {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid backup data format. Please upload a valid JSON backup file.')
    }
    const medicines = Array.isArray(data.medicines) ? data.medicines : []
    const users = Array.isArray(data.users) ? data.users : []

    setParsedData({
      medicines,
      users,
      filename
    })
    setError(null)
  }

  // Handle Dropped File
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
        setError('Please drop a valid JSON (.json) backup file.')
        return
      }
      readUploadedFile(file)
    }
  }

  // Handle File Select via browse
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      readUploadedFile(e.target.files[0])
    }
  }

  // Read upload file helper
  const readUploadedFile = (file: File) => {
    setLoading(true)
    setError(null)
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string
        const json = JSON.parse(text)
        processRawData(json, file.name)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to parse JSON file.')
      } finally {
        setLoading(false)
      }
    }
    reader.onerror = () => {
      setError('Failed to read the file.')
      setLoading(false)
    }
    reader.readAsText(file)
  }

  // Ingest from local system file path via backend helper API
  const handleLocalPathIngest = async () => {
    if (!localPath.trim()) {
      setError('Please provide a valid file path.')
      return
    }

    setLoading(true)
    setError(null)
    setSuccessMsg(null)
    setParsedData(null)

    try {
      const res = await api.post('/items/import-local', { filePath: localPath })
      if (res.data && res.data.success) {
        const payload = res.data.data
        const filename = localPath.substring(localPath.lastIndexOf('\\') + 1)
        processRawData(payload, filename)
      } else {
        setError(res.data?.message || 'Failed to read local backup file.')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to communicate with local backup helper. Ensure the backend server is running.')
    } finally {
      setLoading(false)
    }
  }

  // Execute actual database merge & save
  const triggerInjest = () => {
    if (!parsedData) return

    setLoading(true)
    setError(null)

    try {
      const currentItems = localDb.items()
      const now = new Date().toISOString()
      const activeUserId = localDb.userId

      // Map users ID to Name for assignedTo mapping
      const userMap = new Map<string, string>()
      parsedData.users.forEach((u) => {
        if (u.name && u.name !== 'My Profile') {
          userMap.set(u.id, u.name)
        }
      })

      let updatedItems = [...currentItems]
      let addedCount = 0
      let mergedCount = 0
      let skippedCount = 0

      parsedData.medicines.forEach((med) => {
        const existingIndex = updatedItems.findIndex(
          (item) => item.name.toLowerCase().trim() === med.name.toLowerCase().trim()
        )

        if (existingIndex >= 0) {
          if (mergeStrategy === 'skip') {
            skippedCount++
            return
          }
          if (mergeStrategy === 'merge') {
            const existing = updatedItems[existingIndex]
            updatedItems[existingIndex] = {
              ...existing,
              currentQty: existing.currentQty + Number(med.stock ?? 0),
              updatedAt: now,
              notes: existing.notes
                ? `${existing.notes} (Merged +${med.stock} ${med.unit} from backup)`
                : `Merged +${med.stock} ${med.unit} from backup`
            }
            mergedCount++
            return
          }
          if (mergeStrategy === 'overwrite') {
            updatedItems.splice(existingIndex, 1)
          }
        }

        // Map to standard Item
        const item: Item = {
          id: localDb.createId('item'),
          userId: activeUserId,
          name: med.name.trim(),
          itemType: ItemType.MEDICINE,
          category: inferCategory(med.name, med.unit || 'tablets'),
          unit: med.unit || 'Piece',
          currentQty: Number(med.stock ?? 0),
          minQty: 5,
          reorderQty: null,
          expiryDate: null,
          dosageSchedule: mapDailyDosage(med.dailyDosage),
          prescriptionReq: false,
          storageCondition: StorageCondition.ROOM_TEMP,
          assignedTo: med.userId ? userMap.get(med.userId) || null : null,
          notes: med.dailyDosage ? `Daily dosage: ${med.dailyDosage} times a day. Mapped from backup.` : 'Imported from backup',
          createdAt: now,
          updatedAt: med.updatedAt ? new Date(med.updatedAt).toISOString() : now
        }

        updatedItems.push(item)
        addedCount++
      })

      // Commit to local DB
      localDb.saveItems(updatedItems)
      generateAlerts()

      // Dispatch event to reload React state in hooks
      window.dispatchEvent(new Event('meditrack-data-change'))

      let msg = `Successfully imported ${addedCount} new medicines`
      if (mergedCount > 0) msg += ` and merged stock for ${mergedCount} duplicates.`
      else msg += '.'

      if (skippedCount > 0) msg += ` Skipped ${skippedCount} existing medicines.`

      setSuccessMsg(msg)
      setParsedData(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error ingesting data.')
    } finally {
      setLoading(false)
    }
  }

  // Reset modal state
  const handleClose = () => {
    setError(null)
    setSuccessMsg(null)
    setParsedData(null)
    onClose()
  }

  return (
    <Modal title="Import Backup JSON" open={open} onClose={handleClose}>
      <div className="space-y-5">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-950 flex items-start gap-2">
            <span className="font-semibold shrink-0">⚠️ Error:</span>
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950 flex items-start gap-2">
            <span className="font-semibold shrink-0">✅ Success:</span>
            <span>{successMsg}</span>
          </div>
        )}

        {!parsedData && !successMsg && (
          <div className="space-y-5">
            <p className="text-sm text-gray-600">
              Restore and ingest inventory data from old MediPlan JSON backups. You can drop the backup file here, or pull it directly from your PC downloads folder.
            </p>

            {/* Drag & Drop Upload Zone */}
            <div
              className={`relative border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition cursor-pointer ${
                dragActive
                  ? 'border-primary-500 bg-primary-50/50'
                  : 'border-gray-300 hover:border-primary-400 bg-gray-50/50 hover:bg-gray-50'
              }`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="file-upload-input"
                className="hidden"
                accept=".json"
                onChange={handleFileChange}
              />
              <span className="text-3xl mb-2">📁</span>
              <p className="text-sm font-semibold text-gray-700">Drag and drop backup JSON file here</p>
              <p className="text-xs text-gray-500 mt-1">or click to browse files from your computer</p>
              <label
                htmlFor="file-upload-input"
                className="absolute inset-0 cursor-pointer"
              />
            </div>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink mx-4 text-xs text-gray-400 font-bold tracking-wider uppercase">OR INGEST FROM PATH</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            {/* Local Path Auto-Ingest Zone */}
            <div className="rounded-lg border border-gray-200 bg-gray-50/30 p-4 space-y-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Local JSON Backup File Path</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={localPath}
                    onChange={(e) => setLocalPath(e.target.value)}
                    placeholder="E.g., C:\Users\Bharat\Downloads\mediplan-backup-2026-03-01.json"
                    className="flex-grow min-h-10 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-xs text-gray-700"
                  />
                  <Button
                    variant="secondary"
                    onClick={handleLocalPathIngest}
                    disabled={loading}
                    className="shrink-0 min-h-10 text-xs px-3 font-semibold"
                  >
                    {loading ? 'Reading...' : 'Ingest path'}
                  </Button>
                </div>
                <p className="text-[11px] text-gray-400">
                  Tip: Change to <code className="font-mono bg-gray-100 p-0.5 rounded">...mediplan-backup-2026-01-31.json</code> to load the non-empty family records.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Preview and Merge UI */}
        {parsedData && (
          <div className="space-y-4">
            <div className="rounded-lg bg-primary-50/50 border border-primary-100 p-4 space-y-2">
              <h3 className="text-sm font-semibold text-primary-950 flex items-center gap-1.5">
                <span>📦</span> Backup Analysis Summary
              </h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-primary-900">
                <div>
                  <span className="font-medium text-primary-950/70">File source:</span>{' '}
                  <span className="font-mono bg-primary-100/50 px-1 rounded truncate inline-block max-w-[180px]" title={parsedData.filename}>
                    {parsedData.filename || 'local path'}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-primary-950/70">Medicines found:</span>{' '}
                  <span className="font-bold text-primary-950">{parsedData.medicines.length}</span>
                </div>
                <div className="col-span-2">
                  <span className="font-medium text-primary-950/70">Backup profiles:</span>{' '}
                  <span className="inline-flex flex-wrap gap-1 mt-1">
                    {parsedData.users.length > 0 ? (
                      parsedData.users.map((u) => (
                        <span key={u.id} className="bg-primary-200/50 text-primary-800 font-bold px-1.5 py-0.5 rounded text-[10px]">
                          👤 {u.name}
                        </span>
                      ))
                    ) : (
                      <span className="italic text-gray-400">None</span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Merge Strategy Select */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Duplicate Resolution Strategy</label>
              <div className="grid grid-cols-3 gap-2">
                <label className={`border rounded-lg p-2.5 flex flex-col justify-between cursor-pointer transition text-left ${
                  mergeStrategy === 'merge'
                    ? 'border-primary-500 bg-primary-50/30 ring-1 ring-primary-500'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}>
                  <input
                    type="radio"
                    name="strategy"
                    value="merge"
                    checked={mergeStrategy === 'merge'}
                    onChange={() => setMergeStrategy('merge')}
                    className="sr-only"
                  />
                  <span className="text-xs font-bold text-gray-900">Smart Merge</span>
                  <span className="text-[10px] text-gray-500 mt-1 leading-normal">Add stock together & keep history.</span>
                </label>

                <label className={`border rounded-lg p-2.5 flex flex-col justify-between cursor-pointer transition text-left ${
                  mergeStrategy === 'overwrite'
                    ? 'border-primary-500 bg-primary-50/30 ring-1 ring-primary-500'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}>
                  <input
                    type="radio"
                    name="strategy"
                    value="overwrite"
                    checked={mergeStrategy === 'overwrite'}
                    onChange={() => setMergeStrategy('overwrite')}
                    className="sr-only"
                  />
                  <span className="text-xs font-bold text-gray-900">Overwrite</span>
                  <span className="text-[10px] text-gray-500 mt-1 leading-normal">Replace current with backup.</span>
                </label>

                <label className={`border rounded-lg p-2.5 flex flex-col justify-between cursor-pointer transition text-left ${
                  mergeStrategy === 'skip'
                    ? 'border-primary-500 bg-primary-50/30 ring-1 ring-primary-500'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}>
                  <input
                    type="radio"
                    name="strategy"
                    value="skip"
                    checked={mergeStrategy === 'skip'}
                    onChange={() => setMergeStrategy('skip')}
                    className="sr-only"
                  />
                  <span className="text-xs font-bold text-gray-900">Skip Duplicates</span>
                  <span className="text-[10px] text-gray-500 mt-1 leading-normal">Only import new medicines.</span>
                </label>
              </div>
            </div>

            {/* Medicines List Preview */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                Medicines Preview ({parsedData.medicines.length})
              </label>
              <div className="max-h-[180px] overflow-y-auto border border-gray-200 rounded-lg bg-white divide-y divide-gray-100 text-xs">
                {parsedData.medicines.length > 0 ? (
                  parsedData.medicines.map((med, idx) => {
                    const profileName = parsedData.users.find(u => u.id === med.userId)?.name
                    return (
                      <div key={med.id || idx} className="p-3 flex items-center justify-between hover:bg-gray-50">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-gray-900">{med.name}</span>
                          <div className="flex gap-2 items-center text-[10px] text-gray-500">
                            <span>📦 Mapped unit: {med.unit || 'Piece'}</span>
                            {profileName && profileName !== 'My Profile' && (
                              <span className="bg-amber-100 text-amber-800 font-medium px-1 rounded">👤 {profileName}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`font-bold ${med.stock > 0 ? 'text-gray-900' : 'text-red-500'}`}>
                            {med.stock > 0 ? `${med.stock} stock` : 'Out of stock'}
                          </span>
                          {med.dailyDosage && (
                            <p className="text-[10px] text-gray-400 mt-0.5">Dosage: {med.dailyDosage}/day</p>
                          )}
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <p className="text-sm font-semibold">Empty backup file</p>
                    <p className="text-xs mt-1 text-gray-400 leading-relaxed max-w-sm mx-auto">
                      This JSON file doesn't list any medicines. Try changing the input to load <code className="font-mono bg-gray-100 p-0.5 rounded">mediplan-backup-2026-01-31.json</code>.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Merge Actions */}
            <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
              <Button variant="ghost" onClick={() => setParsedData(null)} disabled={loading}>
                Back
              </Button>
              <Button
                variant={parsedData.medicines.length > 0 ? 'primary' : 'secondary'}
                onClick={triggerInjest}
                disabled={loading || parsedData.medicines.length === 0}
              >
                {loading ? 'Ingesting...' : `Import ${parsedData.medicines.length} items`}
              </Button>
            </div>
          </div>
        )}

        {successMsg && (
          <div className="flex justify-end pt-2">
            <Button variant="primary" onClick={handleClose}>
              Done
            </Button>
          </div>
        )}
      </div>
    </Modal>
  )
}
