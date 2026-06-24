import { apiRequest } from '../../../shared/api/httpClient.js'

const ADMIN_COURSES_ENDPOINT = '/api/v1/admin/courses'
const ADMIN_MODULES_ENDPOINT = '/api/v1/admin/modules'
const ADMIN_LESSONS_ENDPOINT = '/api/v1/admin/lessons'
const ADMIN_LESSON_WORDS_ENDPOINT = '/api/v1/admin/lesson-words'
const ADMIN_WORDS_ENDPOINT = '/api/v1/admin/words'
const ADMIN_EXERCISES_ENDPOINT = '/api/v1/admin/exercises'
const ADMIN_TESTS_ENDPOINT = '/api/v1/admin/tests'

function asPageContent(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.content)) return data.content
  return []
}

export async function fetchAdminCourses({ token }) {
  const data = await apiRequest({
    token,
    path: `${ADMIN_COURSES_ENDPOINT}?page=0&size=100`,
    fallbackError: 'Не удалось загрузить курсы',
  })

  return asPageContent(data)
}

export async function fetchAdminCourseById({ token, courseId }) {
  if (!courseId) throw new Error('ID курса не указан')
  return apiRequest({
    token,
    path: `${ADMIN_COURSES_ENDPOINT}/${encodeURIComponent(courseId)}`,
    fallbackError: 'Не удалось загрузить курс',
  })
}

export async function createAdminCourse({ token, payload }) {
  return apiRequest({
    token,
    path: ADMIN_COURSES_ENDPOINT,
    method: 'POST',
    body: payload,
    fallbackError: 'Не удалось создать курс',
  })
}

export async function updateAdminCourse({ token, courseId, payload }) {
  if (!courseId) throw new Error('ID курса не указан')
  return apiRequest({
    token,
    path: `${ADMIN_COURSES_ENDPOINT}/${encodeURIComponent(courseId)}`,
    method: 'PUT',
    body: payload,
    fallbackError: 'Не удалось обновить курс',
  })
}

export async function deleteAdminCourse({ token, courseId }) {
  if (!courseId) throw new Error('ID курса не указан')
  return apiRequest({
    token,
    path: `${ADMIN_COURSES_ENDPOINT}/${encodeURIComponent(courseId)}`,
    method: 'DELETE',
    fallbackError: 'Не удалось удалить курс',
  })
}

export async function publishAdminCourse({ token, courseId }) {
  if (!courseId) throw new Error('ID курса не указан')
  return apiRequest({
    token,
    path: `${ADMIN_COURSES_ENDPOINT}/${encodeURIComponent(courseId)}/publish`,
    method: 'POST',
    fallbackError: 'Не удалось опубликовать курс',
  })
}

export async function archiveAdminCourse({ token, courseId }) {
  if (!courseId) throw new Error('ID курса не указан')
  return apiRequest({
    token,
    path: `${ADMIN_COURSES_ENDPOINT}/${encodeURIComponent(courseId)}/archive`,
    method: 'POST',
    fallbackError: 'Не удалось архивировать курс',
  })
}

export async function createAdminModule({ token, payload }) {
  return apiRequest({
    token,
    path: ADMIN_MODULES_ENDPOINT,
    method: 'POST',
    body: payload,
    fallbackError: 'Не удалось создать модуль',
  })
}

export async function createAdminLesson({ token, payload }) {
  return apiRequest({
    token,
    path: ADMIN_LESSONS_ENDPOINT,
    method: 'POST',
    body: payload,
    fallbackError: 'Не удалось создать урок',
  })
}

export async function fetchAdminCourseModules({ token, courseId }) {
  if (!courseId) throw new Error('ID курса не указан')
  const data = await apiRequest({
    token,
    path: `${ADMIN_COURSES_ENDPOINT}/${encodeURIComponent(courseId)}/modules`,
    fallbackError: 'Не удалось загрузить модули курса',
  })
  return Array.isArray(data) ? data : []
}

export async function fetchAdminModuleById({ token, moduleId }) {
  if (!moduleId) throw new Error('ID модуля не указан')
  return apiRequest({
    token,
    path: `${ADMIN_MODULES_ENDPOINT}/${encodeURIComponent(moduleId)}`,
    fallbackError: 'Не удалось загрузить модуль',
  })
}

