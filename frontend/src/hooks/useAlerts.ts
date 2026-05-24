import { useCallback, useEffect } from 'react'
import { useAlertStore } from '@/store/alertStore'
import { alertService } from '@/services/alertService'

export function useAlerts() {
  const store = useAlertStore()

  const refresh = useCallback(async () => {
    store.setLoading(true)
    const alerts = await alertService.list()
    store.setAlerts(alerts)
    store.setLoading(false)
  }, [])

  useEffect(() => {
    void refresh()
    const listener = () => void refresh()
    window.addEventListener('meditrack-data-change', listener)
    return () => window.removeEventListener('meditrack-data-change', listener)
  }, [refresh])

  return {
    ...store,
    unreadCount: store.alerts.filter((alert) => !alert.dismissed).length,
    refresh,
    dismissAlert: async (id: string | string[]) => {
      const alerts = await alertService.dismiss(id)
      store.setAlerts(alerts)
    },
    dismissAllAlerts: async () => {
      const alerts = await alertService.dismissAll()
      store.setAlerts(alerts)
    },
    runCheck: async () => {
      const alerts = await alertService.runCheck()
      store.setAlerts(alerts)
    }
  }
}
