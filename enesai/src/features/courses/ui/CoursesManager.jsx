import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../auth/context/useAuth.js'
import AdminIcon from '../../../shared/ui/AdminIcon.jsx'
import Toast from '../../../shared/ui/Toast/Toast.jsx'
import {
  addAdminLessonWord,
  archiveAdminCourse,
  createAdminCourse,
  createAdminExercise,
  createAdminLesson,
  createAdminModule,
  createAdminTest,
  createAdminWord,
  deleteAdminCourse,
  deleteAdminExercise,
  deleteAdminLesson,
  deleteAdminLessonWord,
  deleteAdminModule,
  deleteAdminTest,
  deleteAdminWord,
  fetchAdminCourseById,
  fetchAdminCourseModules,
  fetchAdminCourseTest,
  fetchAdminCourses,
  fetchAdminExerciseById,
  fetchAdminLessonById,
  fetchAdminLessonExercises,
  fetchAdminLessonWords,
  fetchAdminModuleById,
  fetchAdminModuleLessons,
  fetchAdminModuleTest,
  fetchAdminTestById,
  fetchAdminTests,
  publishAdminCourse,
  updateAdminCourse,
  updateAdminExercise,
  updateAdminLesson,
  updateAdminModule,
  updateAdminWord,
} from '../api/coursesApi.js'

const ALL_LEVELS = 'Все уровни'
const ALL_STATUSES = 'Все статусы'
const levelOptions = ['A1', 'A2', 'B1', 'B2']
const exerciseTypes = ['FLASHCARD', 'TRANSLATION', 'MULTIPLE_CHOICE', 'FILL_BLANK', 'MATCHING', 'LISTENING', 'SPEAKING']
const typeOptions = [
  { value: 'GENERAL', label: 'Общий' },
  { value: 'ORT', label: 'О� Т' },
  { value: 'CONVERSATIONAL', label: '� азговорный' },
  { value: 'BUSINESS', label: 'Бизнес' },
  { value: 'GRAMMAR', label: 'Грамматика' },
  { value: 'READING', label: 'Чтение' },
  { value: 'PRONUNCIATION', label: 'Произношение' },
]
const statusLabels = { DRAFT: 'Черновик', PUBLISHED: 'Опубликован', ARCHIVED: 'Архив' }

function byOrder(a, b) {
  return Number(a?.orderIndex ?? 0) - Number(b?.orderIndex ?? 0)
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString('ru-RU')
}

function emptyCourseForm() {
  return {
    title: '',
    description: '',
    coverUrl: '',
    level: 'A1',
    type: 'GENERAL',
    targetAudience: '',
    learningGoals: '',
    certificatePassScore: 70,
  }
}

function emptyModuleForm(courseId = '') {
  return { courseId, title: '', description: '', orderIndex: 0 }
}

function emptyLessonForm(moduleId = '') {
  return {
    moduleId,
    title: '',
    description: '',
    videoUrl: '',
    videoDurationSec: 0,
    subtitlesUrl: '',
    textContent: '',
    orderIndex: 0,
  }
}

function emptyWordForm() {
  return {
    word: '',
    translation: '',
    transcription: '',
    exampleKg: '',
    exampleRu: '',
    audioUrl: '',
    level: 'A1',
    topic: '',
    synonyms: '',
  }
}

function emptyExerciseForm(lessonId = '') {
  return {
    lessonId,
    type: 'MULTIPLE_CHOICE',
    questionText: '',
    audioUrl: '',
    imageUrl: '',
    correctAnswer: '',
    hint: '',
    xpReward: 10,
    orderIndex: 0,
    optionsText: 'Вариант 1|true\nВариант 2|false',
  }
}

function emptyTestForm(scope = 'course', targetId = '') {
  return {
    scope,
    targetId,
    title: '',
    description: '',
    passingScore: 70,
    timeLimitMinutes: 0,
    maxAttempts: 0,
    questionText: '',
    questionType: 'MULTIPLE_CHOICE',
    correctAnswer: '',
    points: 1,
    optionsText: 'Вариант 1|true\nВариант 2|false',
  }
}

function courseToPayload(form) {
  return {
    title: form.title.trim(),
    description: form.description.trim(),
    coverUrl: form.coverUrl.trim(),
    level: form.level,
    type: form.type,
    targetAudience: form.targetAudience.trim(),
    learningGoals: form.learningGoals.trim(),
    certificatePassScore: Number(form.certificatePassScore) || 70,
  }
}

function moduleToPayload(form) {
  return {
    courseId: form.courseId,
    title: form.title.trim(),
    description: form.description.trim(),
    orderIndex: Number(form.orderIndex) || 0,
  }
}

function lessonToPayload(form) {
  return {
    moduleId: form.moduleId,
    title: form.title.trim(),
    description: form.description.trim(),
    videoUrl: form.videoUrl.trim(),
    videoDurationSec: Number(form.videoDurationSec) || 0,
    subtitlesUrl: form.subtitlesUrl.trim(),
    textContent: form.textContent.trim(),
    orderIndex: Number(form.orderIndex) || 0,
  }
}

function wordToPayload(form) {
  return {
    word: form.word.trim(),
    translation: form.translation.trim(),
    transcription: form.transcription.trim(),
    exampleKg: form.exampleKg.trim(),
    exampleRu: form.exampleRu.trim(),
    audioUrl: form.audioUrl.trim(),
    level: form.level,
    topic: form.topic.trim(),
    synonyms: form.synonyms.trim(),
  }
}

function parseOptions(text) {
  return String(text || '')
    .split('\n')
    .map((line, index) => {
      const [optionText, correct = 'false', matchText = ''] = line.split('|')
      return {
        text: String(optionText || '').trim(),
        correct: String(correct).trim().toLowerCase() === 'true',
        matchText: String(matchText || '').trim(),
        orderIndex: index,
      }
    })
    .filter((option) => option.text)
}

