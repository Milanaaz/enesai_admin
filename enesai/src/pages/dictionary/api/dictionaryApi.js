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

async function apiRequest({ token, path, method = 'GET', body, fallbackError }) {
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
    throw new Error(extractMessage(payload, `${fallbackError} (${response.status})`))
  }

  return payload?.data ?? payload
}

function asPage(data) {
  return {
    content: Array.isArray(data?.content) ? data.content : Array.isArray(data) ? data : [],
    totalElements: Number(data?.totalElements || 0),
    totalPages: Number(data?.totalPages || 0),
  }
}

export async function fetchPlatformWords({ token, search = '', level = '', topic = '', page = 0, size = 100 }) {
  const params = new URLSearchParams()
  params.set('page', String(page))
  params.set('size', String(size))
  if (search) params.set('search', search)
  if (level) params.set('level', level)
  if (topic) params.set('topic', topic)

  const data = await apiRequest({
    token,
    path: `/api/v1/words?${params.toString()}`,
    fallbackError: 'Не удалось загрузить слова',
  })
  return asPage(data)
}

export async function fetchPlatformWordById({ token, wordId }) {
  if (!wordId) throw new Error('ID слова не указан')
  return apiRequest({
    token,
    path: `/api/v1/words/${encodeURIComponent(wordId)}`,
    fallbackError: 'Не удалось загрузить слово',
  })
}

export async function createAdminWord({ token, payload }) {
  return apiRequest({
    token,
    path: '/api/v1/admin/words',
    method: 'POST',
    body: payload,
    fallbackError: 'Не удалось создать слово',
  })
}

export async function updateAdminWord({ token, wordId, payload }) {
  if (!wordId) throw new Error('ID слова не указан')
  return apiRequest({
    token,
    path: `/api/v1/admin/words/${encodeURIComponent(wordId)}`,
    method: 'PUT',
    body: payload,
    fallbackError: 'Не удалось обновить слово',
  })
}

export async function deleteAdminWord({ token, wordId }) {
  if (!wordId) throw new Error('ID слова не указан')
  return apiRequest({
    token,
    path: `/api/v1/admin/words/${encodeURIComponent(wordId)}`,
    method: 'DELETE',
    fallbackError: 'Не удалось удалить слово',
  })
}