export async function updateAdminModule({ token, moduleId, payload }) {
  if (!moduleId) throw new Error('ID модуля не указан')
  return apiRequest({
    token,
    path: `${ADMIN_MODULES_ENDPOINT}/${encodeURIComponent(moduleId)}`,
    method: 'PUT',
    body: payload,
    fallbackError: 'Не удалось обновить модуль',
  })
}

export async function deleteAdminModule({ token, moduleId }) {
  if (!moduleId) throw new Error('ID модуля не указан')
  return apiRequest({
    token,
    path: `${ADMIN_MODULES_ENDPOINT}/${encodeURIComponent(moduleId)}`,
    method: 'DELETE',
    fallbackError: 'Не удалось удалить модуль',
  })
}

export async function fetchAdminModuleLessons({ token, moduleId }) {
  if (!moduleId) throw new Error('ID модуля не указан')
  const data = await apiRequest({
    token,
    path: `${ADMIN_MODULES_ENDPOINT}/${encodeURIComponent(moduleId)}/lessons`,
    fallbackError: 'Не удалось загрузить уроки модуля',
  })
  return Array.isArray(data) ? data : []
}

export async function fetchAdminLessonById({ token, lessonId }) {
  if (!lessonId) throw new Error('ID урока не указан')
  return apiRequest({
    token,
    path: `${ADMIN_LESSONS_ENDPOINT}/${encodeURIComponent(lessonId)}`,
    fallbackError: 'Не удалось загрузить урок',
  })
}

export async function updateAdminLesson({ token, lessonId, payload }) {
  if (!lessonId) throw new Error('ID урока не указан')
  return apiRequest({
    token,
    path: `${ADMIN_LESSONS_ENDPOINT}/${encodeURIComponent(lessonId)}`,
    method: 'PUT',
    body: payload,
    fallbackError: 'Не удалось обновить урок',
  })
}

export async function deleteAdminLesson({ token, lessonId }) {
  if (!lessonId) throw new Error('ID урока не указан')
  return apiRequest({
    token,
    path: `${ADMIN_LESSONS_ENDPOINT}/${encodeURIComponent(lessonId)}`,
    method: 'DELETE',
    fallbackError: 'Не удалось удалить урок',
  })
}

export async function fetchAdminLessonWords({ token, lessonId }) {
  if (!lessonId) throw new Error('ID урока не указан')
  const data = await apiRequest({
    token,
    path: `${ADMIN_LESSONS_ENDPOINT}/${encodeURIComponent(lessonId)}/words`,
    fallbackError: 'Не удалось загрузить слова урока',
  })
  return Array.isArray(data) ? data : []
}

export async function addAdminLessonWord({ token, lessonId, wordId }) {
  if (!lessonId) throw new Error('ID урока не указан')
  if (!wordId) throw new Error('ID слова не указан')
  return apiRequest({
    token,
    path: `${ADMIN_LESSONS_ENDPOINT}/${encodeURIComponent(lessonId)}/words/${encodeURIComponent(wordId)}`,
    method: 'POST',
    fallbackError: 'Не удалось добавить слово к уроку',
  })
}

export async function deleteAdminLessonWord({ token, lessonWordId }) {
  if (!lessonWordId) throw new Error('ID связи слова с уроком не указан')
  return apiRequest({
    token,
    path: `${ADMIN_LESSON_WORDS_ENDPOINT}/${encodeURIComponent(lessonWordId)}`,
    method: 'DELETE',
    fallbackError: 'Не удалось убрать слово из урока',
  })
}

export async function createAdminWord({ token, payload }) {
  return apiRequest({
    token,
    path: ADMIN_WORDS_ENDPOINT,
    method: 'POST',
    body: payload,
    fallbackError: 'Не удалось создать слово',
  })
}

export async function updateAdminWord({ token, wordId, payload }) {
  if (!wordId) throw new Error('ID слова не указан')
  return apiRequest({
    token,
    path: `${ADMIN_WORDS_ENDPOINT}/${encodeURIComponent(wordId)}`,
    method: 'PUT',
    body: payload,
    fallbackError: 'Не удалось обновить слово',
  })
}

