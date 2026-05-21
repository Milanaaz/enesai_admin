import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { fetchMyProfile, updateMyProfile } from '../../../pages/users/api/usersApi.js'
import { loginRequest } from '../api/authApi.js'
import { clearSession, readSession, updateStoredSession, writeSession } from '../model/sessionStorage.js'

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
      const role = typeof nextSession?.user?.role === 'string' ? nextSession.user.role.trim().toUpperCase() : ''
      const isAllowedRole = role === 'SUPER_ADMIN' || role === 'CONTENT_ADMIN'
      if (!isAllowedRole) {
        throw new Error('Доступ в админ-панель разрешен только SUPER_ADMIN и CONTENT_ADMIN')
      }
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

  const refreshProfile = async () => {
    const token = session?.token
    if (!token) {
      throw new Error('Токен авторизации отсутствует')
    }

    const profile = await fetchMyProfile({ token })
    const nextSession = {
      ...session,
      user: {
        ...(session?.user ?? {}),
        ...profile,
      },
    }

    setSession(nextSession)
    updateStoredSession((current) => ({
      ...current,
      user: {
        ...(current?.user ?? {}),
        ...profile,
      },
    }))

    return nextSession.user
  }

  const saveMyProfile = async (profilePayload) => {
    const token = session?.token
    if (!token) {
      throw new Error('Токен авторизации отсутствует')
    }

    const profile = await updateMyProfile({ token, profile: profilePayload })
    const nextSession = {
      ...session,
      user: {
        ...(session?.user ?? {}),
        ...profile,
      },
    }

    setSession(nextSession)
    updateStoredSession((current) => ({
      ...current,
      user: {
        ...(current?.user ?? {}),
        ...profile,
      },
    }))

    return nextSession.user
  }

  const logout = () => {
    clearSession()
    setSession(null)
    setError('')
  }

  const clearError = () => {
    setError('')
  }

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? '',
      isAuthenticated: Boolean(session?.token),
      isHydrating,
      isSubmitting,
      error,
      login,
      refreshProfile,
      saveMyProfile,
      logout,
      clearError,
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
