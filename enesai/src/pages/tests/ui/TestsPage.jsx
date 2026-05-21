import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../../features/auth/context/AuthProvider.jsx'
import AdminIcon from '../../admin/ui/components/AdminIcon.jsx'
import {
  addPlacementQuestion,
  createPlacementTest,
  deletePlacementQuestion,
  fetchPlacementQuestions,
} from '../api/testsApi.js'
import './tests-page.css'

const TYPE_OPTIONS = [
  { value: 'SINGLE_CHOICE', backendType: 'MULTIPLE_CHOICE', label: 'Один ответ' },
  { value: 'MULTI_CHOICE', backendType: 'MULTIPLE_CHOICE', label: 'Несколько ответов' },
  { value: 'FLASHCARD', backendType: 'FLASHCARD', label: 'Текстовый ответ' },
  { value: 'LISTENING', backendType: 'LISTENING', label: 'Аудио вопрос' },
]
const LEVEL_OPTIONS = ['A1', 'A2', 'B1', 'B2']
const BACKEND_TYPE_ENUM = new Set([
  'FLASHCARD',
  'TRANSLATION',
  'MULTIPLE_CHOICE',
  'FILL_BLANK',
  'MATCHING',
  'LISTENING',
  'SPEAKING',
])
const CATEGORY_OPTIONS = [
  { value: 'GRAMMAR', label: 'Грамматика' },
  { value: 'VOCABULARY', label: 'Лексика' },
  { value: 'READING', label: 'Чтение' },
  { value: 'LISTENING', label: 'Аудирование' },
  { value: 'MIXED', label: 'Смешанный' },
]

