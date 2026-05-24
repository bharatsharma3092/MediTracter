import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { BottomNav } from './BottomNav'
import { AlertBanner } from '@/components/alerts/AlertBanner'

export function AppShell() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="min-w-0 flex-1 pb-20 lg:pb-0">
        <Header />
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <AlertBanner />
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </div>
  )
}
