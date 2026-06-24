import { AuthProvider } from '../../features/auth/context/AuthProvider.jsx'

function AppProviders({ children }) {
  return <AuthProvider>{children}</AuthProvider>
}

export default AppProviders