const BLOCK_BY_LABEL = {
  Грамматика: 'GRAMMAR',
  Лексика: 'VOCABULARY',
  Чтение: 'READING',
  Аудирование: 'LISTENING',
  Смешанный: 'MIXED',
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function createEmptyQuestionDraft() {
  return {
    clientId: makeId(),
    questionText: '',
    audioUrl: '',
    type: 'SINGLE_CHOICE',
    level: 'A1',
    block: 'GRAMMAR',
    orderIndex: 0,
    options: [
      { text: '', correct: true, orderIndex: 0 },
      { text: '', correct: false, orderIndex: 1 },
    ],
  }
}

function toBackendType(typeValue) {
  const option = TYPE_OPTIONS.find((item) => item.value === typeValue)
  if (option) return option.backendType
  if (typeof typeValue === 'string' && BACKEND_TYPE_ENUM.has(typeValue)) return typeValue
  return 'MULTIPLE_CHOICE'
}

function isSingleChoiceType(typeValue) {
  return typeValue === 'SINGLE_CHOICE'
}

function getQuestionTypeLabel(question) {
  const backendType = question?.type
  if (backendType === 'MULTIPLE_CHOICE') {
    const correctCount = Array.isArray(question?.options)
      ? question.options.filter((option) => Boolean(option?.correct)).length
      : 0
    return correctCount > 1 ? 'Несколько ответов' : 'Один ответ'
  }

  if (backendType === 'FLASHCARD') return 'Текстовый ответ'
  if (backendType === 'LISTENING') return 'Аудио вопрос'
  if (backendType === 'TRANSLATION') return 'Перевод'
  if (backendType === 'FILL_BLANK') return 'Заполнить пропуск'
  if (backendType === 'MATCHING') return 'Сопоставление'
  if (backendType === 'SPEAKING') return 'Разговорный ответ'
  return backendType || '-'
}

function getBlockLabel(blockValue) {
  const block = typeof blockValue === 'string' ? blockValue.trim() : ''
  if (!block) return '-'
  const option = CATEGORY_OPTIONS.find((item) => item.value === block)
  return option ? option.label : block
}

function normalizeBlockValue(rawValue) {
  const value = typeof rawValue === 'string' ? rawValue.trim() : ''
  if (!value) return 'GRAMMAR'
  const option = CATEGORY_OPTIONS.find((item) => item.value === value)
  if (option) return option.value
  if (BLOCK_BY_LABEL[value]) return BLOCK_BY_LABEL[value]
  return 'GRAMMAR'
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function formatDate(value) {
  if (!value) return 'Нет данных'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return 'Нет данных'
  return parsed.toLocaleString('ru-RU')
}

function normalizeQuestionPayload(question, questionIndex) {
  const normalizedOptions = question.options
    .filter((option) => option.text.trim().length > 0)
    .map((option, index) => ({
      text: option.text.trim(),
      correct: Boolean(option.correct),
      orderIndex: index,
    }))

  const correctTexts = normalizedOptions
    .filter((option) => option.correct)
    .map((option) => option.text)

  return {
    questionText: question.questionText.trim(),
    audioUrl: question.audioUrl.trim(),
    type: toBackendType(question.type),
    level: question.level,
    block: normalizeBlockValue(question.block),
    orderIndex: questionIndex,
    correctAnswer: correctTexts.join(' | '),
    options: normalizedOptions,
  }
}

function normalizeQuestionsFromDraft(draft) {
  return draft
    .filter((question) => question.questionText.trim().length > 0)
    .map((question, index) => normalizeQuestionPayload(question, index))
}

function validateNormalizedQuestions(normalizedQuestions, sourceDraftQuestions = null) {
  if (normalizedQuestions.length === 0) {
    throw new Error('Добавьте хотя бы один вопрос с заполненным текстом')
  }

  const hasInvalidOptions = normalizedQuestions.some((question) => question.options.length < 2)
  if (hasInvalidOptions) {
    throw new Error('У каждого вопроса должно быть минимум 2 варианта ответа')
  }

  const hasNoCorrectOption = normalizedQuestions.some(
    (question) => question.options.filter((option) => option.correct).length === 0,
  )
  if (hasNoCorrectOption) {
    throw new Error('В каждом вопросе должен быть минимум один правильный вариант')
  }

  const filteredSourceQuestions = Array.isArray(sourceDraftQuestions)
    ? sourceDraftQuestions.filter((question) => question.questionText.trim().length > 0)
    : []

  const hasInvalidSingleChoice = filteredSourceQuestions.some((question, index) => (
    isSingleChoiceType(question.type) &&
    normalizedQuestions[index] &&
    normalizedQuestions[index].options.filter((option) => option.correct).length !== 1
  ))
  if (hasInvalidSingleChoice) {
    throw new Error('Для типа "Один ответ" должен быть выбран ровно один правильный вариант')
  }
}

function TestsPage() {
  const { token } = useAuth()

  const [activeView, setActiveView] = useState('overview')
  const [questions, setQuestions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  const [isCreateTestOpen, setIsCreateTestOpen] = useState(false)
  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false)
  const [isBulkOpen, setIsBulkOpen] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState(null)

  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    a1MinScore: 20,
    a2MinScore: 40,
    b1MinScore: 60,
    b2MinScore: 80,
  })
  const [createQuestionsDraft, setCreateQuestionsDraft] = useState([createEmptyQuestionDraft()])
  const [expandedQuestionIds, setExpandedQuestionIds] = useState(new Set())

  const [questionDraft, setQuestionDraft] = useState(createEmptyQuestionDraft)
  const [bulkDraft, setBulkDraft] = useState('[\n  {\n    "questionText": "",\n    "audioUrl": "",\n    "type": "FLASHCARD",\n    "level": "A1",\n    "block": "",\n    "orderIndex": 0,\n    "correctAnswer": "",\n    "options": [\n      { "text": "", "correct": true, "orderIndex": 0 },\n      { "text": "", "correct": false, "orderIndex": 1 }\n    ]\n  }\n]')
  const [bulkMode, setBulkMode] = useState('visual')
  const [bulkQuestionsDraft, setBulkQuestionsDraft] = useState([createEmptyQuestionDraft()])
  const [expandedBulkIds, setExpandedBulkIds] = useState(new Set())

  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (createQuestionsDraft.length === 1) {
      setExpandedQuestionIds(new Set([createQuestionsDraft[0].clientId]))
    }
  }, [createQuestionsDraft])

  useEffect(() => {
    if (bulkQuestionsDraft.length === 1) {
      setExpandedBulkIds(new Set([bulkQuestionsDraft[0].clientId]))
    }
  }, [bulkQuestionsDraft])

  const loadQuestions = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const rows = await fetchPlacementQuestions({ token })
      setQuestions(rows)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось загрузить вопросы'
      setError(message)
      setQuestions([])
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    loadQuestions()
  }, [loadQuestions])

  const stats = useMemo(() => {
    const byLevel = questions.reduce((acc, item) => {
      const level = item?.level || 'N/A'
      acc[level] = (acc[level] || 0) + 1
      return acc
    }, {})

    return {
      total: questions.length,
      byLevel,
    }
  }, [questions])

  const draftStats = useMemo(() => {
    const byLevel = createQuestionsDraft.reduce((acc, question) => {
      if (!question.questionText.trim()) return acc
      acc[question.level] = (acc[question.level] || 0) + 1
      return acc
    }, {})
    const total = Object.values(byLevel).reduce((sum, count) => sum + count, 0)
    return { total, byLevel }
  }, [createQuestionsDraft])

  const placementMeta = useMemo(() => {
    const lastUpdateValue = questions.reduce((latest, question) => {
      const candidates = [question?.updatedAt, question?.createdAt]
      const numeric = candidates
        .map((value) => new Date(value).getTime())
        .filter((value) => Number.isFinite(value))
      const questionLatest = numeric.length > 0 ? Math.max(...numeric) : 0
      return Math.max(latest, questionLatest)
    }, 0)

    return {
      isCreated: questions.length > 0,
      lastUpdated: lastUpdateValue > 0 ? new Date(lastUpdateValue).toISOString() : null,
    }
  }, [questions])

  const onCreateTestSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setInfo('')
    setError('')

    try {
      if (!createForm.title.trim()) {
        throw new Error('Введите название теста')
      }

      const normalizedQuestions = normalizeQuestionsFromDraft(createQuestionsDraft)
      validateNormalizedQuestions(normalizedQuestions, createQuestionsDraft)

      const basePayload = {
        title: createForm.title.trim(),
        description: createForm.description.trim(),
        a1MinScore: toNumber(createForm.a1MinScore),
        a2MinScore: toNumber(createForm.a2MinScore),
        b1MinScore: toNumber(createForm.b1MinScore),
        b2MinScore: toNumber(createForm.b2MinScore),
      }

      let wasCreatedNow = false
      try {
        await createPlacementTest({
          token,
          payload: basePayload,
        })
        wasCreatedNow = true
      } catch (createErr) {
        const message = createErr instanceof Error ? createErr.message : ''
        const isValidationError = message.toLowerCase().includes('валидац')
        if (!isValidationError) {
          throw createErr
        }
      }

      if (normalizedQuestions.length > 0) {
        for (const questionPayload of normalizedQuestions) {
          await addPlacementQuestion({
            token,
            payload: questionPayload,
          })
        }
      }

      setInfo(wasCreatedNow ? 'Стартовый тест создан' : 'Тест уже существовал, вопросы добавлены')
      setIsCreateTestOpen(false)
      setActiveView('placement')
      setCreateQuestionsDraft([createEmptyQuestionDraft()])
      setExpandedQuestionIds(new Set())
      await loadQuestions()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось создать тест'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const onAddQuestionSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setInfo('')
    setError('')

    try {
      const normalizedOptions = questionDraft.options
        .map((option, index) => ({
          text: option.text.trim(),
          correct: Boolean(option.correct),
          orderIndex: toNumber(option.orderIndex, index),
        }))
        .filter((option) => option.text.length > 0)

      if (normalizedOptions.length < 2) {
        throw new Error('У вопроса должно быть минимум 2 варианта ответа')
      }

      const correctOptions = normalizedOptions.filter((option) => option.correct)
      if (correctOptions.length === 0) {
        throw new Error('Нужно выбрать минимум один правильный вариант')
      }

      if (isSingleChoiceType(questionDraft.type) && correctOptions.length !== 1) {
        throw new Error('Для типа "Один ответ" нужно выбрать ровно один правильный вариант')
      }

      await addPlacementQuestion({
        token,
        payload: {
          ...questionDraft,
          questionText: questionDraft.questionText.trim(),
          audioUrl: questionDraft.audioUrl.trim(),
          type: toBackendType(questionDraft.type),
          level: questionDraft.level,
          block: normalizeBlockValue(questionDraft.block),
          orderIndex: toNumber(questionDraft.orderIndex),
          correctAnswer: correctOptions.map((option) => option.text).join(' | '),
          options: normalizedOptions,
        },
      })

      setInfo('Вопрос добавлен')
      setQuestionDraft(createEmptyQuestionDraft())
      setIsAddQuestionOpen(false)
      await loadQuestions()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось добавить вопрос'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const onBulkSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setInfo('')
    setError('')

    try {
      let normalizedQuestions = []

      if (bulkMode === 'json') {
        const payload = JSON.parse(bulkDraft)
        if (!Array.isArray(payload)) {
          throw new Error('Bulk JSON должен быть массивом вопросов')
        }
        normalizedQuestions = payload.map((item, index) => normalizeQuestionPayload({
          ...createEmptyQuestionDraft(),
          ...item,
          options: Array.isArray(item?.options) ? item.options : [],
        }, index))
      } else {
        normalizedQuestions = normalizeQuestionsFromDraft(bulkQuestionsDraft)
      }

      validateNormalizedQuestions(normalizedQuestions, bulkMode === 'visual' ? bulkQuestionsDraft : null)

      for (const questionPayload of normalizedQuestions) {
        await addPlacementQuestion({
          token,
          payload: questionPayload,
        })
      }

      setInfo(`Добавлено вопросов: ${normalizedQuestions.length}`)
      setIsBulkOpen(false)
      setBulkQuestionsDraft([createEmptyQuestionDraft()])
      setExpandedBulkIds(new Set())
      await loadQuestions()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось выполнить bulk-добавление'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const onDeleteQuestion = async (question) => {
    if (!question?.id) return
    const isConfirmed = window.confirm('Удалить этот вопрос? Действие необратимо.')
    if (!isConfirmed) return

    setInfo('')
    setError('')

    try {
      await deletePlacementQuestion({ token, questionId: question.id })
      setInfo('Вопрос удален')
      if (selectedQuestion?.id === question.id) {
        setSelectedQuestion(null)
      }
      await loadQuestions()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось удалить вопрос'
      setError(message)
    }
  }

  const updateOption = (index, patch) => {
    setQuestionDraft((prev) => ({
      ...prev,
      options: prev.options.map((option, optionIndex) => (optionIndex === index ? { ...option, ...patch } : option)),
    }))
  }

  const addOption = () => {
    setQuestionDraft((prev) => ({
      ...prev,
      options: [...prev.options, { text: '', correct: false, orderIndex: prev.options.length }],
    }))
  }

  const removeOption = (index) => {
    setQuestionDraft((prev) => ({
      ...prev,
      options: prev.options.filter((_, optionIndex) => optionIndex !== index),
    }))
  }

  const updateCreateQuestion = (index, patch) => {
    setCreateQuestionsDraft((prev) =>
      prev.map((question, questionIndex) => (questionIndex === index ? { ...question, ...patch } : question)),
    )
  }

  const addCreateQuestion = () => {
    const next = createEmptyQuestionDraft()
    setCreateQuestionsDraft((prev) => [...prev, next])
    setExpandedQuestionIds((prev) => new Set(prev).add(next.clientId))
  }

  const removeCreateQuestion = (index) => {
    setCreateQuestionsDraft((prev) => {
      const next = prev.filter((_, questionIndex) => questionIndex !== index)
      return next.length > 0 ? next : [createEmptyQuestionDraft()]
    })
  }

  const updateCreateOption = (questionIndex, optionIndex, patch) => {
    setCreateQuestionsDraft((prev) =>
      prev.map((question, currentQuestionIndex) =>
        currentQuestionIndex === questionIndex
          ? {
            ...question,
            options: question.options.map((option, currentOptionIndex) =>
              currentOptionIndex === optionIndex ? { ...option, ...patch } : option,
            ),
          }
          : question,
      ),
    )
  }

  const addCreateOption = (questionIndex) => {
    setCreateQuestionsDraft((prev) =>
      prev.map((question, currentQuestionIndex) =>
        currentQuestionIndex === questionIndex
          ? {
            ...question,
            options: [...question.options, { text: '', correct: false, orderIndex: question.options.length }],
          }
          : question,
      ),
    )
  }

  const removeCreateOption = (questionIndex, optionIndex) => {
    setCreateQuestionsDraft((prev) =>
      prev.map((question, currentQuestionIndex) =>
        currentQuestionIndex === questionIndex
          ? {
            ...question,
            options: question.options.filter((_, currentOptionIndex) => currentOptionIndex !== optionIndex),
          }
          : question,
      ),
    )
  }

  const setSingleCorrectOption = (questionIndex, optionIndex) => {
    setCreateQuestionsDraft((prev) =>
      prev.map((question, currentQuestionIndex) =>
        currentQuestionIndex === questionIndex
          ? {
            ...question,
            options: question.options.map((option, currentOptionIndex) => ({
              ...option,
              correct: currentOptionIndex === optionIndex,
            })),
          }
          : question,
      ),
    )
  }

  const toggleQuestionExpanded = (questionId) => {
    setExpandedQuestionIds((prev) => {
      const next = new Set(prev)
      if (next.has(questionId)) next.delete(questionId)
      else next.add(questionId)
      return next
    })
  }

  const bulkStats = useMemo(() => {
    const byLevel = bulkQuestionsDraft.reduce((acc, question) => {
      if (!question.questionText.trim()) return acc
      acc[question.level] = (acc[question.level] || 0) + 1
      return acc
    }, {})
    const total = Object.values(byLevel).reduce((sum, count) => sum + count, 0)
    return { total, byLevel }
  }, [bulkQuestionsDraft])

  const updateBulkQuestion = (index, patch) => {
    setBulkQuestionsDraft((prev) =>
      prev.map((question, questionIndex) => (questionIndex === index ? { ...question, ...patch } : question)),
    )
  }

  const addBulkQuestion = () => {
    const next = createEmptyQuestionDraft()
    setBulkQuestionsDraft((prev) => [...prev, next])
    setExpandedBulkIds((prev) => new Set(prev).add(next.clientId))
  }

  const removeBulkQuestion = (index) => {
    setBulkQuestionsDraft((prev) => {
      const next = prev.filter((_, questionIndex) => questionIndex !== index)
      return next.length > 0 ? next : [createEmptyQuestionDraft()]
    })
  }

  const updateBulkOption = (questionIndex, optionIndex, patch) => {
    setBulkQuestionsDraft((prev) =>
      prev.map((question, currentQuestionIndex) =>
        currentQuestionIndex === questionIndex
          ? {
            ...question,
            options: question.options.map((option, currentOptionIndex) =>
              currentOptionIndex === optionIndex ? { ...option, ...patch } : option,
            ),
          }
          : question,
      ),
    )
  }

  const addBulkOption = (questionIndex) => {
    setBulkQuestionsDraft((prev) =>
      prev.map((question, currentQuestionIndex) =>
        currentQuestionIndex === questionIndex
          ? {
            ...question,
            options: [...question.options, { text: '', correct: false, orderIndex: question.options.length }],
          }
          : question,
      ),
    )
  }

  const removeBulkOption = (questionIndex, optionIndex) => {
    setBulkQuestionsDraft((prev) =>
      prev.map((question, currentQuestionIndex) =>
        currentQuestionIndex === questionIndex
          ? {
            ...question,
            options: question.options.filter((_, currentOptionIndex) => currentOptionIndex !== optionIndex),
          }
          : question,
      ),
    )
  }

  const setSingleCorrectBulkOption = (questionIndex, optionIndex) => {
    setBulkQuestionsDraft((prev) =>
      prev.map((question, currentQuestionIndex) =>
        currentQuestionIndex === questionIndex
          ? {
            ...question,
            options: question.options.map((option, currentOptionIndex) => ({
              ...option,
              correct: currentOptionIndex === optionIndex,
            })),
          }
          : question,
      ),
    )
  }

  const toggleBulkQuestionExpanded = (questionId) => {
    setExpandedBulkIds((prev) => {
      const next = new Set(prev)
      if (next.has(questionId)) next.delete(questionId)
      else next.add(questionId)
      return next
    })
  }

  return (
    <section className="admin-page tests-page">
      <header className="tests-page-header">
        <div>
          <h1>Управление тестами</h1>
          <p>Создание и управление тестами платформы</p>
        </div>
      </header>

      {activeView === 'overview' ? (
        <div className="tests-overview-grid">
          <article className="tests-system-card tests-system-card--placement">
            <div className="tests-system-card-head">
              <div>
                <h2>Тест определения уровня</h2>
                <p>Определяет уровень пользователя перед началом обучения</p>
              </div>
              <button
                type="button"
                className="tests-create-btn"
                onClick={() => (placementMeta.isCreated ? setActiveView('placement') : setIsCreateTestOpen(true))}
              >
                {placementMeta.isCreated ? 'Открыть тест' : 'Создать тест'}
              </button>
            </div>
            <div className="tests-system-stats">
              <span className={`tests-status-badge ${placementMeta.isCreated ? 'is-ready' : 'is-empty'}`}>
                {placementMeta.isCreated ? 'Создан' : 'Не создан'}
              </span>
              <p>Количество вопросов: {stats.total}</p>
              <p>Последнее обновление: {formatDate(placementMeta.lastUpdated)}</p>
            </div>
          </article>

          <article className="tests-system-card tests-system-card--courses">
            <div className="tests-system-card-head">
              <div>
                <h2>Тесты курсов</h2>
                <p>Тут будут отображаться тесты уроков и курсов</p>
              </div>
              <button type="button" className="tests-create-btn tests-create-btn--disabled" disabled>
                Создать тест курса
              </button>
            </div>
            <div className="tests-system-stats">
              <p>Пока нет тестов курсов</p>
              <p>Тесты будут появляться после создания курсов и уроков</p>
            </div>
          </article>
        </div>
      ) : null}

      {activeView === 'placement' ? (
        <>
          <div className="tests-placement-head">
            <button type="button" className="tests-inline-btn" onClick={() => setActiveView('overview')}>
              ← Назад к тестам
            </button>
          </div>

          <div className="tests-actions-top">
            <button type="button" className="tests-create-btn" onClick={() => setIsCreateTestOpen(true)}>
              <AdminIcon name="plus" className="admin-icon" />
              Создать тест
            </button>
            <button type="button" className="tests-create-btn tests-create-btn--secondary" onClick={() => setIsAddQuestionOpen(true)}>
              Добавить вопрос
            </button>
            <button
              type="button"
              className="tests-create-btn tests-create-btn--light"
              onClick={() => {
                setBulkMode('visual')
                setBulkQuestionsDraft([createEmptyQuestionDraft()])
                setExpandedBulkIds(new Set())
                setIsBulkOpen(true)
              }}
            >
              Bulk-добавление
            </button>
          </div>

          <div className="tests-summary-grid">
            <article className="tests-summary-card">
              <p>Всего вопросов</p>
              <strong>{stats.total}</strong>
            </article>
            {Object.entries(stats.byLevel).map(([level, count]) => (
              <article key={level} className="tests-summary-card">
                <p>{level}</p>
                <strong>{count}</strong>
              </article>
            ))}
          </div>

          <section className="tests-table-card">
            {isLoading ? <div className="tests-feedback">Загрузка вопросов...</div> : null}
            {!isLoading && error ? <div className="tests-feedback tests-feedback--error">{error}</div> : null}
            {info ? <div className="tests-feedback">{info}</div> : null}
            {!isLoading && !error ? (
              questions.length > 0 ? (
                <table className="tests-table">
                  <thead>
                    <tr>
                      <th>Вопрос</th>
                      <th>Тип</th>
                      <th>Уровень</th>
                      <th>Блок</th>
                      <th>Порядок</th>
                      <th>Опций</th>
                      <th>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {questions.map((question) => (
                      <tr key={question.id || `${question.questionText}-${question.orderIndex}`}>
                        <td className="test-name-cell">{question.questionText || '-'}</td>
                        <td>{question.type || '-'}</td>
                        <td>{question.level || '-'}</td>
                        <td>{question.block || '-'}</td>
                        <td>{question.orderIndex ?? '-'}</td>
                        <td>{Array.isArray(question.options) ? question.options.length : 0}</td>
                        <td>
                          <div className="test-actions">
                            <button type="button" aria-label="Просмотреть вопрос" onClick={() => setSelectedQuestion(question)}>
                              <AdminIcon name="eye" className="admin-icon" />
                            </button>
                            <button type="button" aria-label="Удалить вопрос" className="is-danger" onClick={() => onDeleteQuestion(question)}>
                              <AdminIcon name="trash" className="admin-icon" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="tests-feedback">В активном тесте пока нет вопросов</div>
              )
            ) : null}
          </section>
        </>
      ) : null}

      {selectedQuestion ? (
        <div className="tests-modal-overlay" role="dialog" aria-modal="true" aria-label="Детали вопроса">
          <div className="tests-modal">
            <header className="tests-modal-header">
              <h2>Детали вопроса</h2>
              <button type="button" className="tests-modal-close" onClick={() => setSelectedQuestion(null)}>x</button>
            </header>
            <div className="tests-modal-body">
              <div className="tests-detail-grid">
                <article className="tests-detail-card">
                  <h3>Основная информация</h3>
                  <p><strong>ID:</strong> {selectedQuestion.id || '-'}</p>
                  <p><strong>Текст:</strong> {selectedQuestion.questionText || '-'}</p>
                  <p><strong>Тип:</strong> {getQuestionTypeLabel(selectedQuestion)}</p>
                  <p><strong>Уровень:</strong> {selectedQuestion.level || '-'}</p>
                  <p><strong>Категория:</strong> {getBlockLabel(selectedQuestion.block)}</p>
                  <p>
                    <strong>Аудио:</strong>{' '}
                    {selectedQuestion.audioUrl ? (
                      <a href={selectedQuestion.audioUrl} target="_blank" rel="noreferrer">
                        открыть ссылку
                      </a>
                    ) : 'нет'}
                  </p>
                </article>

                <article className="tests-detail-card">
                  <h3>Варианты ответа</h3>
                  {Array.isArray(selectedQuestion.options) && selectedQuestion.options.length > 0 ? (
                    <ul className="tests-detail-options">
                      {[...selectedQuestion.options]
                        .sort((a, b) => toNumber(a?.orderIndex, 0) - toNumber(b?.orderIndex, 0))
                        .map((option, index) => (
                          <li key={option.id || `${option.text}-${index}`} className="tests-detail-option-item">
                            <div>
                              <span className={`tests-detail-option-badge ${option.correct ? 'is-correct' : 'is-neutral'}`}>
                                {option.correct ? 'Верный' : 'Вариант'}
                              </span>
                              <p>{option.text || 'Без текста'}</p>
                            </div>
                            <small>Порядок: {option.orderIndex ?? index}</small>
                          </li>
                        ))}
                    </ul>
                  ) : (
                    <div className="tests-feedback">Варианты ответа не найдены</div>
                  )}
                </article>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {isCreateTestOpen ? (
        <div className="tests-modal-overlay" role="dialog" aria-modal="true" aria-label="Создание теста">
          <form className="tests-modal" onSubmit={onCreateTestSubmit}>
            <header className="tests-modal-header">
              <h2>Создать стартовый тест</h2>
              <button type="button" className="tests-modal-close" onClick={() => setIsCreateTestOpen(false)}>x</button>
            </header>

            <div className="tests-modal-body tests-form-grid">
              {error ? <div className="tests-feedback tests-feedback--error tests-form-full">{error}</div> : null}
              {info ? <div className="tests-feedback tests-form-full">{info}</div> : null}

              <div className="tests-form-full tests-builder-head">
                <h3 className="tests-builder-title">Информация о тесте</h3>
              </div>

              <label>
                Название
                <input required placeholder="Введите название теста" value={createForm.title} onChange={(event) => setCreateForm((prev) => ({ ...prev, title: event.target.value }))} />
              </label>
              <label>
                Описание
                <input placeholder="Кратко опишите тест" value={createForm.description} onChange={(event) => setCreateForm((prev) => ({ ...prev, description: event.target.value }))} />
              </label>
              <label>
                A1 min score
                <small>Минимальный порог для уровня A1</small>
                <input type="number" value={createForm.a1MinScore} onChange={(event) => setCreateForm((prev) => ({ ...prev, a1MinScore: event.target.value }))} />
              </label>
              <label>
                A2 min score
                <small>Минимальный порог для уровня A2</small>
                <input type="number" value={createForm.a2MinScore} onChange={(event) => setCreateForm((prev) => ({ ...prev, a2MinScore: event.target.value }))} />
              </label>
              <label>
                B1 min score
                <small>Минимальный порог для уровня B1</small>
                <input type="number" value={createForm.b1MinScore} onChange={(event) => setCreateForm((prev) => ({ ...prev, b1MinScore: event.target.value }))} />
              </label>
              <label>
                B2 min score
                <small>Минимальный порог для уровня B2</small>
                <input type="number" value={createForm.b2MinScore} onChange={(event) => setCreateForm((prev) => ({ ...prev, b2MinScore: event.target.value }))} />
              </label>

              <div className="tests-form-full tests-builder-block">
                <div className="tests-options-header">
                  <h3>Вопросы теста</h3>
                  <button type="button" className="tests-inline-btn" onClick={addCreateQuestion}>Добавить вопрос</button>
                </div>
                <div className="tests-mini-stats">
                  <span>Вопросов: {draftStats.total}</span>
                  {LEVEL_OPTIONS.map((level) => <span key={level}>{level}: {draftStats.byLevel[level] || 0}</span>)}
                </div>

                <div className="tests-builder-list">
                  {createQuestionsDraft.map((draftQuestion, questionIndex) => (
                    <article key={draftQuestion.clientId} className="tests-builder-card">
                      <div className="tests-options-header">
                        <button type="button" className="tests-collapse-trigger" onClick={() => toggleQuestionExpanded(draftQuestion.clientId)}>
                          {expandedQuestionIds.has(draftQuestion.clientId) ? '▼' : '▶'} Вопрос #{questionIndex + 1}
                        </button>
                        <button type="button" className="tests-delete-icon-btn" onClick={() => removeCreateQuestion(questionIndex)} disabled={createQuestionsDraft.length === 1} aria-label="Удалить вопрос">
                          <AdminIcon name="trash" className="admin-icon" />
                        </button>
                      </div>

                      {expandedQuestionIds.has(draftQuestion.clientId) ? (
                        <>
                          <div className="tests-form-grid tests-question-grid">
                            <label>
                              Текст вопроса
                              <input placeholder="Введите текст вопроса" value={draftQuestion.questionText} onChange={(event) => updateCreateQuestion(questionIndex, { questionText: event.target.value })} />
                            </label>
                            <label>
                              Ссылка на аудио (необязательно)
                              <input placeholder="https://..." value={draftQuestion.audioUrl} onChange={(event) => updateCreateQuestion(questionIndex, { audioUrl: event.target.value })} />
                            </label>
                            <label>
                              Тип вопроса
                              <select value={draftQuestion.type} onChange={(event) => updateCreateQuestion(questionIndex, { type: event.target.value })}>
                                {TYPE_OPTIONS.map((type) => (
                                  <option key={type.value} value={type.value}>{type.label}</option>
                                ))}
                              </select>
                            </label>
                            <label>
                              Уровень
                              <select value={draftQuestion.level} onChange={(event) => updateCreateQuestion(questionIndex, { level: event.target.value })}>
                                {LEVEL_OPTIONS.map((level) => (
                                  <option key={level} value={level}>{level}</option>
                                ))}
                              </select>
                            </label>
                            <label>
                              Категория
                              <select value={draftQuestion.block} onChange={(event) => updateCreateQuestion(questionIndex, { block: event.target.value })}>
                                {CATEGORY_OPTIONS.map((category) => (
                                  <option key={category.value} value={category.value}>{category.label}</option>
                                ))}
                              </select>
                            </label>
                          </div>

                          <div className="tests-form-full">
                            <div className="tests-options-header">
                              <h3>Варианты ответа</h3>
                              <button type="button" className="tests-inline-btn" onClick={() => addCreateOption(questionIndex)}>
                                Добавить вариант
                              </button>
                            </div>
                            <div className="tests-options-grid">
                              {draftQuestion.options.map((option, optionIndex) => (
                                <div className="tests-option-card" key={`${draftQuestion.clientId}-${optionIndex}`}>
                                  <div className="tests-option-marker">
                                    {isSingleChoiceType(draftQuestion.type) ? (
                                      <input type="radio" name={`correct-${draftQuestion.clientId}`} checked={Boolean(option.correct)} onChange={() => setSingleCorrectOption(questionIndex, optionIndex)} />
                                    ) : (
                                      <input type="checkbox" checked={Boolean(option.correct)} onChange={(event) => updateCreateOption(questionIndex, optionIndex, { correct: event.target.checked })} />
                                    )}
                                  </div>
                                  <input placeholder={`Вариант ${optionIndex + 1}`} value={option.text} onChange={(event) => updateCreateOption(questionIndex, optionIndex, { text: event.target.value })} />
                                  <button type="button" className="tests-delete-icon-btn" onClick={() => removeCreateOption(questionIndex, optionIndex)} disabled={draftQuestion.options.length <= 2} aria-label="Удалить вариант">
                                    <AdminIcon name="trash" className="admin-icon" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      ) : null}
                    </article>
                  ))}
                </div>
              </div>

              <div className="tests-form-full tests-sticky-actions">
                <button type="submit" className="tests-create-btn" disabled={isSubmitting}>
                  {isSubmitting ? 'Создание...' : 'Создать тест'}
                </button>
              </div>
            </div>
          </form>
        </div>
      ) : null}

      {isAddQuestionOpen ? (
        <div className="tests-modal-overlay" role="dialog" aria-modal="true" aria-label="Добавление вопроса">
          <form className="tests-modal" onSubmit={onAddQuestionSubmit}>
            <header className="tests-modal-header">
              <h2>Добавить вопрос</h2>
              <button type="button" className="tests-modal-close" onClick={() => setIsAddQuestionOpen(false)}>x</button>
            </header>
            <div className="tests-modal-body tests-form-grid">
              <label>
                Текст вопроса
                <input required value={questionDraft.questionText} onChange={(event) => setQuestionDraft((prev) => ({ ...prev, questionText: event.target.value }))} />
              </label>
              <label>
                Audio URL
                <input value={questionDraft.audioUrl} onChange={(event) => setQuestionDraft((prev) => ({ ...prev, audioUrl: event.target.value }))} />
              </label>
              <label>
                Тип
                <select value={questionDraft.type} onChange={(event) => setQuestionDraft((prev) => ({ ...prev, type: event.target.value }))}>
                  {TYPE_OPTIONS.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </label>
              <label>
                Уровень
                <select value={questionDraft.level} onChange={(event) => setQuestionDraft((prev) => ({ ...prev, level: event.target.value }))}>
                  {LEVEL_OPTIONS.map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </label>
              <label>
                Блок
                <select value={questionDraft.block} onChange={(event) => setQuestionDraft((prev) => ({ ...prev, block: event.target.value }))}>
                  {CATEGORY_OPTIONS.map((category) => (
                    <option key={category.value} value={category.value}>{category.label}</option>
                  ))}
                </select>
              </label>
              <label>
                Порядок
                <input type="number" value={questionDraft.orderIndex} onChange={(event) => setQuestionDraft((prev) => ({ ...prev, orderIndex: event.target.value }))} />
              </label>
              <div className="tests-form-full">
                <div className="tests-options-header">
                  <h3>Опции ответа</h3>
                  <button type="button" className="tests-inline-btn" onClick={addOption}>Добавить опцию</button>
                </div>
                <div className="tests-options-grid">
                  {questionDraft.options.map((option, index) => (
                    <div className="tests-option-row" key={`${index}-${option.orderIndex}`}>
                      <input placeholder="Текст опции" value={option.text} onChange={(event) => updateOption(index, { text: event.target.value })} />
                      <label className="tests-check-row">
                        <input type="checkbox" checked={Boolean(option.correct)} onChange={(event) => updateOption(index, { correct: event.target.checked })} />
                        Верный
                      </label>
                      <input type="number" value={option.orderIndex} onChange={(event) => updateOption(index, { orderIndex: event.target.value })} />
                      <button type="button" className="tests-inline-btn tests-inline-btn--danger" onClick={() => removeOption(index)}>Удалить</button>
                    </div>
                  ))}
                </div>
              </div>
              <button type="submit" className="tests-create-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Сохранение...' : 'Добавить вопрос'}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {isBulkOpen ? (
        <div className="tests-modal-overlay" role="dialog" aria-modal="true" aria-label="Bulk-добавление вопросов">
          <form className="tests-modal" onSubmit={onBulkSubmit}>
            <header className="tests-modal-header">
              <h2>Массовое добавление вопросов</h2>
              <button type="button" className="tests-modal-close" onClick={() => setIsBulkOpen(false)}>x</button>
            </header>
            <div className="tests-modal-body tests-form-grid">
              {error ? <div className="tests-feedback tests-feedback--error tests-form-full">{error}</div> : null}
              {info ? <div className="tests-feedback tests-form-full">{info}</div> : null}

              <div className="tests-form-full tests-mode-switch">
                <button
                  type="button"
                  className={`tests-mode-btn ${bulkMode === 'visual' ? 'is-active' : ''}`}
                  onClick={() => setBulkMode('visual')}
                >
                  Визуальный режим
                </button>
                <button
                  type="button"
                  className={`tests-mode-btn ${bulkMode === 'json' ? 'is-active' : ''}`}
                  onClick={() => setBulkMode('json')}
                >
                  JSON режим
                </button>
              </div>

              {bulkMode === 'visual' ? (
                <div className="tests-form-full tests-builder-block">
                  <div className="tests-options-header">
                    <h3>Вопросы для добавления</h3>
                    <button type="button" className="tests-inline-btn" onClick={addBulkQuestion}>Добавить вопрос</button>
                  </div>
                  <div className="tests-mini-stats">
                    <span>Вопросов: {bulkStats.total}</span>
                    {LEVEL_OPTIONS.map((level) => <span key={level}>{level}: {bulkStats.byLevel[level] || 0}</span>)}
                  </div>

                  <div className="tests-builder-list">
                    {bulkQuestionsDraft.map((draftQuestion, questionIndex) => (
                      <article key={draftQuestion.clientId} className="tests-builder-card">
                        <div className="tests-options-header">
                          <button type="button" className="tests-collapse-trigger" onClick={() => toggleBulkQuestionExpanded(draftQuestion.clientId)}>
                            {expandedBulkIds.has(draftQuestion.clientId) ? '▼' : '▶'} Вопрос #{questionIndex + 1}
                          </button>
                          <button type="button" className="tests-delete-icon-btn" onClick={() => removeBulkQuestion(questionIndex)} disabled={bulkQuestionsDraft.length === 1} aria-label="Удалить вопрос">
                            <AdminIcon name="trash" className="admin-icon" />
                          </button>
                        </div>

                        {expandedBulkIds.has(draftQuestion.clientId) ? (
                          <>
                            <div className="tests-form-grid tests-question-grid">
                              <label>
                                Текст вопроса
                                <input placeholder="Введите текст вопроса" value={draftQuestion.questionText} onChange={(event) => updateBulkQuestion(questionIndex, { questionText: event.target.value })} />
                              </label>
                              <label>
                                Ссылка на аудио (необязательно)
                                <input placeholder="https://..." value={draftQuestion.audioUrl} onChange={(event) => updateBulkQuestion(questionIndex, { audioUrl: event.target.value })} />
                              </label>
                              <label>
                                Тип вопроса
                                <select value={draftQuestion.type} onChange={(event) => updateBulkQuestion(questionIndex, { type: event.target.value })}>
                                  {TYPE_OPTIONS.map((type) => (
                                    <option key={type.value} value={type.value}>{type.label}</option>
                                  ))}
                                </select>
                              </label>
                              <label>
                                Уровень
                                <select value={draftQuestion.level} onChange={(event) => updateBulkQuestion(questionIndex, { level: event.target.value })}>
                                  {LEVEL_OPTIONS.map((level) => (
                                    <option key={level} value={level}>{level}</option>
                                  ))}
                                </select>
                              </label>
                              <label>
                                Категория
                                <select value={draftQuestion.block} onChange={(event) => updateBulkQuestion(questionIndex, { block: event.target.value })}>
                                  {CATEGORY_OPTIONS.map((category) => (
                                    <option key={category.value} value={category.value}>{category.label}</option>
                                  ))}
                                </select>
                              </label>
                            </div>

                            <div className="tests-form-full">
                              <div className="tests-options-header">
                                <h3>Варианты ответа</h3>
                                <button type="button" className="tests-inline-btn" onClick={() => addBulkOption(questionIndex)}>
                                  Добавить вариант
                                </button>
                              </div>
                              <div className="tests-options-grid">
                                {draftQuestion.options.map((option, optionIndex) => (
                                  <div className="tests-option-card" key={`${draftQuestion.clientId}-${optionIndex}`}>
                                    <div className="tests-option-marker">
                                      {isSingleChoiceType(draftQuestion.type) ? (
                                        <input type="radio" name={`bulk-correct-${draftQuestion.clientId}`} checked={Boolean(option.correct)} onChange={() => setSingleCorrectBulkOption(questionIndex, optionIndex)} />
                                      ) : (
                                        <input type="checkbox" checked={Boolean(option.correct)} onChange={(event) => updateBulkOption(questionIndex, optionIndex, { correct: event.target.checked })} />
                                      )}
                                    </div>
                                    <input placeholder={`Вариант ${optionIndex + 1}`} value={option.text} onChange={(event) => updateBulkOption(questionIndex, optionIndex, { text: event.target.value })} />
                                    <button type="button" className="tests-delete-icon-btn" onClick={() => removeBulkOption(questionIndex, optionIndex)} disabled={draftQuestion.options.length <= 2} aria-label="Удалить вариант">
                                      <AdminIcon name="trash" className="admin-icon" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </>
                        ) : null}
                      </article>
                    ))}
                  </div>
                </div>
              ) : (
                <label className="tests-form-full">
                  JSON массив вопросов
                  <textarea rows={16} value={bulkDraft} onChange={(event) => setBulkDraft(event.target.value)} />
                </label>
              )}

              <div className="tests-form-full tests-sticky-actions">
                <button type="submit" className="tests-create-btn" disabled={isSubmitting}>
                  {isSubmitting ? 'Отправка...' : 'Добавить вопросы'}
                </button>
              </div>
            </div>
          </form>
        </div>
      ) : null}
    </section>
  )
}

export default TestsPage