export async function deleteAdminWord({ token, wordId }) {
  if (!wordId) throw new Error('ID слова не указан')
  return apiRequest({
    token,
    path: `${ADMIN_WORDS_ENDPOINT}/${encodeURIComponent(wordId)}`,
    method: 'DELETE',
    fallbackError: 'Не удалось удалить слово',
  })
}

export async function fetchAdminLessonExercises({ token, lessonId }) {
  if (!lessonId) throw new Error('ID урока не указан')
  const data = await apiRequest({
    token,
    path: `${ADMIN_LESSONS_ENDPOINT}/${encodeURIComponent(lessonId)}/exercises`,
    fallbackError: 'Не удалось загрузить упражнения урока',
  })
  return Array.isArray(data) ? data : []
}

export async function createAdminExercise({ token, payload }) {
  return apiRequest({
    token,
    path: ADMIN_EXERCISES_ENDPOINT,
    method: 'POST',
    body: payload,
    fallbackError: 'Не удалось создать упражнение',
  })
}

export async function fetchAdminExerciseById({ token, exerciseId }) {
  if (!exerciseId) throw new Error('ID упражнения не указан')
  return apiRequest({
    token,
    path: `${ADMIN_EXERCISES_ENDPOINT}/${encodeURIComponent(exerciseId)}`,
    fallbackError: 'Не удалось загрузить упражнение',
  })
}

export async function updateAdminExercise({ token, exerciseId, payload }) {
  if (!exerciseId) throw new Error('ID упражнения не указан')
  return apiRequest({
    token,
    path: `${ADMIN_EXERCISES_ENDPOINT}/${encodeURIComponent(exerciseId)}`,
    method: 'PUT',
    body: payload,
    fallbackError: 'Не удалось обновить упражнение',
  })
}

export async function deleteAdminExercise({ token, exerciseId }) {
  if (!exerciseId) throw new Error('ID упражнения не указан')
  return apiRequest({
    token,
    path: `${ADMIN_EXERCISES_ENDPOINT}/${encodeURIComponent(exerciseId)}`,
    method: 'DELETE',
    fallbackError: 'Не удалось удалить упражнение',
  })
}

export async function fetchAdminTests({ token }) {
  const data = await apiRequest({
    token,
    path: `${ADMIN_TESTS_ENDPOINT}?page=0&size=100`,
    fallbackError: 'Не удалось загрузить тесты',
  })
  return asPageContent(data)
}

export async function createAdminTest({ token, payload }) {
  return apiRequest({
    token,
    path: ADMIN_TESTS_ENDPOINT,
    method: 'POST',
    body: payload,
    fallbackError: 'Не удалось создать тест',
  })
}

export async function fetchAdminTestById({ token, testId }) {
  if (!testId) throw new Error('ID теста не указан')
  return apiRequest({
    token,
    path: `${ADMIN_TESTS_ENDPOINT}/${encodeURIComponent(testId)}`,
    fallbackError: 'Не удалось загрузить тест',
  })
}

export async function deleteAdminTest({ token, testId }) {
  if (!testId) throw new Error('ID теста не указан')
  return apiRequest({
    token,
    path: `${ADMIN_TESTS_ENDPOINT}/${encodeURIComponent(testId)}`,
    method: 'DELETE',
    fallbackError: 'Не удалось удалить тест',
  })
}

export async function fetchAdminCourseTest({ token, courseId }) {
  if (!courseId) throw new Error('ID курса не указан')
  return apiRequest({
    token,
    path: `${ADMIN_COURSES_ENDPOINT}/${encodeURIComponent(courseId)}/test`,
    fallbackError: 'Не удалось загрузить тест курса',
  })
}

export async function fetchAdminModuleTest({ token, moduleId }) {
  if (!moduleId) throw new Error('ID модуля не указан')
  return apiRequest({
    token,
    path: `${ADMIN_MODULES_ENDPOINT}/${encodeURIComponent(moduleId)}/test`,
    fallbackError: 'Не удалось загрузить тест модуля',
  })
}
