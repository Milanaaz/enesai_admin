import { useMemo, useState } from 'react'
import AdminIcon from '../../admin/ui/components/AdminIcon.jsx'
import './lessons-page.css'

const lessonRows = [
  {
    title: 'Алфавит кыргызского языка',
    course: 'Основы',
    module: 'Модуль 1',
    duration: '12 мин',
    status: 'Опубликован',
  },
  {
    title: 'Базовые звуки и произношение',
    course: 'Основы',
    module: 'Модуль 1',
    duration: '15 мин',
    status: 'Опубликован',
  },
  {
    title: 'Приветствия и знакомство',
    course: 'Основы',
    module: 'Модуль 1',
    duration: '10 мин',
    status: 'Опубликован',
  },
  {
    title: 'Числа и счет',
    course: 'Основы',
    module: 'Модуль 2',
    duration: '14 мин',
    status: 'Опубликован',
  },
  {
    title: 'Дни недели и время',
    course: 'Основы',
    module: 'Модуль 2',
    duration: '12 мин',
    status: 'Черновик',
  },
]

function LessonsPage() {
  const [search, setSearch] = useState('')
  const [courseFilter, setCourseFilter] = useState('Все курсы')

  const filteredLessons = useMemo(() => {
    return lessonRows.filter((lesson) => {
      const matchesSearch = lesson.title.toLowerCase().includes(search.trim().toLowerCase())
      const matchesCourse = courseFilter === 'Все курсы' || lesson.course === courseFilter
      return matchesSearch && matchesCourse
    })
  }, [search, courseFilter])

  return (
    <section className="admin-page lessons-page">
      <header className="lessons-page-header">
        <div>
          <h1>Управление уроками</h1>
          <p>Создавайте и редактируйте уроки</p>
        </div>

        <button type="button" className="lessons-create-btn">
          <AdminIcon name="plus" className="admin-icon" />
          Создать урок
        </button>
      </header>

      <section className="lessons-filters" aria-label="Фильтрация уроков">
        <label className="lessons-search">
          <AdminIcon name="search" className="admin-icon" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Поиск уроков..."
            aria-label="Поиск уроков"
          />
        </label>

        <select value={courseFilter} onChange={(event) => setCourseFilter(event.target.value)} aria-label="Курс">
          <option>Все курсы</option>
          <option>Основы</option>
        </select>
      </section>

      <section className="lessons-table-card">
        <table className="lessons-table">
          <thead>
            <tr>
              <th>Название урока</th>
              <th>Курс</th>
              <th>Модуль</th>
              <th>Длительность</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredLessons.map((lesson) => (
              <tr key={lesson.title}>
                <td className="lesson-name-cell">{lesson.title}</td>
                <td>{lesson.course}</td>
                <td>
                  <span className="lesson-module-badge">{lesson.module}</span>
                </td>
                <td>{lesson.duration}</td>
                <td>
                  <span
                    className={`lesson-status-badge ${
                      lesson.status === 'Опубликован' ? 'is-published' : 'is-draft'
                    }`}
                  >
                    {lesson.status}
                  </span>
                </td>
                <td>
                  <div className="lesson-actions">
                    <button type="button" aria-label={`Просмотреть урок ${lesson.title}`}>
                      <AdminIcon name="eye" className="admin-icon" />
                    </button>
                    <button type="button" aria-label={`Редактировать урок ${lesson.title}`}>
                      <AdminIcon name="edit" className="admin-icon" />
                    </button>
                    <button type="button" aria-label={`Удалить урок ${lesson.title}`} className="is-danger">
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

export default LessonsPage
