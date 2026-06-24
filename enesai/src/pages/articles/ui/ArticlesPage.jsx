import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../../features/auth/context/AuthProvider.jsx'
import AdminIcon from '../../admin/ui/components/AdminIcon.jsx'
import {
  createAdminBook,
  createAdminBookPage,
  deleteAdminBook,
  fetchBookById,
  fetchBookPage,
  fetchBooksCatalog,
  publishAdminBook,
} from '../api/libraryApi.js'
import './articles-page.css'

const ALL_LEVELS = 'Все уровни'
const levelOptions = ['A1', 'A2', 'B1', 'B2']

function emptyBookForm() {
  return {
    title: '',
    author: '',
    description: '',
    coverUrl: '',
    level: 'A1',
    genre: '',
    readingTimeMinutes: 0,
  }
}

function emptyPageForm(bookId = '', pageNumber = 1) {
  return {
    bookId,
    pageNumber,
    content: '',
    contentRu: '',
    audioUrl: '',
  }
}

function toBookPayload(form) {
  return {
    title: form.title.trim(),
    author: form.author.trim(),
    description: form.description.trim(),
    coverUrl: form.coverUrl.trim(),
    level: form.level,
    genre: form.genre.trim(),
    readingTimeMinutes: Number(form.readingTimeMinutes) || 0,
  }
}

function toPagePayload(form) {
  return {
    bookId: form.bookId,
    pageNumber: Number(form.pageNumber) || 1,
    content: form.content.trim(),
    contentRu: form.contentRu.trim(),
    audioUrl: form.audioUrl.trim(),
  }
}

