import './styles.css'
import { AuthProvider, useAuth } from '../features/auth/context/AuthProvider.jsx'
import LoginPage from '../pages/login/ui/LoginPage.jsx'
import AdminPanelPage from '../pages/admin/ui/AdminPanelPage.jsx'

function AppContent() {
  const { isAuthenticated, isHydrating } = useAuth()

  if (isHydrating) {
    return <div className="app-loading">Загрузка...</div>
  }

  return isAuthenticated ? <AdminPanelPage /> : <LoginPage />
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App

