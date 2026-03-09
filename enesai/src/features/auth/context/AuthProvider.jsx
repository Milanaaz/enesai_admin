import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { loginRequest } from '../api/authApi.js'
import { clearSession, readSession, writeSession } from '../model/sessionStorage.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [isHydrating, setIsHydrating] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const storedSession = readSession()
    if (storedSession) {
      setSession(storedSession)
    }
    setIsHydrating(false)
  }, [])

  const login = async ({ email, password, remember }) => {
    setIsSubmitting(true)
    setError('')

    try {
      const nextSession = await loginRequest({ email, password })
      writeSession(nextSession, remember)
      setSession(nextSession)
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ошибка входа'
      setError(message)
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  const logout = () => {
    clearSession()
    setSession(null)
    setError('')
  }

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      isAuthenticated: Boolean(session?.token),
      isHydrating,
      isSubmitting,
      error,
      login,
      logout,
      clearError: () => setError(''),
    }),
    [session, isHydrating, isSubmitting, error],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
