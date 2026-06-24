const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.DEV ? '' : 'https://enesai-backend.onrender.com')
).replace(/\/+$/, '')

const CERTIFICATES_ENDPOINT = '/api/v1/certificates'

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

export function getCertificatePdfUrl(pdfUrl) {
  if (!pdfUrl) return ''
  if (/^https?:\/\//i.test(pdfUrl)) return pdfUrl
  return `${API_BASE_URL}${pdfUrl.startsWith('/') ? '' : '/'}${pdfUrl}`
}

export async function fetchMyCertificates({ token }) {
  const data = await apiRequest({
    token,
    path: `${CERTIFICATES_ENDPOINT}/my`,
    fallbackError: 'Не удалось загрузить сертификаты',
  })

  return Array.isArray(data) ? data : []
}

export async function issueCertificate({ token, courseId }) {
  if (!courseId) throw new Error('ID курса не указан')

  return apiRequest({
    token,
    path: CERTIFICATES_ENDPOINT,
    method: 'POST',
    body: { courseId },
    fallbackError: 'Не удалось запросить сертификат',
  })
}

export async function fetchCertificateById({ token, certificateId }) {
  if (!certificateId) throw new Error('ID сертификата не указан')

  return apiRequest({
    token,
    path: `${CERTIFICATES_ENDPOINT}/${encodeURIComponent(certificateId)}`,
    fallbackError: 'Не удалось загрузить сертификат',
  })
}

export async function verifyCertificateByCode({ token, verificationCode }) {
  if (!verificationCode) throw new Error('Код проверки не указан')

  return apiRequest({
    token,
    path: `${CERTIFICATES_ENDPOINT}/verify/${encodeURIComponent(verificationCode)}`,
    fallbackError: 'Не удалось проверить сертификат',
  })
}

export async function revokeCertificate({ token, certificateId }) {
  if (!certificateId) throw new Error('ID сертификата не указан')

  return apiRequest({
    token,
    path: `${CERTIFICATES_ENDPOINT}/${encodeURIComponent(certificateId)}/revoke`,
    method: 'POST',
    fallbackError: 'Не удалось отозвать сертификат',
  })
}

export async function restoreCertificate({ token, certificateId }) {
  if (!certificateId) throw new Error('ID сертификата не указан')

  return apiRequest({
    token,
    path: `${CERTIFICATES_ENDPOINT}/${encodeURIComponent(certificateId)}/restore`,
    method: 'POST',
    fallbackError: 'Не удалось восстановить сертификат',
  })
}
