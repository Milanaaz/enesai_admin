import BookPagesList from '../../../entities/library/ui/BookPagesList.jsx'

function LibraryBookDetails({
  book,
  pages,
  busy,
  onAddPage,
  onEditBook,
  onPublish,
  onArchive,
  onDeleteBook,
  onEditPage,
  onDeletePage,
}) {
  return (
    <article className="library-detail-panel library-detail-panel--page">
      <header className="library-detail-header">
        <div>
          <span>{book.level} · {book.genre || 'Без жанра'}</span>
          <h2>{book.title}</h2>
          <p>{book.description || 'Описание не заполнено'}</p>
        </div>
        {book.coverUrl ? <img src={book.coverUrl} alt="" /> : null}
      </header>

      <div className="library-actions">
        <button type="button" className="articles-create-btn" onClick={onAddPage}>Добавить страницу</button>
        <button type="button" className="library-secondary-btn" onClick={onEditBook}>Редактировать</button>
        <button type="button" className="library-secondary-btn" onClick={onPublish} disabled={busy === 'publish'}>Опубликовать</button>
        <button type="button" className="library-secondary-btn" onClick={onArchive} disabled={busy === 'archive'}>Архивировать</button>
        <button type="button" className="library-secondary-btn is-danger" onClick={onDeleteBook} disabled={busy === 'delete'}>Удалить</button>
      </div>

      <div className="library-meta-grid">
        <article><span>Автор</span><strong>{book.author || '-'}</strong></article>
        <article><span>Время чтения</span><strong>{book.readingTimeMinutes || 0} мин</strong></article>
        <article><span>Страниц</span><strong>{book.totalPages || 0}</strong></article>
      </div>

      <BookPagesList
        pages={pages}
        busy={busy}
        onEditPage={onEditPage}
        onDeletePage={onDeletePage}
      />
    </article>
  )
}

export default LibraryBookDetails
