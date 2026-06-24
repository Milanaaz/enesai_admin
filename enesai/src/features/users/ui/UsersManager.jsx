import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../auth/context/useAuth.js'
import AdminIcon from '../../../shared/ui/AdminIcon.jsx'
import {
  blockUserById,
  fetchAllUsers,
  fetchUserById,
  updateUserRoleById,
  unblockUserById,
} from '../api/usersApi.js'

const ROLE_OPTIONS = ['USER', 'CONTENT_ADMIN', 'SUPER_ADMIN']
const GOAL_OPTIONS = [
  { value: 'LEARN_KYRGYZ', label: 'Выучить кыргызский' },
  { value: 'ORT_PREP', label: 'Подготовка к ОРТ' },
  { value: 'CONVERSATIONAL', label: 'Разговорный' },
  { value: 'BUSINESS', label: 'Деловой' },
]

function getInitial(name) {
  const value = (name || '').trim()
  return value ? value.charAt(0).toUpperCase() : '?'
}

function formatDate(isoDate) {
  if (!isoDate) return '-'
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return '-'

  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function buildName(user) {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
  if (fullName) return fullName
  if (typeof user.name === 'string' && user.name.trim()) return user.name.trim()
  return 'Без имени'
}

function formatGoal(goalType) {
  const value = typeof goalType === 'string' ? goalType.trim() : ''
  if (!value) return '-'

  return GOAL_OPTIONS.find((goal) => goal.value === value)?.label || value
}

function normalizeStatus(user) {
  const rawStatus =
    typeof user.status === 'string'
      ? user.status.trim().toUpperCase()
      : typeof user.accountStatus === 'string'
        ? user.accountStatus.trim().toUpperCase()
        : ''

  const blocked =
    user.blocked === true ||
    user.isBlocked === true ||
    rawStatus === 'BLOCKED' ||
    rawStatus === 'BANNED'

  if (blocked) {
    return { key: 'blocked', label: 'Заблокирован' }
  }

  if (rawStatus === 'INACTIVE' || rawStatus === 'DISABLED' || rawStatus === 'DEACTIVATED') {
    return { key: 'inactive', label: 'Неактивен' }
  }

  if (user.active === false || user.enabled === false) {
    return { key: 'inactive', label: 'Неактивен' }
  }

  return { key: 'active', label: 'Активен' }
}

function mapUser(rawUser) {
  const name = buildName(rawUser)
  const status = normalizeStatus(rawUser)

  return {
    id: rawUser.id,
    name,
    email: rawUser.email || '-',
    courses: typeof rawUser.coursesCount === 'number' ? rawUser.coursesCount : 0,
    level: rawUser.languageLevel || '-',
    goal: formatGoal(rawUser.goalType),
    goalType: rawUser.goalType || '',
    role: rawUser.role || '-',
    date: formatDate(rawUser.createdAt),
    status,
  }
}

function UsersManager() {
  const { token, refreshProfile, saveMyProfile } = useAuth()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [levelFilter, setLevelFilter] = useState('all')
  const [users, setUsers] = useState([])
  const [statusOverrideById, setStatusOverrideById] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionInfo, setActionInfo] = useState('')

  const [busyUserId, setBusyUserId] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [roleDraft, setRoleDraft] = useState('USER')
  const [isDetailsLoading, setIsDetailsLoading] = useState(false)
  const [isRoleSaving, setIsRoleSaving] = useState(false)

  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    avatarUrl: '',
    languageLevel: 'A1',
    goalType: 'LEARN_KYRGYZ',
  })
  const [profileError, setProfileError] = useState('')
  const [isProfileSaving, setIsProfileSaving] = useState(false)

  const loadUsers = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const rows = await fetchAllUsers({ token })
      setUsers(rows.map(mapUser))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось загрузить пользователей'
      setError(message)
      setUsers([])
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const filteredUsers = useMemo(() => {
    return users.filter((entry) => {
      const query = search.trim().toLowerCase()
      const matchesSearch =
        entry.name.toLowerCase().includes(query) ||
        entry.email.toLowerCase().includes(query) ||
        entry.goal.toLowerCase().includes(query) ||
        entry.role.toLowerCase().includes(query)

      const effectiveStatus = statusOverrideById[entry.id] ?? entry.status
      const matchesStatus = statusFilter === 'all' || effectiveStatus.key === statusFilter
      const matchesLevel = levelFilter === 'all' || entry.level === levelFilter
      return matchesSearch && matchesStatus && matchesLevel
    })
  }, [users, search, statusFilter, levelFilter, statusOverrideById])

  const summary = useMemo(() => {
    let active = 0
    let inactive = 0
    let blocked = 0

    for (const row of users) {
      const effectiveStatus = statusOverrideById[row.id] ?? row.status
      if (effectiveStatus.key === 'active') active += 1
      else if (effectiveStatus.key === 'inactive') inactive += 1
      else if (effectiveStatus.key === 'blocked') blocked += 1
    }

    return { total: users.length, active, inactive, blocked }
  }, [users, statusOverrideById])

  const levelOptions = useMemo(() => {
    const levels = new Set(users.map((row) => row.level).filter((level) => level && level !== '-'))
    return Array.from(levels).sort()
  }, [users])

  const openUserDetails = async (id) => {
    if (!id) return

    setIsDetailsLoading(true)
    setSelectedUser(null)
    setActionInfo('')

    try {
      const details = await fetchUserById({ token, id })
      setSelectedUser(details)
      setRoleDraft(typeof details?.role === 'string' ? details.role : 'USER')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось загрузить пользователя'
      setActionInfo(message)
    } finally {
      setIsDetailsLoading(false)
    }
  }

  const closeUserDetails = () => {
    setSelectedUser(null)
    setRoleDraft('USER')
    setIsRoleSaving(false)
  }

  const saveUserRole = async () => {
    if (!selectedUser?.id) return

    setIsRoleSaving(true)
    setActionInfo('')
    try {
      await updateUserRoleById({ token, id: selectedUser.id, role: roleDraft })
      setActionInfo('Роль пользователя обновлена')
      await loadUsers()
      closeUserDetails()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось обновить роль'
      setActionInfo(message)
    } finally {
      setIsRoleSaving(false)
    }
  }

  const toggleUserBlock = async (entry) => {
    if (!entry?.id) return
    setBusyUserId(entry.id)
    setActionInfo('')

    try {
      const effectiveStatus = statusOverrideById[entry.id] ?? entry.status
      if (effectiveStatus.key === 'blocked') {
        await unblockUserById({ token, id: entry.id })
        setActionInfo(`Пользователь ${entry.name} разблокирован`)
        setStatusOverrideById((prev) => ({
          ...prev,
          [entry.id]: { key: 'active', label: 'Активен' },
        }))
      } else {
        await blockUserById({ token, id: entry.id })
        setActionInfo(`Пользователь ${entry.name} заблокирован`)
        setStatusOverrideById((prev) => ({
          ...prev,
          [entry.id]: { key: 'blocked', label: 'Заблокирован' },
        }))
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось изменить статус пользователя'
      setActionInfo(message)
    } finally {
      setBusyUserId('')
    }
  }

  const openProfile = async () => {
    setProfileError('')
    try {
      const me = await refreshProfile()
      setProfileForm({
        firstName: me?.firstName || '',
        lastName: me?.lastName || '',
        avatarUrl: me?.avatarUrl || '',
        languageLevel: me?.languageLevel || 'A1',
        goalType: me?.goalType || 'LEARN_KYRGYZ',
      })
      setIsProfileOpen(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось загрузить профиль'
      setActionInfo(message)
    }
  }

  const saveProfile = async (event) => {
    event.preventDefault()
    setIsProfileSaving(true)
    setProfileError('')

    try {
      await saveMyProfile(profileForm)
      setActionInfo('Профиль обновлен')
      setIsProfileOpen(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось обновить профиль'
      setProfileError(message)
    } finally {
      setIsProfileSaving(false)
    }
  }

  return (
    <section className="admin-page users-page">
      <header className="users-page-header users-page-header--row">
        <div>
          <h1>Управление пользователями</h1>
          <p>Просмотр и управление учетными записями</p>
        </div>
        <button className="users-profile-btn" type="button" onClick={openProfile}>
          Мой профиль
        </button>
      </header>

      <div className="users-summary-grid">
        <article className="users-summary-card">
          <p>Всего пользователей</p>
          <strong>{summary.total}</strong>
        </article>
        <article className="users-summary-card">
          <p>Активных</p>
          <strong className="is-green">{summary.active}</strong>
        </article>
        <article className="users-summary-card">
          <p>Неактивных</p>
          <strong className="is-muted">{summary.inactive}</strong>
        </article>
        <article className="users-summary-card">
          <p>Заблокированных</p>
          <strong className="is-red">{summary.blocked}</strong>
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

        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Статус">
          <option value="all">Все статусы</option>
          <option value="active">Активен</option>
          <option value="inactive">Неактивен</option>
          <option value="blocked">Заблокирован</option>
        </select>

        <select value={levelFilter} onChange={(event) => setLevelFilter(event.target.value)} aria-label="Уровень">
          <option value="all">Все уровни</option>
          {levelOptions.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </section>

      <section className="users-table-card">
        {isLoading ? <div className="users-feedback">Загрузка пользователей...</div> : null}
        {!isLoading && error ? <div className="users-feedback users-feedback--error">{error}</div> : null}
        {actionInfo ? <div className="users-feedback">{actionInfo}</div> : null}

        {!isLoading && !error ? (
          filteredUsers.length > 0 ? (
            <table className="users-table">
              <thead>
                <tr>
                  <th>Пользователь</th>
                  <th>Email</th>
                  <th>Курсов</th>
                  <th>Уровень</th>
                  <th>Цель</th>
                  <th>Статус</th>
                  <th>Роль</th>
                  <th>Дата регистрации</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((entry) => (
                  <tr key={entry.id || entry.email}>
                    <td>
                      <div className="users-name-cell">
                        <span className="users-avatar">{getInitial(entry.name)}</span>
                        <strong>{entry.name}</strong>
                      </div>
                    </td>
                    <td>{entry.email}</td>
                    <td>{entry.courses}</td>
                    <td>
                      <span className="users-level-badge">{entry.level}</span>
                    </td>
                    <td>{entry.goal}</td>
                    <td>
                      {(() => {
                        const effectiveStatus = statusOverrideById[entry.id] ?? entry.status
                        return (
                      <span
                        className={`users-status-badge ${
                          effectiveStatus.key === 'active'
                            ? 'is-active'
                            : effectiveStatus.key === 'inactive'
                              ? 'is-inactive'
                              : 'is-blocked'
                        }`}
                      >
                        {effectiveStatus.label}
                      </span>
                        )
                      })()}
                    </td>
                    <td>{entry.role}</td>
                    <td>{entry.date}</td>
                    <td>
                      <div className="users-actions">
                        <button type="button" aria-label={`Редактировать пользователя ${entry.name}`} onClick={() => openUserDetails(entry.id)}>
                          <AdminIcon name="edit" className="admin-icon" />
                        </button>
                        <button
                          type="button"
                          aria-label={`${(statusOverrideById[entry.id] ?? entry.status).key === 'blocked' ? 'Разблокировать' : 'Заблокировать'} пользователя ${entry.name}`}
                          onClick={() => toggleUserBlock(entry)}
                          disabled={busyUserId === entry.id}
                        >
                          <AdminIcon
                            name={(statusOverrideById[entry.id] ?? entry.status).key === 'blocked' ? 'unlock' : 'lock'}
                            className="admin-icon"
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="users-feedback">Пользователи не найдены</div>
          )
        ) : null}
      </section>

      {selectedUser || isDetailsLoading ? (
        <div className="users-modal-overlay" role="dialog" aria-modal="true" aria-label="Редактирование пользователя">
          <div className="users-modal users-details-modal">
            <header className="users-modal-header">
              <h2>Пользователь</h2>
              <button type="button" className="users-modal-close" onClick={closeUserDetails}>
                ×
              </button>
            </header>

            {isDetailsLoading ? <div className="users-feedback">Загрузка...</div> : null}

            {selectedUser ? (
              <div className="users-modal-body users-details-body">
                <div className="users-details-profile">
                  <span className="users-avatar users-details-avatar">{getInitial(buildName(selectedUser))}</span>
                  <div className="users-details-heading">
                    <strong>{buildName(selectedUser)}</strong>
                    <span>{selectedUser.email || '-'}</span>
                  </div>
                </div>

                <div className="users-details-grid">
                  <div className="users-details-item">
                    <span>Цель</span>
                    <strong>{formatGoal(selectedUser.goalType)}</strong>
                  </div>
                  <div className="users-details-item">
                    <span>Уровень</span>
                    <strong>{selectedUser.languageLevel || '-'}</strong>
                  </div>
                  <div className="users-details-item">
                    <span>Статус</span>
                    {(() => {
                      const status = normalizeStatus(selectedUser)
                      return (
                        <strong
                          className={`users-status-badge ${
                            status.key === 'active'
                              ? 'is-active'
                              : status.key === 'inactive'
                                ? 'is-inactive'
                                : 'is-blocked'
                          }`}
                        >
                          {status.label}
                        </strong>
                      )
                    })()}
                  </div>
                  <div className="users-details-item">
                    <span>Текущая роль</span>
                    <strong>{selectedUser.role || '-'}</strong>
                  </div>
                </div>

                <div className="users-role-editor">
                  <label className="users-modal-label" htmlFor="role-select">Новая роль</label>
                  <div className="users-role-row">
                    <select id="role-select" value={roleDraft} onChange={(event) => setRoleDraft(event.target.value)}>
                      {ROLE_OPTIONS.map((role) => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>

                    <button type="button" className="users-profile-btn" onClick={saveUserRole} disabled={isRoleSaving}>
                      {isRoleSaving ? 'Сохраняем...' : 'Сохранить роль'}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {isProfileOpen ? (
        <div className="users-modal-overlay" role="dialog" aria-modal="true" aria-label="Мой профиль">
          <form className="users-modal" onSubmit={saveProfile}>
            <header className="users-modal-header">
              <h2>Мой профиль</h2>
              <button type="button" className="users-modal-close" onClick={() => setIsProfileOpen(false)}>
                ×
              </button>
            </header>

            <div className="users-modal-body">
              <label className="users-modal-label" htmlFor="first-name">Имя</label>
              <input id="first-name" value={profileForm.firstName} onChange={(event) => setProfileForm((prev) => ({ ...prev, firstName: event.target.value }))} />

              <label className="users-modal-label" htmlFor="last-name">Фамилия</label>
              <input id="last-name" value={profileForm.lastName} onChange={(event) => setProfileForm((prev) => ({ ...prev, lastName: event.target.value }))} />

              <label className="users-modal-label" htmlFor="avatar-url">Avatar URL</label>
              <input id="avatar-url" value={profileForm.avatarUrl} onChange={(event) => setProfileForm((prev) => ({ ...prev, avatarUrl: event.target.value }))} />

              <label className="users-modal-label" htmlFor="language-level">Уровень языка</label>
              <input id="language-level" value={profileForm.languageLevel} onChange={(event) => setProfileForm((prev) => ({ ...prev, languageLevel: event.target.value }))} />

              <label className="users-modal-label" htmlFor="goal-type">Цель</label>
              <select id="goal-type" value={profileForm.goalType} onChange={(event) => setProfileForm((prev) => ({ ...prev, goalType: event.target.value }))}>
                {GOAL_OPTIONS.map((goal) => (
                  <option key={goal.value} value={goal.value}>{goal.label}</option>
                ))}
              </select>

              {profileError ? <p className="users-feedback users-feedback--error">{profileError}</p> : null}

              <button type="submit" className="users-profile-btn" disabled={isProfileSaving}>
                {isProfileSaving ? 'Сохраняем...' : 'Сохранить профиль'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </section>
  )
}

export default UsersManager