function exerciseToPayload(form) {
  return {
    lessonId: form.lessonId,
    type: form.type,
    questionText: form.questionText.trim(),
    audioUrl: form.audioUrl.trim(),
    imageUrl: form.imageUrl.trim(),
    correctAnswer: form.correctAnswer.trim(),
    hint: form.hint.trim(),
    xpReward: Number(form.xpReward) || 0,
    orderIndex: Number(form.orderIndex) || 0,
    options: parseOptions(form.optionsText),
  }
}

function testToPayload(form) {
  const question = {
    type: form.questionType,
    questionText: form.questionText.trim(),
    correctAnswer: form.correctAnswer.trim(),
    points: Number(form.points) || 1,
    orderIndex: 0,
    options: parseOptions(form.optionsText),
  }

  return {
    courseId: form.scope === 'course' ? form.targetId : undefined,
    moduleId: form.scope === 'module' ? form.targetId : undefined,
    title: form.title.trim(),
    description: form.description.trim(),
    passingScore: Number(form.passingScore) || 70,
    timeLimitMinutes: Number(form.timeLimitMinutes) || 0,
    maxAttempts: Number(form.maxAttempts) || 0,
    questions: [question],
  }
}

function CoursesManager() {
  const { token } = useAuth()
  const [courses, setCourses] = useState([])
  const [courseDetail, setCourseDetail] = useState(null)
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [selectedModuleId, setSelectedModuleId] = useState('')
  const [selectedLessonId, setSelectedLessonId] = useState('')
  const [modules, setModules] = useState([])
  const [lessons, setLessons] = useState([])
  const [lessonWords, setLessonWords] = useState([])
  const [lessonExercises, setLessonExercises] = useState([])
  const [tests, setTests] = useState([])
  const [scopeTest, setScopeTest] = useState(null)
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState(ALL_LEVELS)
  const [statusFilter, setStatusFilter] = useState(ALL_STATUSES)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState('')
  const [modal, setModal] = useState(null)
  const [lessonTab, setLessonTab] = useState('content')

  const [courseForm, setCourseForm] = useState(emptyCourseForm)
  const [moduleForm, setModuleForm] = useState(emptyModuleForm)
  const [lessonForm, setLessonForm] = useState(emptyLessonForm)
  const [wordForm, setWordForm] = useState(emptyWordForm)
  const [attachWordId, setAttachWordId] = useState('')
  const [exerciseForm, setExerciseForm] = useState(emptyExerciseForm)
  const [testForm, setTestForm] = useState(emptyTestForm)

  const selectedModule = useMemo(() => modules.find((item) => item.id === selectedModuleId) || null, [modules, selectedModuleId])
  const selectedLesson = useMemo(() => lessons.find((item) => item.id === selectedLessonId) || null, [lessons, selectedLessonId])

  const loadCourses = useCallback(async () => {
    setBusy('load-courses')
    setError('')
    try {
      const rows = await fetchAdminCourses({ token })
      setCourses(rows)
      setSelectedCourseId((current) => current || rows[0]?.id || '')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить курсы')
    } finally {
      setBusy('')
    }
  }, [token])

  const loadCourse = useCallback(async () => {
    if (!selectedCourseId) return
    setError('')
    try {
      const [detail, courseModules, allTests] = await Promise.all([
        fetchAdminCourseById({ token, courseId: selectedCourseId }),
        fetchAdminCourseModules({ token, courseId: selectedCourseId }),
        fetchAdminTests({ token }),
      ])
      setCourseDetail(detail)
      const nextModules = [...courseModules].sort(byOrder)
      setModules(nextModules)
      setTests(allTests)
      setModuleForm(emptyModuleForm(selectedCourseId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить курс')
    }
  }, [selectedCourseId, token])

  const loadModule = useCallback(async () => {
    if (!selectedModuleId) {
      setLessons([])
      return
    }
    setError('')
    try {
      const [moduleDetail, moduleLessons] = await Promise.all([
        fetchAdminModuleById({ token, moduleId: selectedModuleId }),
        fetchAdminModuleLessons({ token, moduleId: selectedModuleId }),
      ])
      setModules((current) => current.map((item) => (item.id === moduleDetail.id ? moduleDetail : item)))
      const nextLessons = [...moduleLessons].sort(byOrder)
      setLessons(nextLessons)
      setSelectedLessonId((current) => current || nextLessons[0]?.id || '')
      setLessonForm(emptyLessonForm(selectedModuleId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить модуль')
    }
  }, [selectedModuleId, token])

  const loadLessonAssets = useCallback(async () => {
    if (!selectedLessonId) {
      setLessonWords([])
      setLessonExercises([])
      return
    }
    setError('')
    try {
      const [lessonDetail, words, exercises] = await Promise.all([
        fetchAdminLessonById({ token, lessonId: selectedLessonId }),
        fetchAdminLessonWords({ token, lessonId: selectedLessonId }),
        fetchAdminLessonExercises({ token, lessonId: selectedLessonId }),
      ])
      setLessons((current) => current.map((item) => (item.id === lessonDetail.id ? lessonDetail : item)))
      setLessonWords(words)
      setLessonExercises([...exercises].sort(byOrder))
      setExerciseForm(emptyExerciseForm(selectedLessonId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить урок')
    }
  }, [selectedLessonId, token])

  useEffect(() => {
    loadCourses()
  }, [loadCourses])

  useEffect(() => {
    loadCourse()
  }, [loadCourse])

  useEffect(() => {
    loadModule()
  }, [loadModule])

  useEffect(() => {
    loadLessonAssets()
  }, [loadLessonAssets])

  const filteredCourses = useMemo(() => {
    const query = search.trim().toLowerCase()
    return courses.filter((course) => {
      const matchesSearch = !query || String(course.title || '').toLowerCase().includes(query)
      const matchesLevel = levelFilter === ALL_LEVELS || course.level === levelFilter
      const matchesStatus = statusFilter === ALL_STATUSES || course.status === statusFilter
      return matchesSearch && matchesLevel && matchesStatus
    })
  }, [courses, levelFilter, search, statusFilter])

  const summary = useMemo(() => ({
    total: courses.length,
    published: courses.filter((item) => item.status === 'PUBLISHED').length,
    drafts: courses.filter((item) => item.status === 'DRAFT').length,
    archived: courses.filter((item) => item.status === 'ARCHIVED').length,
  }), [courses])

  async function runAction(actionName, callback, successMessage) {
    setBusy(actionName)
    setError('')
    setInfo('')
    try {
      await callback()
      setInfo(successMessage)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Операция не выполнена')
    } finally {
      setBusy('')
    }
  }

  function openCourseModal(mode) {
    if (mode === 'edit' && courseDetail) {
      setCourseForm({
        title: courseDetail.title || '',
        description: courseDetail.description || '',
        coverUrl: courseDetail.coverUrl || '',
        level: courseDetail.level || 'A1',
        type: courseDetail.type || 'GENERAL',
        targetAudience: courseDetail.targetAudience || '',
        learningGoals: courseDetail.learningGoals || '',
        certificatePassScore: courseDetail.certificatePassScore || 70,
      })
    } else {
      setCourseForm(emptyCourseForm())
    }
    setModal({ type: 'course', mode })
  }

  function openModuleModal(mode, module = null) {
    setModuleForm(module ? {
      courseId: selectedCourseId,
      title: module.title || '',
      description: module.description || '',
      orderIndex: module.orderIndex || 0,
    } : emptyModuleForm(selectedCourseId))
    setModal({ type: 'module', mode, id: module?.id || '' })
  }

  function openLessonModal(mode, lesson = null) {
    setLessonForm(lesson ? {
      moduleId: selectedModuleId,
      title: lesson.title || '',
      description: lesson.description || '',
      videoUrl: lesson.videoUrl || '',
      videoDurationSec: lesson.videoDurationSec || 0,
      subtitlesUrl: lesson.subtitlesUrl || '',
      textContent: lesson.textContent || '',
      orderIndex: lesson.orderIndex || 0,
    } : emptyLessonForm(selectedModuleId))
    setModal({ type: 'lesson', mode, id: lesson?.id || '' })
  }

  function openExerciseModal(mode, exercise = null) {
    setExerciseForm(exercise ? {
      lessonId: selectedLessonId,
      type: exercise.type || 'MULTIPLE_CHOICE',
      questionText: exercise.questionText || '',
      audioUrl: exercise.audioUrl || '',
      imageUrl: exercise.imageUrl || '',
      correctAnswer: exercise.correctAnswer || '',
      hint: exercise.hint || '',
      xpReward: exercise.xpReward || 10,
      orderIndex: exercise.orderIndex || 0,
      optionsText: (exercise.options || []).map((option) => `${option.text || ''}|${option.correct ? 'true' : 'false'}|${option.matchText || ''}`).join('\n'),
    } : emptyExerciseForm(selectedLessonId))
    setModal({ type: 'exercise', mode, id: exercise?.id || '' })
  }

  function openWordModal(mode, lessonWord = null) {
    const word = lessonWord?.word || null
    setWordForm(word ? {
      word: word.word || '',
      translation: word.translation || '',
      transcription: word.transcription || '',
      exampleKg: word.exampleKg || '',
      exampleRu: word.exampleRu || '',
      audioUrl: word.audioUrl || '',
      level: word.level || 'A1',
      topic: word.topic || '',
      synonyms: word.synonyms || '',
    } : emptyWordForm())
    setModal({ type: 'word', mode, id: word?.id || '', lessonWordId: lessonWord?.id || '' })
  }

  function openTestModal(scope) {
    const targetId = scope === 'course' ? selectedCourseId : selectedModuleId
    setTestForm(emptyTestForm(scope, targetId))
    setModal({ type: 'test', mode: 'create' })
  }

  async function saveCourse(event) {
    event.preventDefault()
    await runAction('save-course', async () => {
      if (modal.mode === 'edit') {
        await updateAdminCourse({ token, courseId: selectedCourseId, payload: courseToPayload(courseForm) })
      } else {
        const created = await createAdminCourse({ token, payload: courseToPayload(courseForm) })
        setSelectedCourseId(created?.id || '')
      }
      setModal(null)
      await loadCourses()
      await loadCourse()
    }, modal.mode === 'edit' ? 'Курс обновлен' : 'Курс создан')
  }

  async function saveModule(event) {
    event.preventDefault()
    await runAction('save-module', async () => {
      if (modal.mode === 'edit') {
        await updateAdminModule({ token, moduleId: modal.id, payload: moduleToPayload(moduleForm) })
      } else {
        await createAdminModule({ token, payload: moduleToPayload(moduleForm) })
      }
      setModal(null)
      await loadCourse()
    }, modal.mode === 'edit' ? 'Модуль обновлен' : 'Модуль создан')
  }

  async function saveLesson(event) {
    event.preventDefault()
    await runAction('save-lesson', async () => {
      if (modal.mode === 'edit') {
        await updateAdminLesson({ token, lessonId: modal.id, payload: lessonToPayload(lessonForm) })
      } else {
        await createAdminLesson({ token, payload: lessonToPayload(lessonForm) })
      }
      setModal(null)
      await loadModule()
    }, modal.mode === 'edit' ? 'Урок обновлен' : 'Урок создан')
  }

  async function saveExercise(event) {
    event.preventDefault()
    await runAction('save-exercise', async () => {
      if (modal.mode === 'edit') {
        await fetchAdminExerciseById({ token, exerciseId: modal.id })
        await updateAdminExercise({ token, exerciseId: modal.id, payload: exerciseToPayload(exerciseForm) })
      } else {
        await createAdminExercise({ token, payload: exerciseToPayload(exerciseForm) })
      }
      setModal(null)
      await loadLessonAssets()
    }, modal.mode === 'edit' ? 'Упражнение обновлено' : 'Упражнение создано')
  }

  async function saveWord(event) {
    event.preventDefault()
    await runAction('save-word', async () => {
      if (modal.mode === 'edit') {
        await updateAdminWord({ token, wordId: modal.id, payload: wordToPayload(wordForm) })
      } else {
        const created = await createAdminWord({ token, payload: wordToPayload(wordForm) })
        if (selectedLessonId && created?.id) {
          await addAdminLessonWord({ token, lessonId: selectedLessonId, wordId: created.id })
        }
      }
      setModal(null)
      await loadLessonAssets()
    }, modal.mode === 'edit' ? 'Слово обновлено' : 'Слово создано и добавлено')
  }

  async function saveTest(event) {
    event.preventDefault()
    await runAction('save-test', async () => {
      await createAdminTest({ token, payload: testToPayload(testForm) })
      setModal(null)
      setTests(await fetchAdminTests({ token }))
    }, 'Тест создан')
  }

  async function loadScopeTest(scope, id) {
    await runAction('load-test', async () => {
      const test = scope === 'course'
        ? await fetchAdminCourseTest({ token, courseId: id })
        : await fetchAdminModuleTest({ token, moduleId: id })
      if (test?.id) await fetchAdminTestById({ token, testId: test.id })
      setScopeTest(test)
    }, 'Тест загружен')
  }

  return (
    <section className="admin-page courses-page">
      <header className="courses-page-header">
        <div>
          <h1>Управление курсами</h1>
          <p>Курсы, модули, уроки, слова, упражнения и тесты</p>
        </div>
        <button type="button" className="courses-create-btn" onClick={() => openCourseModal('create')}>
          <AdminIcon name="plus" className="admin-icon" />
          Создать курс
        </button>
      </header>

      <div className="courses-summary-grid">
        <article className="courses-summary-card"><p>Всего курсов</p><strong>{summary.total}</strong></article>
        <article className="courses-summary-card"><p>Опубликованных</p><strong className="is-green">{summary.published}</strong></article>
        <article className="courses-summary-card"><p>Черновиков</p><strong>{summary.drafts}</strong></article>
        <article className="courses-summary-card"><p>В архиве</p><strong className="is-violet">{summary.archived}</strong></article>
      </div>

      <section className="courses-filters" aria-label="Фильтрация курсов">
        <label className="courses-search">
          <AdminIcon name="search" className="admin-icon" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Поиск курсов..." />
        </label>
        <select value={levelFilter} onChange={(event) => setLevelFilter(event.target.value)}>
          <option>{ALL_LEVELS}</option>
          {levelOptions.map((level) => <option key={level}>{level}</option>)}
        </select>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option>{ALL_STATUSES}</option>
          <option value="PUBLISHED">Опубликован</option>
          <option value="DRAFT">Черновик</option>
          <option value="ARCHIVED">Архив</option>
        </select>
      </section>

      {error ? <Toast message={error} tone="error" onClose={() => setError('')} /> : null}
      {info ? <Toast message={info} onClose={() => setInfo('')} /> : null}

      <div className="courses-lms-layout">
        <aside className="courses-tree-panel">
          <header className="course-section-header">
            <h3>Структура курса</h3>
            <button type="button" className="courses-secondary-btn" onClick={loadCourses}>Обновить</button>
          </header>

          {busy === 'load-courses' ? <div className="courses-empty">Загрузка курсов...</div> : null}
          {filteredCourses.length === 0 ? <div className="courses-empty">Курсы не найдены</div> : null}

          <div className="course-tree">
            {filteredCourses.map((course) => {
              const isCourseActive = course.id === selectedCourseId
              const courseModules = isCourseActive ? modules : []

              return (
                <article className={`course-tree-course ${isCourseActive ? 'is-active' : ''}`} key={course.id}>
                  <button
                    type="button"
                    className="course-tree-node course-tree-node--course"
                    onClick={() => {
                      setSelectedCourseId(course.id)
                      setSelectedModuleId('')
                      setSelectedLessonId('')
                      setScopeTest(null)
                    }}
                  >
                    <span>Курс</span>
                    <strong>{course.title}</strong>
                    <em>{formatNumber(course.totalModules)} мод. · {formatNumber(course.totalLessons)} ур.</em>
                  </button>

                  {isCourseActive ? (
                    <div className="course-tree-children">
                      {courseModules.map((module, moduleIndex) => {
                        const moduleLessons = module.id === selectedModuleId ? lessons : [...(module.lessons || [])].sort(byOrder)
                        return (
                          <div className="course-tree-module" key={module.id}>
                            <button
                              type="button"
                              className={`course-tree-node course-tree-node--module ${module.id === selectedModuleId && !selectedLessonId ? 'is-selected' : ''}`}
                              onClick={() => {
                                setSelectedModuleId(module.id)
                                setSelectedLessonId('')
                                setScopeTest(null)
                              }}
                            >
                              <span>Модуль {moduleIndex + 1}</span>
                              <strong>{module.title}</strong>
                              <em>{module.totalLessons ?? moduleLessons.length} урок.</em>
                            </button>

                            <div className="course-tree-lessons">
                              {moduleLessons.map((lesson, lessonIndex) => {
                                const isLessonActive = lesson.id === selectedLessonId
                                return (
                                  <button
                                    type="button"
                                    className={`course-tree-node course-tree-node--lesson ${isLessonActive ? 'is-selected' : ''}`}
                                    key={lesson.id}
                                    onClick={() => {
                                      setSelectedModuleId(module.id)
                                      setSelectedLessonId(lesson.id)
                                      setLessonTab('content')
                                      setScopeTest(null)
                                    }}
                                  >
                                    <span>Урок {lessonIndex + 1}</span>
                                    <strong>{lesson.title}</strong>
                                    <em>{isLessonActive ? `Слова ${lessonWords.length} · Упр. ${lessonExercises.length}` : 'Контент, слова, упражнения'}</em>
                                  </button>
                                )
                              })}

                              <button
                                type="button"
                                className="course-tree-node course-tree-node--test"
                                onClick={() => {
                                  setSelectedModuleId(module.id)
                                  setSelectedLessonId('')
                                  loadScopeTest('module', module.id)
                                }}
                              >
                                <span>Тест</span>
                                <strong>Тест модуля</strong>
                                <em>{module.title}</em>
                              </button>
                            </div>
                          </div>
                        )
                      })}

                      <button
                        type="button"
                        className="course-tree-node course-tree-node--final"
                        onClick={() => {
                          setSelectedModuleId('')
                          setSelectedLessonId('')
                          loadScopeTest('course', course.id)
                        }}
                      >
                        <span>Итог</span>
                        <strong>Итоговый тест курса</strong>
                        <em>{course.title}</em>
                      </button>
                    </div>
                  ) : null}
                </article>
              )
            })}
          </div>
        </aside>

        <section className="courses-detail-panel course-lms-detail">
          {!courseDetail ? <div className="courses-empty">Выберите курс слева</div> : null}

          {courseDetail && !selectedModuleId && !selectedLessonId && !scopeTest ? (
            <>
              <header className="course-detail-header">
                <div>
                  <span className="course-detail-kicker">Курс · {courseDetail.level} · {statusLabels[courseDetail.status] || courseDetail.status}</span>
                  <h2>{courseDetail.title}</h2>
                  <p>{courseDetail.description || 'Описание курса не заполнено'}</p>
                </div>
                <div className="course-detail-actions">
                  <button type="button" className="courses-secondary-btn" onClick={() => openCourseModal('edit')}>� едактировать</button>
                  <button type="button" className="courses-primary-btn" disabled={courseDetail.status !== 'DRAFT'} onClick={() => runAction('publish-course', async () => { await publishAdminCourse({ token, courseId: selectedCourseId }); await loadCourses(); await loadCourse() }, 'Курс опубликован')}>Опубликовать</button>
                  <button type="button" className="courses-secondary-btn" onClick={() => runAction('archive-course', async () => { await archiveAdminCourse({ token, courseId: selectedCourseId }); await loadCourses(); await loadCourse() }, 'Курс архивирован')}>Архивировать</button>
                  <button type="button" className="courses-secondary-btn is-danger-action" onClick={() => window.confirm('Удалить курс?') && runAction('delete-course', async () => { await deleteAdminCourse({ token, courseId: selectedCourseId }); setSelectedCourseId(''); setCourseDetail(null); await loadCourses() }, 'Курс удален')}>Удалить</button>
                </div>
              </header>

              <div className="course-overview-grid">
                <article><span>Модулей</span><strong>{modules.length}</strong></article>
                <article><span>Уроков</span><strong>{courseDetail.totalLessons || lessons.length}</strong></article>
                <article><span>Порог сертификата</span><strong>{courseDetail.certificatePassScore || 70}%</strong></article>
                <article><span>Тестов в админке</span><strong>{tests.length}</strong></article>
              </div>

              <div className="course-detail-actions course-detail-actions--left">
                <button type="button" className="courses-primary-btn" onClick={() => openModuleModal('create')}>Добавить модуль</button>
                <button type="button" className="courses-secondary-btn" onClick={() => openTestModal('course')}>Создать итоговый тест</button>
                <button type="button" className="courses-secondary-btn" onClick={() => loadScopeTest('course', selectedCourseId)}>Открыть итоговый тест</button>
              </div>
            </>
          ) : null}

          {courseDetail && selectedModule && !selectedLessonId && !scopeTest ? (
            <>
              <header className="course-detail-header">
                <div>
                  <span className="course-detail-kicker">Модуль · {courseDetail.title}</span>
                  <h2>{selectedModule.title}</h2>
                  <p>{selectedModule.description || 'Описание модуля не заполнено'}</p>
                </div>
                <div className="course-detail-actions">
                  <button type="button" className="courses-secondary-btn" onClick={() => openModuleModal('edit', selectedModule)}>� едактировать модуль</button>
                  <button type="button" className="courses-secondary-btn is-danger-action" onClick={() => window.confirm('Удалить модуль?') && runAction('delete-module', async () => { await deleteAdminModule({ token, moduleId: selectedModuleId }); setSelectedModuleId(''); await loadCourse() }, 'Модуль удален')}>Удалить модуль</button>
                </div>
              </header>

              <section className="course-detail-section">
                <header className="course-section-header">
                  <h3>Уроки модуля</h3>
                  <button type="button" className="courses-primary-btn" onClick={() => openLessonModal('create')}>Добавить урок</button>
                </header>
                <div className="asset-list">
                  {lessons.map((lesson, index) => (
                    <button type="button" className="course-stack-item" key={lesson.id} onClick={() => { setSelectedLessonId(lesson.id); setLessonTab('content') }}>
                      <strong>Урок {index + 1}. {lesson.title}</strong>
                      <span>{lesson.description || 'Описание урока не заполнено'}</span>
                    </button>
                  ))}
                  {lessons.length === 0 ? <div className="courses-empty">В модуле пока нет уроков</div> : null}
                </div>
              </section>

              <div className="course-detail-actions course-detail-actions--left">
                <button type="button" className="courses-secondary-btn" onClick={() => openTestModal('module')}>Создать тест модуля</button>
                <button type="button" className="courses-secondary-btn" onClick={() => loadScopeTest('module', selectedModuleId)}>Открыть тест модуля</button>
              </div>
            </>
          ) : null}

          {courseDetail && selectedLesson ? (
            <>
              <header className="course-detail-header">
                <div>
                  <span className="course-detail-kicker">{selectedModule?.title || 'Модуль'} · урок</span>
                  <h2>{selectedLesson.title}</h2>
                  <p>{selectedLesson.description || 'Описание урока не заполнено'}</p>
                </div>
                <div className="course-detail-actions">
                  <button type="button" className="courses-secondary-btn" onClick={() => openLessonModal('edit', selectedLesson)}>� едактировать урок</button>
                  <button type="button" className="courses-secondary-btn is-danger-action" onClick={() => window.confirm('Удалить урок?') && runAction('delete-lesson', async () => { await deleteAdminLesson({ token, lessonId: selectedLessonId }); setSelectedLessonId(''); await loadModule() }, 'Урок удален')}>Удалить урок</button>
                </div>
              </header>

              <div className="lesson-tabs">
                <button type="button" className={lessonTab === 'content' ? 'is-active' : ''} onClick={() => setLessonTab('content')}>Контент</button>
                <button type="button" className={lessonTab === 'words' ? 'is-active' : ''} onClick={() => setLessonTab('words')}>Слова ({lessonWords.length})</button>
                <button type="button" className={lessonTab === 'exercises' ? 'is-active' : ''} onClick={() => setLessonTab('exercises')}>Упражнения ({lessonExercises.length})</button>
              </div>

              {lessonTab === 'content' ? (
                <section className="course-detail-section">
                  <div className="course-overview-grid">
                    <article><span>Видео</span><strong>{selectedLesson.videoUrl ? 'Есть' : 'Нет'}</strong></article>
                    <article><span>Длительность</span><strong>{selectedLesson.videoDurationSec ? `${Math.ceil(Number(selectedLesson.videoDurationSec) / 60)} мин` : '-'}</strong></article>
                    <article><span>Субтитры</span><strong>{selectedLesson.subtitlesUrl ? 'Есть' : 'Нет'}</strong></article>
                  </div>
                  <p className="lesson-content-preview">{selectedLesson.textContent || 'Текст урока не заполнен'}</p>
                </section>
              ) : null}

              {lessonTab === 'words' ? (
                <section className="course-detail-section">
                  <header className="course-section-header">
                    <h3>Слова этого урока</h3>
                    <button type="button" className="courses-primary-btn" onClick={() => openWordModal('create')}>Создать слово</button>
                  </header>
                  <form className="course-attach-row" onSubmit={(event) => {
                    event.preventDefault()
                    runAction('attach-word', async () => { await addAdminLessonWord({ token, lessonId: selectedLessonId, wordId: attachWordId }); setAttachWordId(''); await loadLessonAssets() }, 'Слово добавлено к уроку')
                  }}>
                    <input value={attachWordId} onChange={(event) => setAttachWordId(event.target.value)} placeholder="Word ID для добавления существующего слова" />
                    <button type="submit" className="courses-secondary-btn" disabled={!attachWordId}>Добавить по ID</button>
                  </form>
                  <div className="asset-list">
                    {lessonWords.map((item) => (
                      <div className="asset-row" key={item.id}>
                        <div><strong>{item.word?.word}</strong><span>{item.word?.translation}</span></div>
                        <div className="asset-actions">
                          <button type="button" onClick={() => openWordModal('edit', item)}>Изм.</button>
                          <button type="button" onClick={() => window.confirm('Убрать слово из урока?') && runAction('delete-lesson-word', async () => { await deleteAdminLessonWord({ token, lessonWordId: item.id }); await loadLessonAssets() }, 'Слово убрано из урока')}>Убрать</button>
                          <button type="button" onClick={() => item.word?.id && window.confirm('Удалить слово из словаря?') && runAction('delete-word', async () => { await deleteAdminWord({ token, wordId: item.word.id }); await loadLessonAssets() }, 'Слово удалено')}>Удалить</button>
                        </div>
                      </div>
                    ))}
                    {lessonWords.length === 0 ? <div className="courses-empty">Слов нет</div> : null}
                  </div>
                </section>
              ) : null}

              {lessonTab === 'exercises' ? (
                <section className="course-detail-section">
                  <header className="course-section-header">
                    <h3>Упражнения этого урока</h3>
                    <button type="button" className="courses-primary-btn" onClick={() => openExerciseModal('create')}>Создать упражнение</button>
                  </header>
                  <div className="asset-list">
                    {lessonExercises.map((exercise) => (
                      <div className="asset-row" key={exercise.id}>
                        <div><strong>{exercise.questionText}</strong><span>{exercise.type} · {exercise.xpReward || 0} XP</span></div>
                        <div className="asset-actions">
                          <button type="button" onClick={() => openExerciseModal('edit', exercise)}>Изм.</button>
                          <button type="button" onClick={() => window.confirm('Удалить упражнение?') && runAction('delete-exercise', async () => { await deleteAdminExercise({ token, exerciseId: exercise.id }); await loadLessonAssets() }, 'Упражнение удалено')}>Удалить</button>
                        </div>
                      </div>
                    ))}
                    {lessonExercises.length === 0 ? <div className="courses-empty">Упражнений нет</div> : null}
                  </div>
                </section>
              ) : null}
            </>
          ) : null}

          {courseDetail && scopeTest && !selectedLessonId ? (
            <section className="course-detail-section">
              <header className="course-detail-header">
                <div>
                  <span className="course-detail-kicker">Тест</span>
                  <h2>{scopeTest.title || 'Тест не найден'}</h2>
                  <p>{scopeTest.description || 'Описание теста не заполнено'}</p>
                </div>
                <div className="course-detail-actions">
                  {scopeTest.id ? <button type="button" className="courses-secondary-btn is-danger-action" onClick={() => window.confirm('Удалить тест?') && runAction('delete-test', async () => { await deleteAdminTest({ token, testId: scopeTest.id }); setScopeTest(null); setTests(await fetchAdminTests({ token })) }, 'Тест удален')}>Удалить тест</button> : null}
                </div>
              </header>
              <div className="course-test-preview">
                <strong>{scopeTest.totalQuestions || 0} вопросов</strong>
                <span>Проходной балл: {scopeTest.passingScore || 0}% · попыток: {scopeTest.maxAttempts || 0}</span>
              </div>
            </section>
          ) : null}
        </section>
      </div>

      {modal?.type === 'course' ? (
        <Modal title={modal.mode === 'edit' ? '� едактировать курс' : 'Создать курс'} onClose={() => setModal(null)} onSubmit={saveCourse} busy={busy === 'save-course'}>
          <CourseForm form={courseForm} setForm={setCourseForm} />
        </Modal>
      ) : null}

      {modal?.type === 'module' ? (
        <Modal title={modal.mode === 'edit' ? '� едактировать модуль' : 'Создать модуль'} onClose={() => setModal(null)} onSubmit={saveModule} busy={busy === 'save-module'}>
          <ModuleForm form={moduleForm} setForm={setModuleForm} />
        </Modal>
      ) : null}

      {modal?.type === 'lesson' ? (
        <Modal title={modal.mode === 'edit' ? '� едактировать урок' : 'Создать урок'} onClose={() => setModal(null)} onSubmit={saveLesson} busy={busy === 'save-lesson'}>
          <LessonForm form={lessonForm} setForm={setLessonForm} />
        </Modal>
      ) : null}

      {modal?.type === 'word' ? (
        <Modal title={modal.mode === 'edit' ? '� едактировать слово' : 'Создать слово'} onClose={() => setModal(null)} onSubmit={saveWord} busy={busy === 'save-word'}>
          <WordForm form={wordForm} setForm={setWordForm} />
        </Modal>
      ) : null}

      {modal?.type === 'exercise' ? (
        <Modal title={modal.mode === 'edit' ? '� едактировать упражнение' : 'Создать упражнение'} onClose={() => setModal(null)} onSubmit={saveExercise} busy={busy === 'save-exercise'}>
          <ExerciseForm form={exerciseForm} setForm={setExerciseForm} />
        </Modal>
      ) : null}

      {modal?.type === 'test' ? (
        <Modal title="Создать тест" onClose={() => setModal(null)} onSubmit={saveTest} busy={busy === 'save-test'}>
          <TestForm form={testForm} setForm={setTestForm} />
        </Modal>
      ) : null}
    </section>
  )
}

function Modal({ title, children, onClose, onSubmit, busy }) {
  return (
    <div className="courses-modal-overlay" role="dialog" aria-modal="true">
      <form className="courses-modal" onSubmit={onSubmit}>
        <header className="courses-modal-header">
          <div><span>Admin</span><h2>{title}</h2></div>
          <button type="button" onClick={onClose} aria-label="Закрыть">x</button>
        </header>
        <div className="courses-modal-body course-form-grid">{children}</div>
        <footer className="courses-modal-footer">
          <button type="submit" className="courses-primary-btn" disabled={busy}>Сохранить</button>
        </footer>
      </form>
    </div>
  )
}

function Field({ label, children, full = false }) {
  return <label className={full ? 'course-form-full' : ''}>{label}{children}</label>
}

function CourseForm({ form, setForm }) {
  return (
    <>
      <Field label="Название"><input required value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} /></Field>
      <Field label="Уровень"><select value={form.level} onChange={(event) => setForm((current) => ({ ...current, level: event.target.value }))}>{levelOptions.map((level) => <option key={level}>{level}</option>)}</select></Field>
      <Field label="Тип"><select value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}>{typeOptions.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}</select></Field>
      <Field label="Порог сертификата"><input type="number" min="50" max="100" value={form.certificatePassScore} onChange={(event) => setForm((current) => ({ ...current, certificatePassScore: event.target.value }))} /></Field>
      <Field label="Описание" full><textarea rows={3} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} /></Field>
      <Field label="Cover URL" full><input value={form.coverUrl} onChange={(event) => setForm((current) => ({ ...current, coverUrl: event.target.value }))} /></Field>
      <Field label="Целевая аудитория"><input value={form.targetAudience} onChange={(event) => setForm((current) => ({ ...current, targetAudience: event.target.value }))} /></Field>
      <Field label="Цели обучения"><input value={form.learningGoals} onChange={(event) => setForm((current) => ({ ...current, learningGoals: event.target.value }))} /></Field>
    </>
  )
}

function ModuleForm({ form, setForm }) {
  return (
    <>
      <Field label="Название" full><input required value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} /></Field>
      <Field label="Описание" full><textarea rows={3} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} /></Field>
      <Field label="Порядок"><input type="number" value={form.orderIndex} onChange={(event) => setForm((current) => ({ ...current, orderIndex: event.target.value }))} /></Field>
    </>
  )
}

function LessonForm({ form, setForm }) {
  return (
    <>
      <Field label="Название" full><input required value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} /></Field>
      <Field label="Описание" full><textarea rows={3} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} /></Field>
      <Field label="Video URL"><input value={form.videoUrl} onChange={(event) => setForm((current) => ({ ...current, videoUrl: event.target.value }))} /></Field>
      <Field label="Длительность, сек"><input type="number" value={form.videoDurationSec} onChange={(event) => setForm((current) => ({ ...current, videoDurationSec: event.target.value }))} /></Field>
      <Field label="Subtitles URL"><input value={form.subtitlesUrl} onChange={(event) => setForm((current) => ({ ...current, subtitlesUrl: event.target.value }))} /></Field>
      <Field label="Порядок"><input type="number" value={form.orderIndex} onChange={(event) => setForm((current) => ({ ...current, orderIndex: event.target.value }))} /></Field>
      <Field label="Текст урока" full><textarea rows={5} value={form.textContent} onChange={(event) => setForm((current) => ({ ...current, textContent: event.target.value }))} /></Field>
    </>
  )
}

