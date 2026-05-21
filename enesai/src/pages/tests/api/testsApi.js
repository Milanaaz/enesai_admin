const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.DEV ? '' : 'https://enesai-backend.onrender.com')
).replace(/\/+$/, '')

const ADMIN_PLACEMENT_TEST_ENDPOINT = '/api/v1/admin/placement-test'

function extractMessage(payload, fallback) {
  if (typeof payload === 'string' && payload.trim()) return payload
  if (payload && typeof payload === 'object') {
    if (typeof payload.message === 'string' && payload.message.trim()) return payload.message
    if (typeof payload.error === 'string' && payload.error.trim()) return payload.error
    if (Array.isArray(payload.errors) && payload.errors.length > 0) {
      const detailed = payload.errors
        .map((item) => {
          if (typeof item === 'string') return item
          if (!item || typeof item !== 'object') return ''
          const path = typeof item.path === 'string' ? item.path : ''
          const message = typeof item.message === 'string' ? item.message : ''
          return [path, message].filter(Boolean).join(': ')
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

  return payload?.data
}

export async function createPlacementTest({ token, payload }) {
  return apiRequest({
    token,
    path: ADMIN_PLACEMENT_TEST_ENDPOINT,
    method: 'POST',
    body: payload,
    fallbackError: 'Не удалось создать стартовый тест',
  })
}

export async function fetchPlacementQuestions({ token }) {
  const data = await apiRequest({
    token,
    path: `${ADMIN_PLACEMENT_TEST_ENDPOINT}/questions`,
    fallbackError: 'Не удалось загрузить вопросы активного теста',
  })

  return Array.isArray(data) ? data : []
}

export async function addPlacementQuestion({ token, payload }) {
  return apiRequest({
    token,
    path: `${ADMIN_PLACEMENT_TEST_ENDPOINT}/questions`,
    method: 'POST',
    body: payload,
    fallbackError: 'Не удалось добавить вопрос',
  })
}

export async function addPlacementQuestionsBulk({ token, payload }) {
  const data = await apiRequest({
    token,
    path: `${ADMIN_PLACEMENT_TEST_ENDPOINT}/questions/bulk`,
    method: 'POST',
    body: payload,
    fallbackError: 'Не удалось добавить вопросы',
  })

  return Array.isArray(data) ? data : []
}

export async function deletePlacementQuestion({ token, questionId }) {
  if (!questionId) throw new Error('ID вопроса не указан')

  await apiRequest({
    token,
    path: `${ADMIN_PLACEMENT_TEST_ENDPOINT}/questions/${encodeURIComponent(questionId)}`,
    method: 'DELETE',
    fallbackError: 'Не удалось удалить вопрос',
  })
}

