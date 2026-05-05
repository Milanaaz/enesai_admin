import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../../features/auth/context/AuthProvider.jsx'
import { fetchAllUsers } from '../../users/api/usersApi.js'
import AdminIcon from '../../admin/ui/components/AdminIcon.jsx'
import './admins-page.css'

const ADMIN_ROLE_LABELS = {
  SUPER_ADMIN: 'Супер админ',
  ADMIN: 'Админ',
  CONTENT_ADMIN: 'Контент-админ',
}

function getInitial(name) {
  const safeName = String(name || '').trim()
  return safeName ? safeName.charAt(0).toUpperCase() : '?'
}

function getDisplayName(user) {
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim()
  if (fullName) return fullName
  if (typeof user?.name === 'string' && user.name.trim()) return user.name.trim()
  if (typeof user?.email === 'string' && user.email.trim()) return user.email.trim()
  return 'Без имени'
}

function normalizeRole(rawRole) {
  const normalized = String(rawRole || '')
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_')

  const withoutPrefix = normalized.startsWith('ROLE_') ? normalized.slice(5) : normalized

  if (withoutPrefix === 'SUPER_ADMIN' || withoutPrefix === 'SUPERADMIN') return 'SUPER_ADMIN'
  if (withoutPrefix === 'ADMIN' || withoutPrefix === 'ADMINISTRATOR') return 'ADMIN'
  if (withoutPrefix === 'CONTENT_ADMIN' || withoutPrefix === 'CONTENTADMIN') return 'CONTENT_ADMIN'
  return null
}

function getStatusLabel(user) {
  const rawStatus =
    typeof user?.status === 'string'
      ? user.status.trim().toUpperCase()
      : typeof user?.accountStatus === 'string'
        ? user.accountStatus.trim().toUpperCase()
        : ''

  const blocked =
    user?.blocked === true ||
    user?.isBlocked === true ||
    rawStatus === 'BLOCKED' ||
    rawStatus === 'BANNED'

  if (blocked) return 'Заблокирован'

  if (
    rawStatus === 'INACTIVE' ||
    rawStatus === 'DISABLED' ||
    rawStatus === 'DEACTIVATED' ||
    user?.active === false ||
    user?.enabled === false
  ) {
    return 'Неактивен'
  }

  return 'Активен'
}

function formatLastLogin(dateValue) {
  if (!dateValue) return '-'
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function AdminsPage() {
  const { token } = useAuth()
  const [admins, setAdmins] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('Все роли')

  useEffect(() => {
    let isAlive = true

    const loadAdmins = async () => {
      setIsLoading(true)
      setError('')

      try {
        const allUsers = await fetchAllUsers({ token })
        if (!isAlive) return

        const normalizedAdmins = allUsers
          .map((user) => {
            const roleCode = normalizeRole(user?.role)
            if (!roleCode) return null
            return {
              id: user?.id || user?.email,
              name: getDisplayName(user),
              email: user?.email || '-',
              roleCode,
              role: ADMIN_ROLE_LABELS[roleCode],
              status: getStatusLabel(user),
              lastLogin: formatLastLogin(user?.lastLoginAt || user?.lastLogin || user?.updatedAt),
            }
          })
          .filter(Boolean)

        setAdmins(normalizedAdmins)
      } catch (loadError) {
        if (!isAlive) return
        setAdmins([])
        setError(loadError instanceof Error ? loadError.message : 'Не удалось загрузить администраторов')
      } finally {
        if (isAlive) setIsLoading(false)
      }
    }

    loadAdmins()

    return () => {
      isAlive = false
    }
  }, [token])

  const filteredAdmins = useMemo(() => {
    return admins.filter((admin) => {
      const query = search.trim().toLowerCase()
      const matchesSearch =
        admin.name.toLowerCase().includes(query) || admin.email.toLowerCase().includes(query)
      const matchesRole = roleFilter === 'Все роли' || admin.role === roleFilter
      return matchesSearch && matchesRole
    })
  }, [admins, search, roleFilter])

  const summary = useMemo(() => {
    let superAdmins = 0
    let adminsCount = 0
    let contentAdmins = 0

    for (const admin of admins) {
      if (admin.roleCode === 'SUPER_ADMIN') superAdmins += 1
      if (admin.roleCode === 'ADMIN') adminsCount += 1
      if (admin.roleCode === 'CONTENT_ADMIN') contentAdmins += 1
    }

    return {
      total: admins.length,
      superAdmins,
      admins: adminsCount,
      contentAdmins,
    }
  }, [admins])

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
          <strong>{summary.total}</strong>
        </article>
        <article className="admins-summary-card">
          <p>Супер админов</p>
          <strong className="is-violet">{summary.superAdmins}</strong>
        </article>
        <article className="admins-summary-card">
          <p>Контент-админов</p>
          <strong>{summary.contentAdmins}</strong>
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
          <option>Контент-админ</option>
        </select>
      </section>

      <section className="admins-table-card">
        {isLoading ? <div className="users-feedback">Загрузка администраторов...</div> : null}
        {!isLoading && error ? <div className="users-feedback users-feedback--error">{error}</div> : null}
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
            {!isLoading && !error && filteredAdmins.length === 0 ? (
              <tr>
                <td colSpan={6}>Администраторы не найдены</td>
              </tr>
            ) : null}
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
                  <span className="admins-status-badge">{admin.status}</span>
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
