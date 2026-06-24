import { apiRequest } from '../../../shared/api/httpClient.js'

export async function fetchMyAnalytics({ token }) {
  return apiRequest({
    token,
    path: '/api/v1/analytics/me',
    fallbackError: 'Не удалось загрузить аналитику',
  })
}
