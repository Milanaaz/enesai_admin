function BookPagesList({ pages, busy, onEditPage, onDeletePage }) {
  return (
    <section className="library-pages-list">
      {pages.length === 0 ? (
        <article className="library-page-preview">
          <p>У книги пока нет страниц</p>
        </article>
      ) : null}

      {pages.map((page) => (
        <article className="library-page-preview" key={page.id || page.pageNumber}>
          <header>
            <h3>Страница {page.pageNumber}</h3>
            <div className="library-page-tools">
              <span>{page.progressPercent ?? 0}%</span>
              {page.id ? <button type="button" onClick={() => onEditPage(page)}>Редактировать</button> : null}
              {page.id ? (
                <button
                  type="button"
                  className="is-danger"
                  onClick={() => onDeletePage(page)}
                  disabled={busy === `delete-page-${page.id}`}
                >
                  Удалить
                </button>
              ) : null}
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
  )
}

export default BookPagesList
