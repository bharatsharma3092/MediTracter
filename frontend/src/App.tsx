import { useAuthStore } from './store/authStore'
import AppRouter from './router/AppRouter'
import LoginPage from './pages/LoginPage'

function App() {
  const { session, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!session) {
    return <LoginPage />
  }

  return <AppRouter />
}

export default App