function ArticlesPage() {
  const { token } = useAuth()
  const [books, setBooks] = useState([])
  const [totalBooks, setTotalBooks] = useState(0)
  const [selectedBookId, setSelectedBookId] = useState('')
  const [selectedBook, setSelectedBook] = useState(null)
  const [selectedPage, setSelectedPage] = useState(null)
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState(ALL_LEVELS)
  const [genreFilter, setGenreFilter] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState('')
  const [modal, setModal] = useState(null)
  const [bookForm, setBookForm] = useState(emptyBookForm)
  const [pageForm, setPageForm] = useState(emptyPageForm)

  const loadBooks = useCallback(async () => {
    setBusy('load')
    setError('')
    try {
      const page = await fetchBooksCatalog({
        token,
        search,
        level: levelFilter === ALL_LEVELS ? '' : levelFilter,
        genre: genreFilter.trim(),
      })
      setBooks(page.content)
      setTotalBooks(page.totalElements || page.content.length)
      setSelectedBookId((current) => current || page.content[0]?.id || '')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить книги')
      setBooks([])
      setTotalBooks(0)
    } finally {
      setBusy('')
    }
  }, [genreFilter, levelFilter, search, token])

  const loadSelectedBook = useCallback(async () => {
    if (!selectedBookId) {
      setSelectedBook(null)
      setSelectedPage(null)
      return
    }
    setError('')
    try {
      const book = await fetchBookById({ token, bookId: selectedBookId })
      setSelectedBook(book)
      setPageForm(emptyPageForm(selectedBookId, Number(book?.totalPages || 0) + 1))
      if (book?.totalPages > 0) {
        const firstPage = await fetchBookPage({ token, bookId: selectedBookId, pageNumber: 1 })
        setSelectedPage(firstPage)
      } else {
        setSelectedPage(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить книгу')
      setSelectedBook(null)
      setSelectedPage(null)
    }
  }, [selectedBookId, token])

  useEffect(() => {
    loadBooks()
  }, [loadBooks])

  useEffect(() => {
    loadSelectedBook()
  }, [loadSelectedBook])

  const genres = useMemo(() => Array.from(new Set(books.map((book) => book.genre).filter(Boolean))).sort(), [books])
  const summary = useMemo(() => ({
    total: totalBooks,
    withPages: books.filter((book) => Number(book.totalPages || 0) > 0).length,
    started: books.filter((book) => book.userStarted).length,
    finished: books.filter((book) => book.userFinished).length,
  }), [books, totalBooks])

  const openCreateBookModal = () => {
    setBookForm(emptyBookForm())
    setModal({ type: 'book' })
  }

  const openPageModal = () => {
    if (!selectedBookId) return
    setPageForm(emptyPageForm(selectedBookId, Number(selectedBook?.totalPages || 0) + 1))
    setModal({ type: 'page' })
  }

  const saveBook = async (event) => {
    event.preventDefault()
    setBusy('save-book')
    setError('')
    setInfo('')
    try {
      const created = await createAdminBook({ token, payload: toBookPayload(bookForm) })
      setInfo('Книга создана')
      setModal(null)
      setSelectedBookId(created?.id || '')
      await loadBooks()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось создать книгу')
    } finally {
      setBusy('')
    }
  }

  const savePage = async (event) => {
    event.preventDefault()
    setBusy('save-page')
    setError('')
    setInfo('')
    try {
      await createAdminBookPage({ token, payload: toPagePayload(pageForm) })
      setInfo('Страница добавлена')
      setModal(null)
      await loadBooks()
      await loadSelectedBook()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось добавить страницу')
    } finally {
      setBusy('')
    }
  }

  const publishBook = async () => {
    if (!selectedBookId) return
    setBusy('publish')
    setError('')
    setInfo('')
    try {
      await publishAdminBook({ token, bookId: selectedBookId })
      setInfo('Книга опубликована')
      await loadBooks()
      await loadSelectedBook()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось опубликовать книгу')
    } finally {
      setBusy('')
    }
  }

  const removeBook = async () => {
    if (!selectedBookId || !window.confirm(`Удалить книгу "${selectedBook?.title || ''}"?`)) return
    setBusy('delete')
    setError('')
    setInfo('')
    try {
      await deleteAdminBook({ token, bookId: selectedBookId })
      setInfo('Книга удалена')
      setSelectedBookId('')
      setSelectedBook(null)
      setSelectedPage(null)
      await loadBooks()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось удалить книгу')
    } finally {
      setBusy('')
    }
  }

  return (
    <section className="admin-page articles-page">
      <header className="articles-page-header">
        <div>
          <h1>Библиотека</h1>
          <p>Книги библиотеки, публикация и страницы для чтения</p>
        </div>

        <button type="button" className="articles-create-btn" onClick={openCreateBookModal}>
          <AdminIcon name="plus" className="admin-icon" />
          Создать книгу
        </button>
      </header>

      <div className="library-summary-grid">
        <article><p>Всего книг</p><strong>{summary.total}</strong></article>
        <article><p>С страницами</p><strong className="is-green">{summary.withPages}</strong></article>
        <article><p>Начатые</p><strong className="is-violet">{summary.started}</strong></article>
        <article><p>Прочитанные</p><strong>{summary.finished}</strong></article>
      </div>

      <section className="library-filters">
        <label className="library-search">
          <AdminIcon name="search" className="admin-icon" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Поиск книг..." />
        </label>
        <select value={levelFilter} onChange={(event) => setLevelFilter(event.target.value)}>
          <option>{ALL_LEVELS}</option>
          {levelOptions.map((level) => <option key={level}>{level}</option>)}
        </select>
        <input value={genreFilter} onChange={(event) => setGenreFilter(event.target.value)} placeholder="Жанр" list="library-genres" />
        <datalist id="library-genres">
          {genres.map((genre) => <option key={genre} value={genre} />)}
        </datalist>
      </section>

      {error ? <div className="library-feedback library-feedback--error">{error}</div> : null}
      {info ? <div className="library-feedback">{info}</div> : null}

      <div className="library-layout">
        <section className="articles-table-card">
          {busy === 'load' ? <div className="library-empty">Загрузка книг...</div> : null}
          {busy !== 'load' && books.length === 0 ? <div className="library-empty">Книги не найдены</div> : null}
          {books.length > 0 ? (
            <table className="articles-table">
              <thead>
                <tr>
                  <th>Книга</th>
                  <th>Автор</th>
                  <th>Уровень</th>
                  <th>Жанр</th>
                  <th>Страниц</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book) => (
                  <tr key={book.id} className={book.id === selectedBookId ? 'is-selected' : ''} onClick={() => setSelectedBookId(book.id)}>
                    <td className="article-name-cell">{book.title}</td>
                    <td>{book.author || '-'}</td>
                    <td><span className="article-status-badge is-draft">{book.level}</span></td>
                    <td>{book.genre || '-'}</td>
                    <td>{book.totalPages || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </section>

        <aside className="library-detail-panel">
          {!selectedBook ? <div className="library-empty">Выберите книгу</div> : (
            <>
              <header className="library-detail-header">
                <div>
                  <span>{selectedBook.level} · {selectedBook.genre || 'Без жанра'}</span>
                  <h2>{selectedBook.title}</h2>
                  <p>{selectedBook.description || 'Описание не заполнено'}</p>
                </div>
                {selectedBook.coverUrl ? <img src={selectedBook.coverUrl} alt="" /> : null}
              </header>

              <div className="library-actions">
                <button type="button" className="articles-create-btn" onClick={openPageModal}>Добавить страницу</button>
                <button type="button" className="library-secondary-btn" onClick={publishBook} disabled={busy === 'publish'}>Опубликовать</button>
                <button type="button" className="library-secondary-btn is-danger" onClick={removeBook} disabled={busy === 'delete'}>Удалить</button>
              </div>

              <div className="library-meta-grid">
                <article><span>Автор</span><strong>{selectedBook.author || '-'}</strong></article>
                <article><span>Время чтения</span><strong>{selectedBook.readingTimeMinutes || 0} мин</strong></article>
                <article><span>Страниц</span><strong>{selectedBook.totalPages || 0}</strong></article>
              </div>

              <section className="library-page-preview">
                <header>
                  <h3>Страница 1</h3>
                  <span>{selectedPage?.progressPercent ?? 0}%</span>
                </header>
                <p>{selectedPage?.content || 'У книги пока нет страниц'}</p>
                {selectedPage?.contentRu ? <p className="is-ru">{selectedPage.contentRu}</p> : null}
              </section>
            </>
          )}
        </aside>
      </div>

      {modal?.type === 'book' ? (
        <div className="library-modal-overlay" role="dialog" aria-modal="true">
          <form className="library-modal" onSubmit={saveBook}>
            <header><h2>Создать книгу</h2><button type="button" onClick={() => setModal(null)}>x</button></header>
            <div className="library-form-grid">
              <label>Название<input required value={bookForm.title} onChange={(event) => setBookForm((current) => ({ ...current, title: event.target.value }))} /></label>
              <label>Автор<input value={bookForm.author} onChange={(event) => setBookForm((current) => ({ ...current, author: event.target.value }))} /></label>
              <label>Уровень<select value={bookForm.level} onChange={(event) => setBookForm((current) => ({ ...current, level: event.target.value }))}>{levelOptions.map((level) => <option key={level}>{level}</option>)}</select></label>
              <label>Жанр<input value={bookForm.genre} onChange={(event) => setBookForm((current) => ({ ...current, genre: event.target.value }))} /></label>
              <label>Время чтения<input type="number" value={bookForm.readingTimeMinutes} onChange={(event) => setBookForm((current) => ({ ...current, readingTimeMinutes: event.target.value }))} /></label>
              <label>Cover URL<input value={bookForm.coverUrl} onChange={(event) => setBookForm((current) => ({ ...current, coverUrl: event.target.value }))} /></label>
              <label className="library-form-full">Описание<textarea rows={4} value={bookForm.description} onChange={(event) => setBookForm((current) => ({ ...current, description: event.target.value }))} /></label>
            </div>
            <footer><button type="submit" className="articles-create-btn" disabled={busy === 'save-book'}>Сохранить</button></footer>
          </form>
        </div>
      ) : null}

      {modal?.type === 'page' ? (
        <div className="library-modal-overlay" role="dialog" aria-modal="true">
          <form className="library-modal" onSubmit={savePage}>
            <header><h2>Добавить страницу</h2><button type="button" onClick={() => setModal(null)}>x</button></header>
            <div className="library-form-grid">
              <label>Номер страницы<input type="number" min="1" value={pageForm.pageNumber} onChange={(event) => setPageForm((current) => ({ ...current, pageNumber: event.target.value }))} /></label>
              <label>Audio URL<input value={pageForm.audioUrl} onChange={(event) => setPageForm((current) => ({ ...current, audioUrl: event.target.value }))} /></label>
              <label className="library-form-full">Текст KG<textarea required rows={8} value={pageForm.content} onChange={(event) => setPageForm((current) => ({ ...current, content: event.target.value }))} /></label>
              <label className="library-form-full">Текст RU<textarea rows={8} value={pageForm.contentRu} onChange={(event) => setPageForm((current) => ({ ...current, contentRu: event.target.value }))} /></label>
            </div>
            <footer><button type="submit" className="articles-create-btn" disabled={busy === 'save-page'}>Сохранить</button></footer>
          </form>
        </div>
      ) : null}
    </section>
  )
}

export default ArticlesPage
