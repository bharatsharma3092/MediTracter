import { create } from 'zustand'
import { AlertWithItem } from '@shared/types'

interface AlertState {
  alerts: AlertWithItem[]
  isLoading: boolean
  setAlerts: (alerts: AlertWithItem[]) => void
  addAlert: (alert: AlertWithItem) => void
  removeAlert: (id: string) => void
  dismissAlert: (id: string) => void
  dismissAllAlerts: () => void
  setLoading: (loading: boolean) => void
}

export const useAlertStore = create<AlertState>((set) => ({
  alerts: [],
  isLoading: false,
  setAlerts: (alerts) => set({ alerts }),
  addAlert: (alert) => set((state) => ({ alerts: [...state.alerts, alert] })),
  removeAlert: (id) =>
    set((state) => ({ alerts: state.alerts.filter((a) => a.id !== id) })),
  dismissAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.map((a) => (a.id === id ? { ...a, dismissed: true } : a))
    })),
  dismissAllAlerts: () =>
    set((state) => ({
      alerts: state.alerts.map((a) => ({ ...a, dismissed: true }))
    })),
  setLoading: (isLoading) => set({ isLoading })
}))
