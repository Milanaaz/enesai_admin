import { useMemo, useState } from 'react'
import AdminIcon from '../../admin/ui/components/AdminIcon.jsx'
import './admins-page.css'

const adminRows = [
  {
    name: 'Супер Админ',
    email: 'superadmin@enesai.kg',
    role: 'Супер админ',
    status: 'Активен',
    lastLogin: 'Сегодня',
  },
  {
    name: 'Айгерим Нурланова',
    email: 'aigerim@enesai.kg',
    role: 'Админ',
    status: 'Активен',
    lastLogin: 'Вчера',
  },
  {
    name: 'Канат Усенов',
    email: 'kanat@enesai.kg',
    role: 'Админ',
    status: 'Активен',
    lastLogin: '3 марта',
  },
]

function getInitial(name) {
  return name.trim().charAt(0).toUpperCase()
}

function AdminsPage() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('Все роли')

  const filteredAdmins = useMemo(() => {
    return adminRows.filter((admin) => {
      const query = search.trim().toLowerCase()
      const matchesSearch =
        admin.name.toLowerCase().includes(query) || admin.email.toLowerCase().includes(query)
      const matchesRole = roleFilter === 'Все роли' || admin.role === roleFilter
      return matchesSearch && matchesRole
    })
  }, [search, roleFilter])

  return (
    <section className="admin-page admins-page">
      <header className="admins-page-header">
        <div>
          <h1>Управление администраторами</h1>
          <p>Добавление и управление администраторами платформы</p>
        </div>

        <button type="button" className="admins-create-btn">
          <AdminIcon name="plus" className="admin-icon" />
          Добавить администратора
        </button>
      </header>

      <section className="admins-role-note">
        <header>
          <AdminIcon name="shield" className="admin-icon" />
          <h2>Роли администраторов</h2>
        </header>
        <p>
          <strong>Супер админ:</strong> Полный доступ ко всем функциям, включая управление администраторами.
        </p>
        <p>
          <strong>Админ:</strong> Доступ к управлению курсами, уроками, пользователями и контентом.
        </p>
      </section>

      <div className="admins-summary-grid">
        <article className="admins-summary-card">
          <p>Всего администраторов</p>
          <strong>3</strong>
        </article>
        <article className="admins-summary-card">
          <p>Супер админов</p>
          <strong className="is-violet">1</strong>
        </article>
        <article className="admins-summary-card">
          <p>Админов</p>
          <strong className="is-green">2</strong>
        </article>
      </div>

      <section className="admins-filters" aria-label="Фильтрация администраторов">
        <label className="admins-search">
          <AdminIcon name="search" className="admin-icon" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Поиск администраторов..."
            aria-label="Поиск администраторов"
          />
        </label>

        <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} aria-label="Роль">
          <option>Все роли</option>
          <option>Супер админ</option>
          <option>Админ</option>
        </select>
      </section>

      <section className="admins-table-card">
        <table className="admins-table">
          <thead>
            <tr>
              <th>Администратор</th>
              <th>Email</th>
              <th>Роль</th>
              <th>Статус</th>
              <th>Последний вход</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredAdmins.map((admin) => (
              <tr key={admin.email}>
                <td>
                  <div className="admins-name-cell">
                    <span className="admins-avatar">{getInitial(admin.name)}</span>
                    <strong>{admin.name}</strong>
                  </div>
                </td>
                <td>{admin.email}</td>
                <td>
                  <span className={`admins-role-badge ${admin.role === 'Супер админ' ? 'is-violet' : 'is-green'}`}>
                    {admin.role}
                  </span>
                </td>
                <td>
                  <span className="admins-status-badge">Активен</span>
                </td>
                <td>{admin.lastLogin}</td>
                <td>
                  <div className="admins-actions">
                    <button type="button" aria-label={`Редактировать администратора ${admin.name}`}>
                      <AdminIcon name="edit" className="admin-icon" />
                    </button>
                    {admin.role !== 'Супер админ' ? (
                      <button type="button" className="is-danger" aria-label={`Удалить администратора ${admin.name}`}>
                        <AdminIcon name="trash" className="admin-icon" />
                      </button>
                    ) : null}
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

export default AdminsPage
