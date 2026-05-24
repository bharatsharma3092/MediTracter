import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/common/Button'
import { useAuthStore } from '@/store/authStore'
import { useAlerts } from '@/hooks/useAlerts'

const titles: Record<string, string> = {
  '/': 'Dashboard',
  '/inventory': 'Inventory',
  '/alerts': 'Alerts',
  '/reports': 'Reports',
  '/settings': 'Settings'
}

export function Header() {
  const location = useLocation()
  const { logout, session } = useAuthStore()
  const { unreadCount } = useAlerts()
  const title = titles[location.pathname] ?? (location.pathname.includes('/inventory') ? 'Inventory' : 'MediTrack Pro')

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary-700 lg:hidden">MediTrack Pro</p>
          <h1 className="text-xl font-bold text-gray-950">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/alerts" className="rounded-md px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100">
            Alerts {unreadCount > 0 ? `(${unreadCount})` : ''}
          </Link>
          <span className="hidden text-sm text-gray-500 sm:inline">{session?.user.name ?? session?.user.email}</span>
          <Button variant="secondary" onClick={logout}>
            Sign out
          </Button>
        </div>
      </div>
    </header>
  )
}
