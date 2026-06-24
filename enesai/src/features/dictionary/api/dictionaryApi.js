import { apiRequest, asPage } from '../../../shared/api/httpClient.js'


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
