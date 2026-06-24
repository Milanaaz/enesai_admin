import { LIBRARY_LEVEL_OPTIONS } from '../../../../entities/library/model/bookForms.js'

function BookFormModal({ mode = 'create', form, busy, onChange, onClose, onSubmit }) {
  const title = mode === 'edit' ? 'Редактировать книгу' : 'Создать книгу'

  return (
    <div className="library-modal-overlay" role="dialog" aria-modal="true">
      <form className="library-modal" onSubmit={onSubmit}>
        <header>
          <h2>{title}</h2>
          <button type="button" onClick={onClose}>x</button>
        </header>
        <div className="library-form-grid">
          <label>
            Название
            <input required value={form.title} onChange={(event) => onChange({ title: event.target.value })} />
          </label>
          <label>
            Автор
            <input value={form.author} onChange={(event) => onChange({ author: event.target.value })} />
          </label>
          <label>
            Уровень
            <select value={form.level} onChange={(event) => onChange({ level: event.target.value })}>
              {LIBRARY_LEVEL_OPTIONS.map((level) => <option key={level}>{level}</option>)}
            </select>
          </label>
          <label>
            Жанр
            <input value={form.genre} onChange={(event) => onChange({ genre: event.target.value })} />
          </label>
          <label>
            Время чтения
            <input type="number" value={form.readingTimeMinutes} onChange={(event) => onChange({ readingTimeMinutes: event.target.value })} />
          </label>
          <label>
            Cover URL
            <input value={form.coverUrl} onChange={(event) => onChange({ coverUrl: event.target.value })} />
          </label>
          <label className="library-form-full">
            Описание
            <textarea rows={4} value={form.description} onChange={(event) => onChange({ description: event.target.value })} />
          </label>
        </div>
        <footer>
          <button type="submit" className="articles-create-btn" disabled={busy === 'save-book'}>Сохранить</button>
        </footer>
      </form>
    </div>
  )
}

export default BookFormModal
