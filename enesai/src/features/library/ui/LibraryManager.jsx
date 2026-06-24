import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../auth/context/useAuth.js'
import AdminIcon from '../../../shared/ui/AdminIcon.jsx'
import BookFormModal from '../manage-book/ui/BookFormModal.jsx'
import PageFormModal from '../manage-page/ui/PageFormModal.jsx'
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
} from '../../../entities/library/api/libraryApi.js'
import {
  createBookFormFromBook,
  createEmptyBookForm,
  createEmptyPageForm,
  createPageFormFromPage,
  toBookPayload,
  toPagePayload,
  toPageUpdatePayload,
} from '../../../entities/library/model/bookForms.js'
import BooksTable from '../../../entities/library/ui/BooksTable.jsx'
import LibraryBookDetails from '../../../widgets/library-book-details/ui/LibraryBookDetails.jsx'

function LibraryManager() {
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
  const [bookForm, setBookForm] = useState(createEmptyBookForm)
  const [pageForm, setPageForm] = useState(createEmptyPageForm)

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
      setPageForm(createEmptyPageForm(selectedBookId, Number(book?.totalPages || 0) + 1))
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
        setPageForm(createEmptyPageForm(selectedBookId, Number(draftBook?.totalPages || 0) + 1))
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
    setBookForm(createEmptyBookForm())
    setModal({ type: 'book' })
  }

  const openEditBookModal = () => {
    if (!selectedBook) return
    setBookForm(createBookFormFromBook(selectedBook))
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
    setPageForm(createEmptyPageForm(selectedBookId, Number(selectedBook?.totalPages || 0) + 1))
    setModal({ type: 'page' })
  }

  const openEditPageModal = (page) => {
    if (!page?.id) return
    setPageForm(createPageFormFromPage(page, selectedBookId))
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
        <BookFormModal
          mode={modal.mode}
          form={bookForm}
          busy={busy}
          onChange={(patch) => setBookForm((current) => ({ ...current, ...patch }))}
          onClose={() => setModal(null)}
          onSubmit={saveBook}
        />
      ) : null}

      {modal?.type === 'page' ? (
        <PageFormModal
          mode={modal.mode}
          form={pageForm}
          busy={busy}
          onChange={(patch) => setPageForm((current) => ({ ...current, ...patch }))}
          onClose={() => setModal(null)}
          onSubmit={savePage}
        />
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
          <LibraryBookDetails
            book={selectedBook}
            pages={bookPages}
            busy={busy}
            onAddPage={openPageModal}
            onEditBook={openEditBookModal}
            onPublish={publishBook}
            onArchive={archiveBook}
            onDeleteBook={removeBook}
            onEditPage={openEditPageModal}
            onDeletePage={removePage}
          />
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

      <BooksTable books={books} busy={busy} onOpenBook={openBook} />

      {renderModals()}
    </section>
  )
}

export default LibraryManager
