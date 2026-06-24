const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.DEV ? '' : 'https://enesai-backend.onrender.com')
).replace(/\/+$/, '')

function extractMessage(payload, fallback) {
  if (typeof payload === 'string' && payload.trim()) return payload
  if (payload && typeof payload === 'object') {
    if (typeof payload.message === 'string' && payload.message.trim()) return payload.message
    if (typeof payload.error === 'string' && payload.error.trim()) return payload.error
  }
  return fallback
}

function normalizeBearerToken(token) {
  if (typeof token !== 'string') return ''
  return token.replace(/^Bearer\s+/i, '').trim()
}

async function apiRequest({ token, path, fallbackError }) {
  const normalizedToken = normalizeBearerToken(token)
  if (!normalizedToken) throw new Error('Токен авторизации отсутствует')

  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${normalizedToken}`,
      },
    })
  } catch {
    throw new Error('Не удалось подключиться к серверу')
  }

  let payload = null
  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  if (!response.ok) {
    throw new Error(extractMessage(payload, `${fallbackError} (${response.status})`))
  }

  return payload?.data
}

export async function fetchMyAnalytics({ token }) {
  return apiRequest({
    token,
    path: '/api/v1/analytics/me',
    fallbackError: 'Не удалось загрузить аналитику',
  })
}
