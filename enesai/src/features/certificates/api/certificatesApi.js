import { API_BASE_URL, apiRequest } from '../../../shared/api/httpClient.js'

const CERTIFICATES_ENDPOINT = '/api/v1/certificates'

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
