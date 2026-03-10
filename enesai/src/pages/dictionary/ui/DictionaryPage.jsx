import { useMemo, useState } from 'react'
import AdminIcon from '../../admin/ui/components/AdminIcon.jsx'
import './dictionary-page.css'

const wordRows = [
  {
    kyrgyz: 'Салам',
    russian: 'Привет',
    category: 'Приветствия',
    example: '"Салам! Кандайсыз?"',
    hasAudio: true,
  },
  {
    kyrgyz: 'Рахмат',
    russian: 'Спасибо',
    category: 'Вежливость',
    example: '"Рахмат, жакшы"',
    hasAudio: true,
  },
  {
    kyrgyz: 'Кош',
    russian: 'До свидания',
    category: 'Приветствия',
    example: '"Кош болуңуз!"',
    hasAudio: true,
  },
  {
    kyrgyz: 'Ооба',
    russian: 'Да',
    category: 'Ответы',
    example: '"Ооба, туура"',
    hasAudio: false,
  },
  {
    kyrgyz: 'Жок',
    russian: 'Нет',
    category: 'Ответы',
    example: '"Жок, мен билбейм"',
    hasAudio: true,
  },
  {
    kyrgyz: 'Кечиресиз',
    russian: 'Извините',
    category: 'Вежливость',
    example: '"Кечиресиз, жардам бересизби?"',
    hasAudio: true,
  },
]

function DictionaryPage() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('Все категории')

  const filteredWords = useMemo(() => {
    return wordRows.filter((word) => {
      const query = search.trim().toLowerCase()
      const matchesSearch =
        word.kyrgyz.toLowerCase().includes(query) || word.russian.toLowerCase().includes(query)
      const matchesCategory = categoryFilter === 'Все категории' || word.category === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [search, categoryFilter])

  return (
    <section className="admin-page dictionary-page">
      <header className="dictionary-page-header">
        <div>
          <h1>Управление словарем</h1>
          <p>Добавляйте и редактируйте слова</p>
        </div>

        <button type="button" className="dictionary-create-btn">
          <AdminIcon name="plus" className="admin-icon" />
          Добавить слово
        </button>
      </header>

      <div className="dictionary-summary-grid">
        <article className="dictionary-summary-card">
          <p>Всего слов</p>
          <strong>6</strong>
        </article>
        <article className="dictionary-summary-card">
          <p>С аудио</p>
          <strong className="is-violet">5</strong>
        </article>
        <article className="dictionary-summary-card">
          <p>Категорий</p>
          <strong className="is-green">4</strong>
        </article>
        <article className="dictionary-summary-card">
          <p>Без аудио</p>
          <strong className="is-muted">1</strong>
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

        <select
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
          aria-label="Категория"
        >
          <option>Все категории</option>
          <option>Приветствия</option>
          <option>Вежливость</option>
          <option>Ответы</option>
        </select>
      </section>

      <section className="dictionary-table-card">
        <table className="dictionary-table">
          <thead>
            <tr>
              <th>Кыргызский</th>
              <th>Русский</th>
              <th>Категория</th>
              <th>Пример</th>
              <th>Аудио</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredWords.map((word) => (
              <tr key={word.kyrgyz}>
                <td className="dictionary-kyrgyz-cell">{word.kyrgyz}</td>
                <td className="dictionary-russian-cell">{word.russian}</td>
                <td>
                  <span className="dictionary-category-badge">{word.category}</span>
                </td>
                <td className="dictionary-example-cell">{word.example}</td>
                <td>
                  {word.hasAudio ? (
                    <button type="button" className="dictionary-audio-btn" aria-label={`Прослушать ${word.kyrgyz}`}>
                      <AdminIcon name="volume" className="admin-icon" />
                    </button>
                  ) : (
                    <span className="dictionary-no-audio">Нет</span>
                  )}
                </td>
                <td>
                  <div className="dictionary-actions">
                    <button type="button" aria-label={`Редактировать слово ${word.kyrgyz}`}>
                      <AdminIcon name="edit" className="admin-icon" />
                    </button>
                    <button type="button" aria-label={`Удалить слово ${word.kyrgyz}`} className="is-danger">
                      <AdminIcon name="trash" className="admin-icon" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </section>
  )
}

export default DictionaryPage
