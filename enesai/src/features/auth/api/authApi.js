const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.DEV ? '' : 'https://enesai-backend.onrender.com')
).replace(/\/+$/, '')

const LOGIN_ENDPOINT = '/api/v1/auth/login'

function getErrorMessage(payload, fallbackMessage) {
  if (typeof payload === 'string' && payload.trim()) {
    return payload
  }

  if (payload && typeof payload === 'object') {
    if (typeof payload.message === 'string' && payload.message.trim()) {
      return payload.message
    }

    if (typeof payload.error === 'string' && payload.error.trim()) {
      return payload.error
    }
  }

  return fallbackMessage
}

function normalizeBearerToken(token) {
  if (typeof token !== 'string') {
    return ''
  }

  return token.replace(/^Bearer\s+/i, '').trim()
}

export async function loginRequest({ email, password }) {
  const normalizedEmail = email.trim()

  let response
  try {
    response = await fetch(`${API_BASE_URL}${LOGIN_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        email: normalizedEmail,
        password,
      }),
    })
  } catch {
    throw new Error('Сервер недоступен. Проверьте подключение и CORS/proxy.')
  }

  let payload = null
  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  if (!response.ok) {
    throw new Error(getErrorMessage(payload, 'Ошибка входа в систему'))
  }

  const authPayload = payload?.data
  const accessToken = normalizeBearerToken(authPayload?.accessToken)
  if (!accessToken) {
    throw new Error('Сервер вернул некорректный ответ при входе')
  }

  const apiUser = authPayload?.user ?? {}
  const role = typeof apiUser.role === 'string' ? apiUser.role.trim().toLowerCase() : ''

  return {
    token: accessToken,
    refreshToken: typeof authPayload?.refreshToken === 'string' ? authPayload.refreshToken : null,
    user: {
      ...apiUser,
      email: typeof apiUser.email === 'string' ? apiUser.email : normalizedEmail,
      role: role || 'user',
      name:
        typeof apiUser.name === 'string'
          ? apiUser.name
          : [apiUser.firstName, apiUser.lastName].filter(Boolean).join(' ') || normalizedEmail,
    },
  }
}
