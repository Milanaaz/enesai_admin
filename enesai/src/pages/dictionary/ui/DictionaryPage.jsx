import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../../features/auth/context/AuthProvider.jsx'
import AdminIcon from '../../admin/ui/components/AdminIcon.jsx'
import {
  createAdminWord,
  deleteAdminWord,
  fetchPlatformWords,
  updateAdminWord,
} from '../api/dictionaryApi.js'
import './dictionary-page.css'

const ALL_LEVELS = 'Все уровни'
const levelOptions = ['A1', 'A2', 'B1', 'B2']

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

function toWordPayload(form) {
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

function DictionaryPage() {
  const { token } = useAuth()
  const [words, setWords] = useState([])
  const [totalWords, setTotalWords] = useState(0)
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState(ALL_LEVELS)
  const [topicFilter, setTopicFilter] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState('')
  const [modal, setModal] = useState(null)
  const [wordForm, setWordForm] = useState(emptyWordForm)

  const loadWords = useCallback(async () => {
    setBusy('load')
    setError('')
    try {
      const page = await fetchPlatformWords({
        token,
        search,
        level: levelFilter === ALL_LEVELS ? '' : levelFilter,
        topic: topicFilter.trim(),
      })
      setWords(page.content)
      setTotalWords(page.totalElements || page.content.length)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить слова')
      setWords([])
      setTotalWords(0)
    } finally {
      setBusy('')
    }
  }, [levelFilter, search, token, topicFilter])

  useEffect(() => {
    loadWords()
  }, [loadWords])

  const topics = useMemo(() => {
    return Array.from(new Set(words.map((word) => word.topic).filter(Boolean))).sort()
  }, [words])

  const summary = useMemo(() => ({
    total: totalWords,
    withAudio: words.filter((word) => word.audioUrl).length,
    topics: topics.length,
    withoutAudio: words.filter((word) => !word.audioUrl).length,
  }), [totalWords, topics.length, words])

  const openCreateModal = () => {
    setWordForm(emptyWordForm())
    setModal({ mode: 'create' })
  }

  const openEditModal = (word) => {
    setWordForm({
      word: word.word || '',
      translation: word.translation || '',
      transcription: word.transcription || '',
      exampleKg: word.exampleKg || '',
      exampleRu: word.exampleRu || '',
      audioUrl: word.audioUrl || '',
      level: word.level || 'A1',
      topic: word.topic || '',
      synonyms: word.synonyms || '',
    })
    setModal({ mode: 'edit', wordId: word.id })
  }

  const saveWord = async (event) => {
    event.preventDefault()
    setBusy('save')
    setError('')
    setInfo('')
    try {
      if (modal.mode === 'edit') {
        await updateAdminWord({ token, wordId: modal.wordId, payload: toWordPayload(wordForm) })
        setInfo('Слово обновлено')
      } else {
        await createAdminWord({ token, payload: toWordPayload(wordForm) })
        setInfo('Слово создано')
      }
      setModal(null)
      await loadWords()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить слово')
    } finally {
      setBusy('')
    }
  }

  const removeWord = async (word) => {
    if (!window.confirm(`Удалить слово "${word.word}"?`)) return
    setBusy(`delete:${word.id}`)
    setError('')
    setInfo('')
    try {
      await deleteAdminWord({ token, wordId: word.id })
      setInfo('Слово удалено')
      await loadWords()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось удалить слово')
    } finally {
      setBusy('')
    }
  }

  return (
    <section className="admin-page dictionary-page">
      <header className="dictionary-page-header">
        <div>
          <h1>Управление словарем</h1>
          <p>Глобальный словарь платформы: создание, редактирование и удаление слов</p>
        </div>

        <button type="button" className="dictionary-create-btn" onClick={openCreateModal}>
          <AdminIcon name="plus" className="admin-icon" />
          Добавить слово
        </button>
      </header>

      <div className="dictionary-summary-grid">
        <article className="dictionary-summary-card">
          <p>Всего слов</p>
          <strong>{summary.total}</strong>
        </article>
        <article className="dictionary-summary-card">
          <p>С аудио</p>
          <strong className="is-violet">{summary.withAudio}</strong>
        </article>
        <article className="dictionary-summary-card">
          <p>Тем</p>
          <strong className="is-green">{summary.topics}</strong>
        </article>
        <article className="dictionary-summary-card">
          <p>Без аудио</p>
          <strong className="is-muted">{summary.withoutAudio}</strong>
        </article>
      </div>

      <section className="dictionary-filters" aria-label="Фильтрация словаря">
        <label className="dictionary-search">
          <AdminIcon name="search" className="admin-icon" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Поиск слов..."
            aria-label="Поиск слов"
          />
        </label>

        <select value={levelFilter} onChange={(event) => setLevelFilter(event.target.value)} aria-label="Уровень">
          <option>{ALL_LEVELS}</option>
          {levelOptions.map((level) => <option key={level}>{level}</option>)}
        </select>

        <input
          className="dictionary-topic-input"
          value={topicFilter}
          onChange={(event) => setTopicFilter(event.target.value)}
          placeholder="Тема"
          list="dictionary-topics"
        />
        <datalist id="dictionary-topics">
          {topics.map((topic) => <option key={topic} value={topic} />)}
        </datalist>
      </section>

      {error ? <div className="dictionary-feedback dictionary-feedback--error">{error}</div> : null}
      {info ? <div className="dictionary-feedback">{info}</div> : null}

      <section className="dictionary-table-card">
        {busy === 'load' ? <div className="dictionary-empty">Загрузка слов...</div> : null}
        {busy !== 'load' && words.length === 0 ? <div className="dictionary-empty">Слова не найдены</div> : null}
        {words.length > 0 ? (
          <table className="dictionary-table">
            <thead>
              <tr>
                <th>Кыргызский</th>
                <th>Русский</th>
                <th>Уровень</th>
                <th>Тема</th>
                <th>Пример</th>
                <th>Аудио</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {words.map((word) => (
                <tr key={word.id}>
                  <td className="dictionary-kyrgyz-cell">{word.word}</td>
                  <td className="dictionary-russian-cell">{word.translation}</td>
                  <td><span className="dictionary-category-badge">{word.level}</span></td>
                  <td>{word.topic || '-'}</td>
                  <td className="dictionary-example-cell">{word.exampleKg || word.exampleRu || '-'}</td>
                  <td>
                    {word.audioUrl ? (
                      <a className="dictionary-audio-btn" href={word.audioUrl} target="_blank" rel="noreferrer" aria-label={`Прослушать ${word.word}`}>
                        <AdminIcon name="volume" className="admin-icon" />
                      </a>
                    ) : (
                      <span className="dictionary-no-audio">Нет</span>
                    )}
                  </td>
                  <td>
                    <div className="dictionary-actions">
                      <button type="button" onClick={() => openEditModal(word)} aria-label={`Редактировать слово ${word.word}`}>
                        <AdminIcon name="edit" className="admin-icon" />
                      </button>
                      <button type="button" onClick={() => removeWord(word)} aria-label={`Удалить слово ${word.word}`} className="is-danger" disabled={busy === `delete:${word.id}`}>
                        <AdminIcon name="trash" className="admin-icon" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </section>

      {modal ? (
        <div className="dictionary-modal-overlay" role="dialog" aria-modal="true">
          <form className="dictionary-modal" onSubmit={saveWord}>
            <header className="dictionary-modal-header">
              <h2>{modal.mode === 'edit' ? 'Редактировать слово' : 'Добавить слово'}</h2>
              <button type="button" onClick={() => setModal(null)} aria-label="Закрыть">x</button>
            </header>
            <div className="dictionary-form-grid">
              <label>Слово<input required value={wordForm.word} onChange={(event) => setWordForm((current) => ({ ...current, word: event.target.value }))} /></label>
              <label>Перевод<input required value={wordForm.translation} onChange={(event) => setWordForm((current) => ({ ...current, translation: event.target.value }))} /></label>
              <label>Уровень<select value={wordForm.level} onChange={(event) => setWordForm((current) => ({ ...current, level: event.target.value }))}>{levelOptions.map((level) => <option key={level}>{level}</option>)}</select></label>
              <label>Тема<input value={wordForm.topic} onChange={(event) => setWordForm((current) => ({ ...current, topic: event.target.value }))} /></label>
              <label>Транскрипция<input value={wordForm.transcription} onChange={(event) => setWordForm((current) => ({ ...current, transcription: event.target.value }))} /></label>
              <label>Audio URL<input value={wordForm.audioUrl} onChange={(event) => setWordForm((current) => ({ ...current, audioUrl: event.target.value }))} /></label>
              <label className="dictionary-form-full">Пример KG<input value={wordForm.exampleKg} onChange={(event) => setWordForm((current) => ({ ...current, exampleKg: event.target.value }))} /></label>
              <label className="dictionary-form-full">Пример RU<input value={wordForm.exampleRu} onChange={(event) => setWordForm((current) => ({ ...current, exampleRu: event.target.value }))} /></label>
              <label className="dictionary-form-full">Синонимы<input value={wordForm.synonyms} onChange={(event) => setWordForm((current) => ({ ...current, synonyms: event.target.value }))} /></label>
            </div>
            <footer className="dictionary-modal-footer">
              <button type="submit" className="dictionary-create-btn" disabled={busy === 'save'}>Сохранить</button>
            </footer>
          </form>
        </div>
      ) : null}
    </section>
  )
}

export default DictionaryPage
