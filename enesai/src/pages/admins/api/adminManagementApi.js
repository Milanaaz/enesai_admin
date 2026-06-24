const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.DEV ? '' : 'https://enesai-backend.onrender.com')
).replace(/\/+$/, '')

const ADMIN_MANAGEMENT_ENDPOINT = '/api/v1/admin/management'

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
      body: body ? JSON.stringify(body) : undefined,
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

async function requestManagementUsersPage({ token, page, size, search, role }) {
  const params = new URLSearchParams()
  params.set('page', String(page))
  params.set('size', String(size))
  if (search) params.set('search', search)
  if (role) params.set('role', role)

  return apiRequest({
    token,
    path: `${ADMIN_MANAGEMENT_ENDPOINT}/users?${params.toString()}`,
    fallbackError: 'Не удалось загрузить пользователей',
  })
}

export async function fetchManagementUsers({ token, search = '', role = '' }) {
  const size = 100
  let page = 0
  let allUsers = []

  while (true) {
    const pageData = (await requestManagementUsersPage({ token, page, size, search, role })) ?? {}
    const content = Array.isArray(pageData.content) ? pageData.content : []
    allUsers = allUsers.concat(content)

    if (pageData.last === true || content.length === 0) break
    page += 1
    if (page > 200) break
  }

  return allUsers
}

export async function createAdmin({ token, admin }) {
  return apiRequest({
    token,
    path: ADMIN_MANAGEMENT_ENDPOINT,
    method: 'POST',
    body: admin,
    fallbackError: 'Не удалось создать администратора',
  })
}

export async function updateManagementUserRole({ token, userId, role }) {
  if (!userId) throw new Error('ID пользователя не указан')
  if (!role) throw new Error('Роль пользователя не указана')

  return apiRequest({
    token,
    path: `${ADMIN_MANAGEMENT_ENDPOINT}/users/${encodeURIComponent(userId)}/role?role=${encodeURIComponent(role)}`,
    method: 'PUT',
    fallbackError: 'Не удалось обновить роль пользователя',
  })
}

export async function blockManagementUser({ token, userId }) {
  if (!userId) throw new Error('ID пользователя не указан')

  return apiRequest({
    token,
    path: `${ADMIN_MANAGEMENT_ENDPOINT}/users/${encodeURIComponent(userId)}/block`,
    method: 'POST',
    fallbackError: 'Не удалось заблокировать пользователя',
  })
}

export async function unblockManagementUser({ token, userId }) {
  if (!userId) throw new Error('ID пользователя не указан')

  return apiRequest({
    token,
    path: `${ADMIN_MANAGEMENT_ENDPOINT}/users/${encodeURIComponent(userId)}/unblock`,
    method: 'POST',
    fallbackError: 'Не удалось разблокировать пользователя',
  })
}
