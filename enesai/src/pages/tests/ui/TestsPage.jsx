import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../../features/auth/context/AuthProvider.jsx'
import AdminIcon from '../../admin/ui/components/AdminIcon.jsx'
import {
  addPlacementQuestion,
  addPlacementQuestionsBulk,
  createPlacementTest,
  deletePlacementQuestion,
  fetchPlacementQuestions,
} from '../api/testsApi.js'
import './tests-page.css'

const TYPE_OPTIONS = ['FLASHCARD', 'MULTIPLE_CHOICE', 'LISTENING', 'READING']
const LEVEL_OPTIONS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

function createEmptyQuestionDraft() {
  return {
    questionText: '',
    audioUrl: '',
    type: 'FLASHCARD',
    level: 'A1',
    block: '',
    orderIndex: 0,
    correctAnswer: '',
    options: [
      { text: '', correct: true, orderIndex: 0 },
      { text: '', correct: false, orderIndex: 1 },
    ],
  }
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function TestsPage() {
  const { token } = useAuth()

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
    questionsJson: '[]',
  })

  const [questionDraft, setQuestionDraft] = useState(createEmptyQuestionDraft)
  const [bulkDraft, setBulkDraft] = useState('[\n  {\n    "questionText": "",\n    "audioUrl": "",\n    "type": "FLASHCARD",\n    "level": "A1",\n    "block": "",\n    "orderIndex": 0,\n    "correctAnswer": "",\n    "options": [\n      { "text": "", "correct": true, "orderIndex": 0 },\n      { "text": "", "correct": false, "orderIndex": 1 }\n    ]\n  }\n]')

  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const onCreateTestSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setInfo('')
    setError('')

    try {
      let parsedQuestions = []
      if (createForm.questionsJson.trim()) {
        parsedQuestions = JSON.parse(createForm.questionsJson)
        if (!Array.isArray(parsedQuestions)) {
          throw new Error('Поле "Вопросы JSON" должно быть массивом')
        }
      }

      await createPlacementTest({
        token,
        payload: {
          title: createForm.title.trim(),
          description: createForm.description.trim(),
          a1MinScore: toNumber(createForm.a1MinScore),
          a2MinScore: toNumber(createForm.a2MinScore),
          b1MinScore: toNumber(createForm.b1MinScore),
          b2MinScore: toNumber(createForm.b2MinScore),
          questions: parsedQuestions,
        },
      })

      setInfo('Стартовый тест создан')
      setIsCreateTestOpen(false)
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
      await addPlacementQuestion({
        token,
        payload: {
          ...questionDraft,
          questionText: questionDraft.questionText.trim(),
          audioUrl: questionDraft.audioUrl.trim(),
          block: questionDraft.block.trim(),
          correctAnswer: questionDraft.correctAnswer.trim(),
          orderIndex: toNumber(questionDraft.orderIndex),
          options: questionDraft.options.map((option, index) => ({
            text: option.text.trim(),
            correct: Boolean(option.correct),
            orderIndex: toNumber(option.orderIndex, index),
          })),
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
      const payload = JSON.parse(bulkDraft)
      if (!Array.isArray(payload)) {
        throw new Error('Bulk JSON должен быть массивом вопросов')
      }

      await addPlacementQuestionsBulk({ token, payload })
      setInfo(`Добавлено вопросов: ${payload.length}`)
      setIsBulkOpen(false)
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

  return (
    <section className="admin-page tests-page">
      <header className="tests-page-header">
        <div>
          <h1>Управление тестами</h1>
          <p>Placement Test: создание теста, просмотр и управление вопросами</p>
        </div>

        <div className="tests-actions-top">
          <button type="button" className="tests-create-btn" onClick={() => setIsCreateTestOpen(true)}>
            <AdminIcon name="plus" className="admin-icon" />
            Создать тест
          </button>
          <button type="button" className="tests-create-btn tests-create-btn--secondary" onClick={() => setIsAddQuestionOpen(true)}>
            Добавить вопрос
          </button>
          <button type="button" className="tests-create-btn tests-create-btn--light" onClick={() => setIsBulkOpen(true)}>
            Bulk-добавление
          </button>
        </div>
      </header>

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
                        <button
                          type="button"
                          aria-label="Удалить вопрос"
                          className="is-danger"
                          onClick={() => onDeleteQuestion(question)}
                        >
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

      {selectedQuestion ? (
        <div className="tests-modal-overlay" role="dialog" aria-modal="true" aria-label="Детали вопроса">
          <div className="tests-modal">
            <header className="tests-modal-header">
              <h2>Детали вопроса</h2>
              <button type="button" className="tests-modal-close" onClick={() => setSelectedQuestion(null)}>
                x
              </button>
            </header>

            <div className="tests-modal-body">
              <p><strong>ID:</strong> {selectedQuestion.id || '-'}</p>
              <p><strong>Текст:</strong> {selectedQuestion.questionText || '-'}</p>
              <p><strong>Тип:</strong> {selectedQuestion.type || '-'}</p>
              <p><strong>Уровень:</strong> {selectedQuestion.level || '-'}</p>
              <p><strong>Блок:</strong> {selectedQuestion.block || '-'}</p>
              <p><strong>Correct Answer:</strong> {selectedQuestion.correctAnswer || '-'}</p>
              <p><strong>Audio URL:</strong> {selectedQuestion.audioUrl || '-'}</p>

              <h3>Опции</h3>
              <pre className="tests-code-block">{JSON.stringify(selectedQuestion.options || [], null, 2)}</pre>
            </div>
          </div>
        </div>
      ) : null}

      {isCreateTestOpen ? (
        <div className="tests-modal-overlay" role="dialog" aria-modal="true" aria-label="Создание теста">
          <form className="tests-modal" onSubmit={onCreateTestSubmit}>
            <header className="tests-modal-header">
              <h2>Создать стартовый тест</h2>
              <button type="button" className="tests-modal-close" onClick={() => setIsCreateTestOpen(false)}>
                x
              </button>
            </header>

            <div className="tests-modal-body tests-form-grid">
              <label>
                Название
                <input required value={createForm.title} onChange={(event) => setCreateForm((prev) => ({ ...prev, title: event.target.value }))} />
              </label>
              <label>
                Описание
                <input value={createForm.description} onChange={(event) => setCreateForm((prev) => ({ ...prev, description: event.target.value }))} />
              </label>
              <label>
                A1 min score
                <input type="number" value={createForm.a1MinScore} onChange={(event) => setCreateForm((prev) => ({ ...prev, a1MinScore: event.target.value }))} />
              </label>
              <label>
                A2 min score
                <input type="number" value={createForm.a2MinScore} onChange={(event) => setCreateForm((prev) => ({ ...prev, a2MinScore: event.target.value }))} />
              </label>
              <label>
                B1 min score
                <input type="number" value={createForm.b1MinScore} onChange={(event) => setCreateForm((prev) => ({ ...prev, b1MinScore: event.target.value }))} />
              </label>
              <label>
                B2 min score
                <input type="number" value={createForm.b2MinScore} onChange={(event) => setCreateForm((prev) => ({ ...prev, b2MinScore: event.target.value }))} />
              </label>
              <label className="tests-form-full">
                Вопросы JSON (массив)
                <textarea rows={8} value={createForm.questionsJson} onChange={(event) => setCreateForm((prev) => ({ ...prev, questionsJson: event.target.value }))} />
              </label>

              <button type="submit" className="tests-create-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Создание...' : 'Создать тест'}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {isAddQuestionOpen ? (
        <div className="tests-modal-overlay" role="dialog" aria-modal="true" aria-label="Добавление вопроса">
          <form className="tests-modal" onSubmit={onAddQuestionSubmit}>
            <header className="tests-modal-header">
              <h2>Добавить вопрос</h2>
              <button type="button" className="tests-modal-close" onClick={() => setIsAddQuestionOpen(false)}>
                x
              </button>
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
                    <option key={type} value={type}>{type}</option>
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
                <input value={questionDraft.block} onChange={(event) => setQuestionDraft((prev) => ({ ...prev, block: event.target.value }))} />
              </label>
              <label>
                Порядок
                <input type="number" value={questionDraft.orderIndex} onChange={(event) => setQuestionDraft((prev) => ({ ...prev, orderIndex: event.target.value }))} />
              </label>
              <label className="tests-form-full">
                Correct Answer
                <input value={questionDraft.correctAnswer} onChange={(event) => setQuestionDraft((prev) => ({ ...prev, correctAnswer: event.target.value }))} />
              </label>

              <div className="tests-form-full">
                <div className="tests-options-header">
                  <h3>Опции ответа</h3>
                  <button type="button" className="tests-inline-btn" onClick={addOption}>Добавить опцию</button>
                </div>

                <div className="tests-options-grid">
                  {questionDraft.options.map((option, index) => (
                    <div className="tests-option-row" key={`${index}-${option.orderIndex}`}>
                      <input
                        placeholder="Текст опции"
                        value={option.text}
                        onChange={(event) => updateOption(index, { text: event.target.value })}
                      />
                      <label className="tests-check-row">
                        <input
                          type="checkbox"
                          checked={Boolean(option.correct)}
                          onChange={(event) => updateOption(index, { correct: event.target.checked })}
                        />
                        Верный
                      </label>
                      <input
                        type="number"
                        value={option.orderIndex}
                        onChange={(event) => updateOption(index, { orderIndex: event.target.value })}
                      />
                      <button type="button" className="tests-inline-btn tests-inline-btn--danger" onClick={() => removeOption(index)}>
                        Удалить
                      </button>
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
              <h2>Bulk-добавление вопросов</h2>
              <button type="button" className="tests-modal-close" onClick={() => setIsBulkOpen(false)}>
                x
              </button>
            </header>

            <div className="tests-modal-body tests-form-grid">
              <label className="tests-form-full">
                JSON массив вопросов
                <textarea rows={16} value={bulkDraft} onChange={(event) => setBulkDraft(event.target.value)} />
              </label>

              <button type="submit" className="tests-create-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Отправка...' : 'Добавить вопросы'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </section>
  )
}

export default TestsPage

