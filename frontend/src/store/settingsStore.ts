import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { UserSettings } from '@shared/types'

interface SettingsState extends UserSettings {
  updateSettings: (settings: Partial<UserSettings>) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      coverMonths: 1,
      consumptionWindow: 30,
      leadTimeDays: 3,
      bufferDays: 2,
      medicineThreshold: 10,
      pushEnabled: true,
      emailEnabled: false,
      updateSettings: (newSettings) =>
        set((state) => ({ ...state, ...newSettings }))
    }),
    {
      name: 'meditrack-settings'
    }
  )
)
