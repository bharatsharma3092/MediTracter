import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import AddItemPage from '@/pages/AddItemPage'
import AlertsPage from '@/pages/AlertsPage'
import DashboardPage from '@/pages/DashboardPage'
import EditItemPage from '@/pages/EditItemPage'
import InventoryPage from '@/pages/InventoryPage'
import ItemDetailPage from '@/pages/ItemDetailPage'
import ReportsPage from '@/pages/ReportsPage'
import SettingsPage from '@/pages/SettingsPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'inventory', element: <InventoryPage /> },
      { path: 'inventory/new', element: <AddItemPage /> },
      { path: 'inventory/:id', element: <ItemDetailPage /> },
      { path: 'inventory/:id/edit', element: <EditItemPage /> },
      { path: 'alerts', element: <AlertsPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'settings', element: <SettingsPage /> }
    ]
  }
])

export default function AppRouter() {
  return <RouterProvider router={router} />
}
