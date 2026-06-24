import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../../features/auth/context/AuthProvider.jsx'
import AdminIcon from '../../admin/ui/components/AdminIcon.jsx'
import {
  archiveAdminBook,
  createAdminBook,
  createAdminBookPage,
  deleteAdminBook,
  deleteAdminBookPage,
  fetchBookById,
  fetchBookPage,
  fetchBooksCatalog,
  publishAdminBook,
  updateAdminBook,
  updateAdminBookPage,
} from '../api/libraryApi.js'
import './articles-page.css'

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

function toPageUpdatePayload(form) {
  return {
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
  const [bookPages, setBookPages] = useState([])
  const [draftBooks, setDraftBooks] = useState({})
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState('')
  const [detailBusy, setDetailBusy] = useState(false)
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
      })
      setBooks(page.content)
      setTotalBooks(page.totalElements || page.content.length)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить книги')
      setBooks([])
      setTotalBooks(0)
    } finally {
      setBusy('')
    }
  }, [search, token])

  const loadSelectedBook = useCallback(async () => {
    if (!selectedBookId) {
      setSelectedBook(null)
      setBookPages([])
      return
    }
    setError('')
    setDetailBusy(true)
    try {
      const book = await fetchBookById({ token, bookId: selectedBookId })
      setSelectedBook(book)
      setPageForm(emptyPageForm(selectedBookId, Number(book?.totalPages || 0) + 1))
      if (book?.totalPages > 0) {
        const pages = await Promise.all(
          Array.from({ length: Number(book.totalPages) }, (_, index) => (
            fetchBookPage({ token, bookId: selectedBookId, pageNumber: index + 1 })
          )),
        )
        setBookPages(pages)
      } else {
        setBookPages([])
      }
    } catch (err) {
      const draftBook = draftBooks[selectedBookId]
      if (draftBook) {
        setSelectedBook(draftBook)
        setBookPages([])
        setPageForm(emptyPageForm(selectedBookId, Number(draftBook?.totalPages || 0) + 1))
        return
      }
      setError(err instanceof Error ? err.message : 'Не удалось загрузить книгу')
      setSelectedBook(null)
      setBookPages([])
    } finally {
      setDetailBusy(false)
    }
  }, [draftBooks, selectedBookId, token])

  useEffect(() => {
    loadBooks()
  }, [loadBooks])

  useEffect(() => {
    loadSelectedBook()
  }, [loadSelectedBook])

  const openCreateBookModal = () => {
    setBookForm(emptyBookForm())
    setModal({ type: 'book' })
  }

  const openEditBookModal = () => {
    if (!selectedBook) return
    setBookForm({
      title: selectedBook.title || '',
      author: selectedBook.author || '',
      description: selectedBook.description || '',
      coverUrl: selectedBook.coverUrl || '',
      level: selectedBook.level || 'A1',
      genre: selectedBook.genre || '',
      readingTimeMinutes: selectedBook.readingTimeMinutes || 0,
    })
    setModal({ type: 'book', mode: 'edit' })
  }

  const openBook = (bookId) => {
    setSelectedBook(null)
    setBookPages([])
    setSelectedBookId(bookId)
  }

  const backToList = () => {
    setSelectedBookId('')
    setSelectedBook(null)
    setBookPages([])
  }

  const openPageModal = () => {
    if (!selectedBookId) return
    setPageForm(emptyPageForm(selectedBookId, Number(selectedBook?.totalPages || 0) + 1))
    setModal({ type: 'page' })
  }

  const openEditPageModal = (page) => {
    if (!page?.id) return
    setPageForm({
      bookId: selectedBookId,
      pageId: page.id,
      pageNumber: page.pageNumber || 1,
      content: page.content || '',
      contentRu: page.contentRu || '',
      audioUrl: page.audioUrl || '',
    })
    setModal({ type: 'page', mode: 'edit', pageId: page.id })
  }

  const saveBook = async (event) => {
    event.preventDefault()
    setBusy('save-book')
    setError('')
    setInfo('')
    try {
      if (modal?.mode === 'edit') {
        const updated = await updateAdminBook({ token, bookId: selectedBookId, payload: toBookPayload(bookForm) })
        setInfo('Книга обновлена')
        setModal(null)
        setSelectedBook((current) => ({ ...current, ...updated }))
        setDraftBooks((current) => {
          if (!current[selectedBookId]) return current
          return { ...current, [selectedBookId]: { ...current[selectedBookId], ...updated } }
        })
        await loadBooks()
        return
      }

      const created = await createAdminBook({ token, payload: toBookPayload(bookForm) })
      const createdBook = {
        totalPages: 0,
        ...created,
      }
      setInfo('Книга создана')
      setModal(null)
      if (createdBook?.id) {
        setDraftBooks((current) => ({ ...current, [createdBook.id]: createdBook }))
        setSelectedBook(createdBook)
        setBookPages([])
        setSelectedBookId(createdBook.id)
      }
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
      if (modal?.mode === 'edit') {
        const updatedPage = await updateAdminBookPage({
          token,
          pageId: modal.pageId,
          payload: toPageUpdatePayload(pageForm),
        })
        setInfo('Страница обновлена')
        setModal(null)
        setBookPages((current) => current.map((page) => (page.id === modal.pageId ? { ...page, ...updatedPage } : page)))
        return
      }

      const createdPage = await createAdminBookPage({ token, payload: toPagePayload(pageForm) })
      const nextTotalPages = Math.max(Number(selectedBook?.totalPages || 0), Number(pageForm.pageNumber) || 1)
      setDraftBooks((current) => {
        const draftBook = current[selectedBookId]
        if (!draftBook) return current
        return {
          ...current,
          [selectedBookId]: {
            ...draftBook,
            totalPages: nextTotalPages,
          },
        }
      })
      setSelectedBook((current) => (current ? { ...current, totalPages: nextTotalPages } : current))
      setBookPages((current) => {
        const withoutSamePage = current.filter((page) => Number(page?.pageNumber) !== Number(createdPage?.pageNumber))
        return [...withoutSamePage, createdPage].sort((a, b) => Number(a?.pageNumber || 0) - Number(b?.pageNumber || 0))
      })
      setInfo('Страница добавлена')
      setModal(null)
      await loadBooks()
      if (!draftBooks[selectedBookId]) {
        await loadSelectedBook()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось добавить страницу')
    } finally {
      setBusy('')
    }
  }

  const archiveBook = async () => {
    if (!selectedBookId || !window.confirm(`Архивировать книгу "${selectedBook?.title || ''}"?`)) return
    setBusy('archive')
    setError('')
    setInfo('')
    try {
      await archiveAdminBook({ token, bookId: selectedBookId })
      setInfo('Книга архивирована')
      backToList()
      await loadBooks()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось архивировать книгу')
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
      setDraftBooks((current) => {
        const next = { ...current }
        delete next[selectedBookId]
        return next
      })
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
      backToList()
      await loadBooks()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось удалить книгу')
    } finally {
      setBusy('')
    }
  }

  const removePage = async (page) => {
    if (!page?.id || !window.confirm(`Удалить страницу ${page.pageNumber}?`)) return
    setBusy(`delete-page-${page.id}`)
    setError('')
    setInfo('')
    try {
      await deleteAdminBookPage({ token, pageId: page.id })
      setInfo('Страница удалена')
      setBookPages((current) => current.filter((item) => item.id !== page.id))
      setSelectedBook((current) => (
        current ? { ...current, totalPages: Math.max(Number(current.totalPages || 0) - 1, 0) } : current
      ))
      await loadBooks()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось удалить страницу')
    } finally {
      setBusy('')
    }
  }

  const renderModals = () => (
    <>
      {modal?.type === 'book' ? (
        <div className="library-modal-overlay" role="dialog" aria-modal="true">
          <form className="library-modal" onSubmit={saveBook}>
            <header><h2>{modal.mode === 'edit' ? 'Редактировать книгу' : 'Создать книгу'}</h2><button type="button" onClick={() => setModal(null)}>x</button></header>
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
            <header><h2>{modal.mode === 'edit' ? 'Редактировать страницу' : 'Добавить страницу'}</h2><button type="button" onClick={() => setModal(null)}>x</button></header>
            <div className="library-form-grid">
              <label>Номер страницы<input type="number" min="1" value={pageForm.pageNumber} disabled={modal.mode === 'edit'} onChange={(event) => setPageForm((current) => ({ ...current, pageNumber: event.target.value }))} /></label>
              <label>Audio URL<input value={pageForm.audioUrl} onChange={(event) => setPageForm((current) => ({ ...current, audioUrl: event.target.value }))} /></label>
              <label className="library-form-full">Текст KG<textarea required rows={8} value={pageForm.content} onChange={(event) => setPageForm((current) => ({ ...current, content: event.target.value }))} /></label>
              <label className="library-form-full">Текст RU<textarea rows={8} value={pageForm.contentRu} onChange={(event) => setPageForm((current) => ({ ...current, contentRu: event.target.value }))} /></label>
            </div>
            <footer><button type="submit" className="articles-create-btn" disabled={busy === 'save-page'}>Сохранить</button></footer>
          </form>
        </div>
      ) : null}
    </>
  )

  if (selectedBookId) {
    return (
      <section className="admin-page articles-page">
        <header className="articles-page-header">
          <div>
            <button type="button" className="library-back-btn" onClick={backToList}>Назад к списку</button>
            <h1>{selectedBook?.title || 'Книга'}</h1>
            <p>Полная информация о книге, страницы и действия публикации</p>
          </div>
        </header>

        {error ? <div className="library-feedback library-feedback--error">{error}</div> : null}
        {info ? <div className="library-feedback">{info}</div> : null}

        {detailBusy && !selectedBook ? <div className="library-detail-panel"><div className="library-empty">Загрузка книги...</div></div> : null}
        {!detailBusy && !selectedBook ? <div className="library-detail-panel"><div className="library-empty">Книга не найдена</div></div> : null}

        {selectedBook ? (
          <article className="library-detail-panel library-detail-panel--page">
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
              <button type="button" className="library-secondary-btn" onClick={openEditBookModal}>Редактировать</button>
              <button type="button" className="library-secondary-btn" onClick={publishBook} disabled={busy === 'publish'}>Опубликовать</button>
              <button type="button" className="library-secondary-btn" onClick={archiveBook} disabled={busy === 'archive'}>Архивировать</button>
              <button type="button" className="library-secondary-btn is-danger" onClick={removeBook} disabled={busy === 'delete'}>Удалить</button>
            </div>

            <div className="library-meta-grid">
              <article><span>Автор</span><strong>{selectedBook.author || '-'}</strong></article>
              <article><span>Время чтения</span><strong>{selectedBook.readingTimeMinutes || 0} мин</strong></article>
              <article><span>Страниц</span><strong>{selectedBook.totalPages || 0}</strong></article>
            </div>

            <section className="library-pages-list">
              {bookPages.length === 0 ? (
                <article className="library-page-preview">
                  <p>У книги пока нет страниц</p>
                </article>
              ) : null}

              {bookPages.map((page) => (
                <article className="library-page-preview" key={page.id || page.pageNumber}>
                  <header>
                    <h3>Страница {page.pageNumber}</h3>
                    <div className="library-page-tools">
                      <span>{page.progressPercent ?? 0}%</span>
                      {page.id ? <button type="button" onClick={() => openEditPageModal(page)}>Редактировать</button> : null}
                      {page.id ? <button type="button" className="is-danger" onClick={() => removePage(page)} disabled={busy === `delete-page-${page.id}`}>Удалить</button> : null}
                    </div>
                  </header>
                  {page.audioUrl ? (
                    <div className="library-page-audio">
                      <audio controls src={page.audioUrl}>Ваш браузер не поддерживает аудио.</audio>
                      <a href={page.audioUrl} target="_blank" rel="noreferrer">Открыть аудио</a>
                    </div>
                  ) : null}
                  <p>{page.content || 'Текст страницы не заполнен'}</p>
                  {page.contentRu ? <p className="is-ru">{page.contentRu}</p> : null}
                </article>
              ))}
            </section>
          </article>
        ) : null}

        {renderModals()}
      </section>
    )
  }

  return (
    <section className="admin-page articles-page">
      <header className="articles-page-header">
        <div>
          <h1>Библиотека</h1>
          <p>Список книг библиотеки</p>
        </div>

        <button type="button" className="articles-create-btn" onClick={openCreateBookModal}>
          <AdminIcon name="plus" className="admin-icon" />
          Создать книгу
        </button>
      </header>

      <section className="library-filters">
        <label className="library-search">
          <AdminIcon name="search" className="admin-icon" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Поиск книг..." />
        </label>
        <span className="library-total">Всего: {totalBooks}</span>
      </section>

      {error ? <div className="library-feedback library-feedback--error">{error}</div> : null}
      {info ? <div className="library-feedback">{info}</div> : null}

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
                <tr key={book.id} onClick={() => openBook(book.id)}>
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

      {renderModals()}
    </section>
  )
}

export default ArticlesPage
