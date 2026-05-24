import { UserSession } from '@shared/types'
import { userStore, userIdFromEmail } from './userStore'

function makeSession(user: { id: string; email: string; name: string }): UserSession {
  return {
    accessToken: `token-${Date.now()}`,
    refreshToken: 'refresh-token',
    expiresAt: Date.now() + 1000 * 60 * 60 * 24,
    user: {
      id: user.id,
      email: user.email,
      name: user.name
    }
  }
}

export const authService = {
  async signIn(identifier: string, password: string): Promise<{ session?: UserSession; error?: string }> {
    const result = await userStore.validatePassword(identifier, password)
    if (result.error || !result.user) {
      return { error: result.error ?? 'Login failed' }
    }
    return { session: makeSession({ id: result.user.id, email: result.user.email, name: result.user.name }) }
  },

  async register(email: string, username: string, password: string, name: string): Promise<{ session?: UserSession; error?: string }> {
    const result = await userStore.register(email, username, password, name)
    if (result.error) {
      return { error: result.error }
    }
    const id = userIdFromEmail(email.toLowerCase().trim())
    return { session: makeSession({ id, email: email.toLowerCase().trim(), name: name.trim() }) }
  },

  async resetPassword(identifier: string, newPassword: string): Promise<{ session?: UserSession; error?: string }> {
    const result = await userStore.resetPassword(identifier, newPassword)
    if (result.error || !result.user) {
      return { error: result.error ?? 'Password reset failed' }
    }
    return { session: makeSession({ id: result.user.id, email: result.user.email, name: result.user.name }) }
  }
}
