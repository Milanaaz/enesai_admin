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
        'Sessionid':'',
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
  }
}

export async function fetchBooksCatalog({ token, search = '', level = '', genre = '', page = 0, size = 100 }) {
  const params = new URLSearchParams()
  params.set('page', String(page))
  params.set('size', String(size))
  if (search) params.set('search', search)
  if (level) params.set('level', level)
  if (genre) params.set('genre', genre)

  const data = await apiRequest({
    token,
    path: `/api/v1/books?${params.toString()}`,
    fallbackError: 'Не удалось загрузить книги',
  })
  return asPage(data)
}

export async function fetchBookById({ token, bookId }) {
  if (!bookId) throw new Error('ID книги не указан')
  return apiRequest({
    token,
    path: `/api/v1/books/${encodeURIComponent(bookId)}`,
    fallbackError: 'Не удалось загрузить книгу',
  })
}

export async function fetchBookPage({ token, bookId, pageNumber }) {
  if (!bookId) throw new Error('ID книги не указан')
  return apiRequest({
    token,
    path: `/api/v1/books/${encodeURIComponent(bookId)}/pages/${encodeURIComponent(pageNumber || 1)}`,
    fallbackError: 'Не удалось загрузить страницу книги',
  })
}

export async function createAdminBook({ token, payload }) {
  return apiRequest({
    token,
    path: '/api/v1/admin/books',
    method: 'POST',
    body: payload,
    fallbackError: 'Не удалось создать книгу',
  })
}

export async function deleteAdminBook({ token, bookId }) {
  if (!bookId) throw new Error('ID книги не указан')
  return apiRequest({
    token,
    path: `/api/v1/admin/books/${encodeURIComponent(bookId)}`,
    method: 'DELETE',
    fallbackError: 'Не удалось удалить книгу',
  })
}

export async function publishAdminBook({ token, bookId }) {
  if (!bookId) throw new Error('ID книги не указан')
  return apiRequest({
    token,
    path: `/api/v1/admin/books/${encodeURIComponent(bookId)}/publish`,
    method: 'POST',
    fallbackError: 'Не удалось опубликовать книгу',
  })
}

export async function createAdminBookPage({ token, payload }) {
  return apiRequest({
    token,
    path: '/api/v1/admin/books/pages',
    method: 'POST',
    body: payload,
    fallbackError: 'Не удалось добавить страницу',
  })
}
