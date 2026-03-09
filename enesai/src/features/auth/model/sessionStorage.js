const SESSION_KEY = 'enesai_admin_session'

const storages = [localStorage, sessionStorage]

export function readSession() {
  for (const storage of storages) {
    const raw = storage.getItem(SESSION_KEY)
    if (!raw) {
      continue
    }

    try {
      const parsed = JSON.parse(raw)
      if (parsed?.token && parsed?.user?.role === 'admin') {
        return parsed
      }
    } catch {
      storage.removeItem(SESSION_KEY)
    }
  }

  return null
}

export function writeSession(session, remember) {
  const targetStorage = remember ? localStorage : sessionStorage
  localStorage.removeItem(SESSION_KEY)
  sessionStorage.removeItem(SESSION_KEY)
  targetStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
  sessionStorage.removeItem(SESSION_KEY)
}