function WordForm({ form, setForm }) {
  return (
    <>
      <Field label="Слово"><input required value={form.word} onChange={(event) => setForm((current) => ({ ...current, word: event.target.value }))} /></Field>
      <Field label="Перевод"><input required value={form.translation} onChange={(event) => setForm((current) => ({ ...current, translation: event.target.value }))} /></Field>
      <Field label="Уровень"><select value={form.level} onChange={(event) => setForm((current) => ({ ...current, level: event.target.value }))}>{levelOptions.map((level) => <option key={level}>{level}</option>)}</select></Field>
      <Field label="Тема"><input value={form.topic} onChange={(event) => setForm((current) => ({ ...current, topic: event.target.value }))} /></Field>
      <Field label="Транскрипция"><input value={form.transcription} onChange={(event) => setForm((current) => ({ ...current, transcription: event.target.value }))} /></Field>
      <Field label="Audio URL"><input value={form.audioUrl} onChange={(event) => setForm((current) => ({ ...current, audioUrl: event.target.value }))} /></Field>
      <Field label="Пример KG" full><input value={form.exampleKg} onChange={(event) => setForm((current) => ({ ...current, exampleKg: event.target.value }))} /></Field>
      <Field label="Пример RU" full><input value={form.exampleRu} onChange={(event) => setForm((current) => ({ ...current, exampleRu: event.target.value }))} /></Field>
      <Field label="Синонимы" full><input value={form.synonyms} onChange={(event) => setForm((current) => ({ ...current, synonyms: event.target.value }))} /></Field>
    </>
  )
}

