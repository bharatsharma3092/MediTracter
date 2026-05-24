import { FormEvent, useState } from 'react'
import { Button } from '@/components/common/Button'
import { Field, Input } from '@/components/common/Input'
import { useAuthStore } from '@/store/authStore'
import { userStore } from '@/services/userStore'

type View = 'login' | 'register' | 'forgot-verify' | 'forgot-reset'

export default function LoginPage() {
  const { signIn, register, resetPassword, isLoading, error, clearError } = useAuthStore()
  const [view, setView] = useState<View>('login')
  const [forgotId, setForgotId] = useState('')
  const [userExists, setUserExists] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const showError = localError ?? error

  function switchView(v: View) {
    setView(v)
    setLocalError(null)
    clearError()
    setUserExists(false)
    setForgotId('')
  }

  // LOGIN
  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLocalError(null)
    const form = new FormData(e.currentTarget)
    const id = String(form.get('identifier') || '').trim()
    const pw = String(form.get('password') || '')
    if (!id || !pw) { setLocalError('Please fill in all fields'); return }
    await signIn(id, pw)
  }

  // REGISTER
  async function handleRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLocalError(null)
    const form = new FormData(e.currentTarget)
    const name = String(form.get('name') || '').trim()
    const email = String(form.get('email') || '').trim()
    const username = String(form.get('username') || '').trim()
    const pw = String(form.get('password') || '')
    const confirm = String(form.get('confirmPassword') || '')

    if (!name || !email || !username || !pw) { setLocalError('Please fill in all fields'); return }
    if (!email.includes('@')) { setLocalError('Please enter a valid email'); return }
    if (username.length < 3) { setLocalError('Username must be at least 3 characters'); return }
    if (pw.length < 6) { setLocalError('Password must be at least 6 characters'); return }
    if (pw !== confirm) { setLocalError('Passwords do not match'); return }

    await register(email, username, pw, name)
  }

  // FORGOT PASSWORD - step 1: verify user exists
  async function handleForgotVerify(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLocalError(null)
    const form = new FormData(e.currentTarget)
    const id = String(form.get('identifier') || '').trim()
    if (!id) { setLocalError('Please enter your email or username'); return }

    const exists = await userStore.userExists(id)
    if (!exists) {
      setLocalError('No account found with that email or username')
      return
    }
    setForgotId(id)
    setUserExists(true)
  }

  // FORGOT PASSWORD - step 2: set new password
  async function handleForgotReset(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLocalError(null)
    const form = new FormData(e.currentTarget)
    const pw = String(form.get('newPassword') || '')
    const confirm = String(form.get('confirmPassword') || '')

    if (!pw) { setLocalError('Please enter a new password'); return }
    if (pw.length < 6) { setLocalError('Password must be at least 6 characters'); return }
    if (pw !== confirm) { setLocalError('Passwords do not match'); return }

    await resetPassword(forgotId, pw)
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-950">MediTrack Pro</h1>

          {/* LOGIN VIEW */}
          {view === 'login' && (
            <>
              <p className="mt-2 text-sm text-gray-600">Sign in to manage medicine stock, equipment, alerts, and reports.</p>
              {showError && <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{showError}</p>}
              <form onSubmit={handleLogin} className="mt-5 grid gap-4">
                <Field label="Email or Username">
                  <Input name="identifier" autoComplete="username" placeholder="you@example.com" required />
                </Field>
                <Field label="Password">
                  <Input name="password" type="password" autoComplete="current-password" placeholder="Enter your password" required />
                </Field>
                <div className="text-right">
                  <button type="button" className="text-sm font-medium text-primary-700 hover:underline" onClick={() => switchView('forgot-verify')}>
                    Forgot password?
                  </button>
                </div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>
              <p className="mt-4 text-center text-sm text-gray-600">
                Don't have an account?{' '}
                <button className="font-semibold text-primary-700 hover:underline" onClick={() => switchView('register')}>
                  Create account
                </button>
              </p>
            </>
          )}

          {/* REGISTER VIEW */}
          {view === 'register' && (
            <>
              <p className="mt-2 text-sm text-gray-600">Create a new account to get started.</p>
              {showError && <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{showError}</p>}
              <form onSubmit={handleRegister} className="mt-5 grid gap-4">
                <Field label="Full Name">
                  <Input name="name" autoComplete="name" placeholder="John Doe" required />
                </Field>
                <Field label="Email">
                  <Input name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
                </Field>
                <Field label="Username">
                  <Input name="username" autoComplete="username" placeholder="johndoe" required />
                </Field>
                <Field label="Password">
                  <Input name="password" type="password" autoComplete="new-password" placeholder="At least 6 characters" required />
                </Field>
                <Field label="Confirm Password">
                  <Input name="confirmPassword" type="password" autoComplete="new-password" placeholder="Re-enter password" required />
                </Field>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Creating account...' : 'Create account'}
                </Button>
              </form>
              <p className="mt-4 text-center text-sm text-gray-600">
                Already have an account?{' '}
                <button className="font-semibold text-primary-700 hover:underline" onClick={() => switchView('login')}>
                  Sign in
                </button>
              </p>
            </>
          )}

          {/* FORGOT PASSWORD - VERIFY */}
          {view === 'forgot-verify' && !userExists && (
            <>
              <p className="mt-2 text-sm text-gray-600">Enter your email or username to reset your password.</p>
              {showError && <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{showError}</p>}
              <form onSubmit={handleForgotVerify} className="mt-5 grid gap-4">
                <Field label="Email or Username">
                  <Input name="identifier" placeholder="you@example.com" required />
                </Field>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Verifying...' : 'Continue'}
                </Button>
              </form>
              <p className="mt-4 text-center text-sm text-gray-600">
                <button className="font-semibold text-primary-700 hover:underline" onClick={() => switchView('login')}>
                  Back to sign in
                </button>
              </p>
            </>
          )}

          {/* FORGOT PASSWORD - RESET */}
          {view === 'forgot-verify' && userExists && (
            <>
              <p className="mt-2 text-sm text-gray-600">Set a new password for your account.</p>
              {showError && <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{showError}</p>}
              <form onSubmit={handleForgotReset} className="mt-5 grid gap-4">
                <Field label="New Password">
                  <Input name="newPassword" type="password" autoComplete="new-password" placeholder="At least 6 characters" required />
                </Field>
                <Field label="Confirm New Password">
                  <Input name="confirmPassword" type="password" autoComplete="new-password" placeholder="Re-enter password" required />
                </Field>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Resetting...' : 'Reset password & sign in'}
                </Button>
              </form>
              <p className="mt-4 text-center text-sm text-gray-600">
                <button className="font-semibold text-primary-700 hover:underline" onClick={() => switchView('login')}>
                  Back to sign in
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
