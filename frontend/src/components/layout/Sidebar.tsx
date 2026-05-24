import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/inventory', label: 'Inventory' },
  { to: '/alerts', label: 'Alerts' },
  { to: '/reports', label: 'Reports' },
  { to: '/settings', label: 'Settings' }
]

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-gray-200 bg-white px-4 py-6 lg:block">
      <div className="px-2">
        <p className="text-xl font-bold text-gray-950">MediTrack Pro</p>
        <p className="mt-1 text-sm text-gray-500">Medicine and equipment tracker</p>
      </div>
      <nav className="mt-8 grid gap-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) =>
              `rounded-md px-3 py-2 text-sm font-semibold ${isActive ? 'bg-primary-50 text-primary-800' : 'text-gray-700 hover:bg-gray-100'}`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
