import { useMemo, useState } from 'react'
import AdminIcon from '../../admin/ui/components/AdminIcon.jsx'
import './courses-page.css'

const courseRows = [
  {
    title: 'Основы кыргызского языка',
    level: 'Начальный',
    lessons: 12,
    students: 1234,
    status: 'Опубликован',
    date: '15 Янв 2026',
  },
  {
    title: 'Разговорная практика',
    level: 'Средний',
    lessons: 8,
    students: 856,
    status: 'Опубликован',
    date: '22 Янв 2026',
  },
  {
    title: 'Грамматика для начинающих',
    level: 'Начальный',
    lessons: 15,
    students: 2103,
    status: 'Опубликован',
    date: '5 Фев 2026',
  },
  {
    title: 'Деловой кыргызский',
    level: 'Продвинутый',
    lessons: 10,
    students: 456,
    status: 'Черновик',
    date: '12 Фев 2026',
  },
  {
    title: 'Кыргызские традиции и культура',
    level: 'Средний',
    lessons: 6,
    students: 789,
    status: 'Опубликован',
    date: '18 Фев 2026',
  },
]

function formatStudents(value) {
  return value.toLocaleString('ru-RU')
}

function CoursesPage() {
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState('Все уровни')
  const [statusFilter, setStatusFilter] = useState('Все статусы')

  const filteredCourses = useMemo(() => {
    return courseRows.filter((course) => {
      const matchesSearch = course.title.toLowerCase().includes(search.trim().toLowerCase())
      const matchesLevel = levelFilter === 'Все уровни' || course.level === levelFilter
      const matchesStatus = statusFilter === 'Все статусы' || course.status === statusFilter

      return matchesSearch && matchesLevel && matchesStatus
    })
  }, [search, levelFilter, statusFilter])

  return (
    <section className="admin-page courses-page">
      <header className="courses-page-header">
        <div>
          <h1>Управление курсами</h1>
          <p>Создавайте и редактируйте курсы</p>
        </div>

        <button type="button" className="courses-create-btn">
          <AdminIcon name="plus" className="admin-icon" />
          Создать курс
        </button>
      </header>

      <div className="courses-summary-grid">
        <article className="courses-summary-card">
          <p>Всего курсов</p>
          <strong>5</strong>
        </article>
        <article className="courses-summary-card">
          <p>Опубликованных</p>
          <strong className="is-green">4</strong>
        </article>
        <article className="courses-summary-card">
          <p>Черновиков</p>
          <strong>1</strong>
        </article>
        <article className="courses-summary-card">
          <p>Всего студентов</p>
          <strong className="is-violet">5 438</strong>
        </article>
      </div>

      <section className="courses-filters" aria-label="Фильтрация курсов">
        <label className="courses-search">
          <AdminIcon name="search" className="admin-icon" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Поиск курсов..."
            aria-label="Поиск курсов"
          />
        </label>

        <select value={levelFilter} onChange={(event) => setLevelFilter(event.target.value)} aria-label="Уровень">
          <option>Все уровни</option>
          <option>Начальный</option>
          <option>Средний</option>
          <option>Продвинутый</option>
        </select>

        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Статус">
          <option>Все статусы</option>
          <option>Опубликован</option>
          <option>Черновик</option>
        </select>
      </section>

      <section className="courses-table-card">
        <table className="courses-table">
          <thead>
            <tr>
              <th>Название курса</th>
              <th>Уровень</th>
              <th>Уроки</th>
              <th>Студенты</th>
              <th>Статус</th>
              <th>Дата создания</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredCourses.map((course) => (
              <tr key={course.title}>
                <td className="course-name-cell">{course.title}</td>
                <td>
                  <span className={`course-level-badge level-${course.level.toLowerCase()}`}>{course.level}</span>
                </td>
                <td>{course.lessons}</td>
                <td>
                  <span className="course-students">
                    <AdminIcon name="users" className="admin-icon" />
                    {formatStudents(course.students)}
                  </span>
                </td>
                <td>
                  <span className={`course-status-badge ${course.status === 'Опубликован' ? 'is-published' : ''}`}>
                    {course.status}
                  </span>
                </td>
                <td>{course.date}</td>
                <td>
                  <div className="course-actions">
                    <button type="button" aria-label={`Просмотреть курс ${course.title}`}>
                      <AdminIcon name="eye" className="admin-icon" />
                    </button>
                    <button type="button" aria-label={`Редактировать курс ${course.title}`}>
                      <AdminIcon name="edit" className="admin-icon" />
                    </button>
                    <button type="button" aria-label={`Удалить курс ${course.title}`} className="is-danger">
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

export default CoursesPage
