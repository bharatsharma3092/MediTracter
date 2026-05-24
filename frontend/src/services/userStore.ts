const USERS_KEY = 'meditrack-users'

interface StoredUser {
  id: string
  email: string
  username: string
  passwordHash: string
  salt: string
  name: string
  createdAt: string
}

function generateSalt(): string {
  const arr = new Uint8Array(16)
  crypto.getRandomValues(arr)
  return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('')
}

async function hashPassword(password: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(salt + password)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, '0')).join('')
}

function getUsers(): StoredUser[] {
  const raw = localStorage.getItem(USERS_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as StoredUser[]
  } catch {
    return []
  }
}

function saveUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function userIdFromEmail(email: string): string {
  return 'user_' + email.toLowerCase().replace(/[^a-z0-9]/g, '_')
}

export const userStore = {
  async register(email: string, username: string, password: string, name: string): Promise<{ error?: string }> {
    const users = getUsers()
    const normalizedEmail = email.toLowerCase().trim()
    const normalizedUsername = username.toLowerCase().trim()

    if (users.some((u) => u.email === normalizedEmail)) {
      return { error: 'An account with this email already exists' }
    }
    if (users.some((u) => u.username === normalizedUsername)) {
      return { error: 'This username is already taken' }
    }

    const salt = generateSalt()
    const passwordHash = await hashPassword(password, salt)

    const user: StoredUser = {
      id: userIdFromEmail(normalizedEmail),
      email: normalizedEmail,
      username: normalizedUsername,
      passwordHash,
      salt,
      name: name.trim(),
      createdAt: new Date().toISOString()
    }

    users.push(user)
    saveUsers(users)
    return {}
  },

  async validatePassword(identifier: string, password: string): Promise<{ user?: Omit<StoredUser, 'passwordHash' | 'salt'>; error?: string }> {
    const users = getUsers()
    const normalized = identifier.toLowerCase().trim()

    const user = users.find((u) => u.email === normalized || u.username === normalized)
    if (!user) {
      return { error: 'No account found with that email or username' }
    }

    const hash = await hashPassword(password, user.salt)
    if (hash !== user.passwordHash) {
      return { error: 'Incorrect password' }
    }

    const { passwordHash, salt, ...safe } = user
    return { user: safe }
  },

  async userExists(identifier: string): Promise<boolean> {
    const users = getUsers()
    const normalized = identifier.toLowerCase().trim()
    return users.some((u) => u.email === normalized || u.username === normalized)
  },

  async resetPassword(identifier: string, newPassword: string): Promise<{ user?: Omit<StoredUser, 'passwordHash' | 'salt'>; error?: string }> {
    const users = getUsers()
    const normalized = identifier.toLowerCase().trim()
    const index = users.findIndex((u) => u.email === normalized || u.username === normalized)

    if (index < 0) {
      return { error: 'No account found with that email or username' }
    }

    const salt = generateSalt()
    const passwordHash = await hashPassword(newPassword, salt)
    users[index] = { ...users[index], passwordHash, salt }
    saveUsers(users)

    const { passwordHash: _, salt: __, ...safe } = users[index]
    return { user: safe }
  }
}