function ExerciseForm({ form, setForm }) {
  return (
    <>
      <Field label="Тип"><select value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}>{exerciseTypes.map((type) => <option key={type}>{type}</option>)}</select></Field>
      <Field label="XP"><input type="number" min="0" max="100" value={form.xpReward} onChange={(event) => setForm((current) => ({ ...current, xpReward: event.target.value }))} /></Field>
      <Field label="Вопрос" full><input required value={form.questionText} onChange={(event) => setForm((current) => ({ ...current, questionText: event.target.value }))} /></Field>
      <Field label="Правильный ответ"><input value={form.correctAnswer} onChange={(event) => setForm((current) => ({ ...current, correctAnswer: event.target.value }))} /></Field>
      <Field label="Подсказка"><input value={form.hint} onChange={(event) => setForm((current) => ({ ...current, hint: event.target.value }))} /></Field>
      <Field label="Audio URL"><input value={form.audioUrl} onChange={(event) => setForm((current) => ({ ...current, audioUrl: event.target.value }))} /></Field>
      <Field label="Image URL"><input value={form.imageUrl} onChange={(event) => setForm((current) => ({ ...current, imageUrl: event.target.value }))} /></Field>
      <Field label="Опции: text|true/false|matchText" full><textarea rows={5} value={form.optionsText} onChange={(event) => setForm((current) => ({ ...current, optionsText: event.target.value }))} /></Field>
    </>
  )
}

