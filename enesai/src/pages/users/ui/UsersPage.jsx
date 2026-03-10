import { useMemo, useState } from 'react'
import AdminIcon from '../../admin/ui/components/AdminIcon.jsx'
import './users-page.css'

const userRows = [
  {
    name: 'Айдай Асанова',
    email: 'aiday@mail.com',
    courses: 2,
    level: 'A2',
    status: 'Активен',
    date: '5 марта 2026',
  },
  {
    name: 'Бекжан Тойчиев',
    email: 'bekzhan@mail.com',
    courses: 3,
    level: 'B1',
    status: 'Активен',
    date: '4 марта 2026',
  },
  {
    name: 'Гулнара Садырова',
    email: 'gulnara@mail.com',
    courses: 1,
    level: 'A1',
    status: 'Неактивен',
    date: '4 марта 2026',
  },
  {
    name: 'Дастан Эргешов',
    email: 'dastan@mail.com',
    courses: 4,
    level: 'B2',
    status: 'Активен',
    date: '3 марта 2026',
  },
  {
    name: 'Айжан Мирланова',
    email: 'aizhan@mail.com',
    courses: 0,
    level: 'A1',
    status: 'Заблокирован',
    date: '2 марта 2026',
  },
]

function getInitial(name) {
  return name.trim().charAt(0).toUpperCase()
}

function UsersPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('Все статусы')
  const [levelFilter, setLevelFilter] = useState('Все уровни')

  const filteredUsers = useMemo(() => {
    return userRows.filter((user) => {
      const query = search.trim().toLowerCase()
      const matchesSearch =
        user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query)
      const matchesStatus = statusFilter === 'Все статусы' || user.status === statusFilter
      const matchesLevel = levelFilter === 'Все уровни' || user.level === levelFilter
      return matchesSearch && matchesStatus && matchesLevel
    })
  }, [search, statusFilter, levelFilter])

  return (
    <section className="admin-page users-page">
      <header className="users-page-header">
        <div>
          <h1>Управление пользователями</h1>
          <p>Просмотр и управление учетными записями</p>
        </div>
      </header>

      <div className="users-summary-grid">
        <article className="users-summary-card">
          <p>Всего пользователей</p>
          <strong>5</strong>
        </article>
        <article className="users-summary-card">
          <p>Активных</p>
          <strong className="is-green">3</strong>
        </article>
        <article className="users-summary-card">
          <p>Неактивных</p>
          <strong className="is-muted">1</strong>
        </article>
        <article className="users-summary-card">
          <p>Заблокированных</p>
          <strong className="is-red">1</strong>
        </article>
      </div>

      <section className="users-filters" aria-label="Фильтрация пользователей">
        <label className="users-search">
          <AdminIcon name="search" className="admin-icon" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Поиск пользователей..."
            aria-label="Поиск пользователей"
          />
        </label>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          aria-label="Статус"
        >
          <option>Все статусы</option>
          <option>Активен</option>
          <option>Неактивен</option>
          <option>Заблокирован</option>
        </select>

        <select value={levelFilter} onChange={(event) => setLevelFilter(event.target.value)} aria-label="Уровень">
          <option>Все уровни</option>
          <option>A1</option>
          <option>A2</option>
          <option>B1</option>
          <option>B2</option>
        </select>
      </section>

      <section className="users-table-card">
        <table className="users-table">
          <thead>
            <tr>
              <th>Пользователь</th>
              <th>Email</th>
              <th>Курсов</th>
              <th>Уровень</th>
              <th>Статус</th>
              <th>Дата регистрации</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.email}>
                <td>
                  <div className="users-name-cell">
                    <span className="users-avatar">{getInitial(user.name)}</span>
                    <strong>{user.name}</strong>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>{user.courses}</td>
                <td>
                  <span className="users-level-badge">{user.level}</span>
                </td>
                <td>
                  <span
                    className={`users-status-badge ${
                      user.status === 'Активен'
                        ? 'is-active'
                        : user.status === 'Неактивен'
                          ? 'is-inactive'
                          : 'is-blocked'
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
                <td>{user.date}</td>
                <td>
                  <div className="users-actions">
                    <button type="button" aria-label={`Редактировать пользователя ${user.name}`}>
                      <AdminIcon name="edit" className="admin-icon" />
                    </button>
                    <button type="button" aria-label={`Блокировать пользователя ${user.name}`}>
                      <AdminIcon name="ban" className="admin-icon" />
                    </button>
                    <button type="button" aria-label={`Удалить пользователя ${user.name}`} className="is-danger">
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

export default UsersPage
