import { useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardPage from './DashboardPage'
import { Button } from '@/components/common/Button'
import { ImportBackupModal } from '@/components/inventory/ImportBackupModal'

export default function InventoryPage() {
  const [isImportOpen, setIsImportOpen] = useState(false)

  return (
    <div className="grid gap-5">
      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={() => setIsImportOpen(true)}>
          Import Backup
        </Button>
        <Link to="/inventory/new">
          <Button>Add item</Button>
        </Link>
      </div>
      <DashboardPage />
      <ImportBackupModal open={isImportOpen} onClose={() => setIsImportOpen(false)} />
    </div>
  )
}
