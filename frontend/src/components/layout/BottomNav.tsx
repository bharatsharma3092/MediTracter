import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Home' },
  { to: '/inventory', label: 'Stock' },
  { to: '/alerts', label: 'Alerts' },
  { to: '/reports', label: 'Reports' }
]

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-gray-200 bg-white lg:hidden">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.to === '/'}
          className={({ isActive }) =>
            `px-2 py-3 text-center text-xs font-semibold ${isActive ? 'text-primary-800' : 'text-gray-600'}`
          }
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  )
}
