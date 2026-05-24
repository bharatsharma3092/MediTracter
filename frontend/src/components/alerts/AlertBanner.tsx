import { Link } from 'react-router-dom'
import { useAlerts } from '@/hooks/useAlerts'

export function AlertBanner() {
  const { unreadCount } = useAlerts()
  if (unreadCount === 0) return null
  return (
    <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="font-semibold">{unreadCount} inventory alert{unreadCount === 1 ? '' : 's'} need attention.</span>
        <Link to="/alerts" className="font-semibold text-amber-950 underline">
          Review alerts
        </Link>
      </div>
    </div>
  )
}
