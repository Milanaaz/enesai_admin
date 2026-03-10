import './styles.css'
import { AuthProvider, useAuth } from '../features/auth/context/AuthProvider.jsx'
import LoginPage from '../pages/login/ui/LoginPage.jsx'
import AdminDashboardPage from '../pages/dashboard/ui/AdminDashboardPage.jsx'

function AppContent() {
  const { isAuthenticated, isHydrating } = useAuth()

  if (isHydrating) {
    return <div className="app-loading">Загрузка...</div>
  }

  return isAuthenticated ? <AdminDashboardPage /> : <LoginPage />
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
