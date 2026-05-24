import { AlertWithItem } from '@shared/types'
import { Button } from '@/components/common/Button'
import { AlertList } from '@/components/alerts/AlertList'
import { useAlerts } from '@/hooks/useAlerts'

export default function AlertsPage() {
  const { alerts, dismissAlert, dismissAllAlerts, runCheck } = useAlerts()
  const activeAlerts = alerts.filter((alert) => !alert.dismissed) as AlertWithItem[]
  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap justify-end gap-3">
        <Button variant="secondary" onClick={() => void runCheck()}>
          Run check
        </Button>
        <Button variant="secondary" onClick={() => void dismissAllAlerts()} disabled={activeAlerts.length === 0}>
          Dismiss all
        </Button>
      </div>
      <AlertList alerts={activeAlerts} onDismiss={(id) => void dismissAlert(id)} />
    </div>
  )
}
