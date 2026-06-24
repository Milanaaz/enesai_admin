function PageFormModal({ mode = 'create', form, busy, onChange, onClose, onSubmit }) {
  const title = mode === 'edit' ? 'Редактировать страницу' : 'Добавить страницу'

  return (
    <div className="library-modal-overlay" role="dialog" aria-modal="true">
      <form className="library-modal" onSubmit={onSubmit}>
        <header>
          <h2>{title}</h2>
          <button type="button" onClick={onClose}>x</button>
        </header>
        <div className="library-form-grid">
          <label>
            Номер страницы
            <input
              type="number"
              min="1"
              value={form.pageNumber}
              disabled={mode === 'edit'}
              onChange={(event) => onChange({ pageNumber: event.target.value })}
            />
          </label>
          <label>
            Audio URL
            <input value={form.audioUrl} onChange={(event) => onChange({ audioUrl: event.target.value })} />
          </label>
          <label className="library-form-full">
            Текст KG
            <textarea required rows={8} value={form.content} onChange={(event) => onChange({ content: event.target.value })} />
          </label>
          <label className="library-form-full">
            Текст RU
            <textarea rows={8} value={form.contentRu} onChange={(event) => onChange({ contentRu: event.target.value })} />
          </label>
        </div>
        <footer>
          <button type="submit" className="articles-create-btn" disabled={busy === 'save-page'}>Сохранить</button>
        </footer>
      </form>
    </div>
  )
}

export default PageFormModal
