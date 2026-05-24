export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}

export interface UserSession {
  accessToken: string
  refreshToken: string
  expiresAt: number
  user: {
    id: string
    email: string
    name?: string
  }
}

export interface UserSettings {
  coverMonths: number
  consumptionWindow: number
  leadTimeDays: number
  bufferDays: number
  medicineThreshold: number
  pushEnabled: boolean
  emailEnabled: boolean
}
