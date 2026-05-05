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
      const token = typeof parsed?.token === 'string' ? parsed.token.trim() : ''
      const isLegacyMockToken = token.startsWith('adm-')

      if (token && !isLegacyMockToken) {
        return parsed
      }

      if (isLegacyMockToken) {
        storage.removeItem(SESSION_KEY)
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

export function updateStoredSession(updater) {
  for (const storage of storages) {
    const raw = storage.getItem(SESSION_KEY)
    if (!raw) {
      continue
    }

    try {
      const current = JSON.parse(raw)
      const next = updater(current)
      if (!next) {
        continue
      }

      storage.setItem(SESSION_KEY, JSON.stringify(next))
      return next
    } catch {
      storage.removeItem(SESSION_KEY)
    }
  }

  return null
}
