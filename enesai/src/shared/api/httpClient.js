export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.DEV ? '' : 'https://enesai-backend.onrender.com')
).replace(/\/+$/, '')

export function extractApiMessage(payload, fallback) {
  if (typeof payload === 'string' && payload.trim()) return payload
  if (payload && typeof payload === 'object') {
    if (typeof payload.message === 'string' && payload.message.trim()) return payload.message
    if (typeof payload.error === 'string' && payload.error.trim()) return payload.error
    if (Array.isArray(payload.errors) && payload.errors.length > 0) {
      const detailed = payload.errors
        .map((item) => {
          if (typeof item === 'string') return item
          if (!item || typeof item !== 'object') return ''
          return [item.path, item.message].filter(Boolean).join(': ')
        })
        .filter(Boolean)
        .join('; ')

      if (detailed) return detailed
    }
    if (Array.isArray(payload.details) && payload.details.length > 0) {
      const detailed = payload.details
        .map((item) => (typeof item === 'string' ? item : ''))
        .filter(Boolean)
        .join('; ')
      if (detailed) return detailed
    }
  }
  return fallback
}

export function normalizeBearerToken(token) {
  if (typeof token !== 'string') return ''
  return token.replace(/^Bearer\s+/i, '').trim()
}

export async function apiRequest({ token, path, method = 'GET', body, fallbackError = 'Ошибка запроса' }) {
  const normalizedToken = normalizeBearerToken(token)
  if (!normalizedToken) throw new Error('Токен авторизации отсутствует')

  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${normalizedToken}`,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
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
    throw new Error(extractApiMessage(payload, `${fallbackError} (${response.status})`))
  }

  return payload?.data ?? payload
}

export function asPage(data) {
  return {
    content: Array.isArray(data?.content) ? data.content : Array.isArray(data) ? data : [],
    totalElements: Number(data?.totalElements || 0),
    totalPages: Number(data?.totalPages || 0),
  }
}
