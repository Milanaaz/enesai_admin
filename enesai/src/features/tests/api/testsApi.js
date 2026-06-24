import { apiRequest } from '../../../shared/api/httpClient.js'

const ADMIN_PLACEMENT_TEST_ENDPOINT = '/api/v1/admin/placement-test'

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