function TestForm({ form, setForm }) {
  return (
    <>
      <Field label="Название"><input required value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} /></Field>
      <Field label="Проходной балл"><input type="number" min="50" max="100" value={form.passingScore} onChange={(event) => setForm((current) => ({ ...current, passingScore: event.target.value }))} /></Field>
      <Field label="Описание" full><textarea rows={2} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} /></Field>
      <Field label="Лимит, мин"><input type="number" value={form.timeLimitMinutes} onChange={(event) => setForm((current) => ({ ...current, timeLimitMinutes: event.target.value }))} /></Field>
      <Field label="Попытки"><input type="number" value={form.maxAttempts} onChange={(event) => setForm((current) => ({ ...current, maxAttempts: event.target.value }))} /></Field>
      <Field label="Тип вопроса"><select value={form.questionType} onChange={(event) => setForm((current) => ({ ...current, questionType: event.target.value }))}>{exerciseTypes.map((type) => <option key={type}>{type}</option>)}</select></Field>
      <Field label="Баллы"><input type="number" min="1" max="10" value={form.points} onChange={(event) => setForm((current) => ({ ...current, points: event.target.value }))} /></Field>
      <Field label="Вопрос" full><input required value={form.questionText} onChange={(event) => setForm((current) => ({ ...current, questionText: event.target.value }))} /></Field>
      <Field label="Правильный ответ" full><input value={form.correctAnswer} onChange={(event) => setForm((current) => ({ ...current, correctAnswer: event.target.value }))} /></Field>
      <Field label="Опции: text|true/false|matchText" full><textarea rows={5} value={form.optionsText} onChange={(event) => setForm((current) => ({ ...current, optionsText: event.target.value }))} /></Field>
    </>
  )
}

export default CoursesManager
