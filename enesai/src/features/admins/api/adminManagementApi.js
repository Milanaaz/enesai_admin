import { apiRequest } from '../../../shared/api/httpClient.js'

const ADMIN_MANAGEMENT_ENDPOINT = '/api/v1/admin/management'

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
