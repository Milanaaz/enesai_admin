import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../auth/context/useAuth.js'
import AdminIcon from '../../../shared/ui/AdminIcon.jsx'
import Toast from '../../../shared/ui/Toast/Toast.jsx'
import {
  blockManagementUser,
  createAdmin,
  fetchManagementUsers,
  unblockManagementUser,
  updateManagementUserRole,
} from '../api/adminManagementApi.js'

const ROLE_OPTIONS = ['CONTENT_ADMIN', 'SUPER_ADMIN']
const ROLE_FILTER_OPTIONS = ['ALL', 'CONTENT_ADMIN', 'SUPER_ADMIN']
const ROLE_LABELS = {
  USER: 'Пользователь',
  CONTENT_ADMIN: 'Контент-админ',
  SUPER_ADMIN: 'Супер админ',
}

const EMPTY_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: 'CONTENT_ADMIN',
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
  if (withoutPrefix === 'CONTENT_ADMIN' || withoutPrefix === 'CONTENTADMIN') return 'CONTENT_ADMIN'
  if (withoutPrefix === 'USER') return 'USER'
  return ''
}

function normalizeStatus(user) {
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

  if (blocked) return { key: 'blocked', label: 'Заблокирован' }

  if (
    rawStatus === 'INACTIVE' ||
    rawStatus === 'DISABLED' ||
    rawStatus === 'DEACTIVATED' ||
    user?.active === false ||
    user?.enabled === false
  ) {
    return { key: 'inactive', label: 'Неактивен' }
  }

  return { key: 'active', label: 'Активен' }
}

function mapAdmin(rawUser) {
  const roleCode = normalizeRole(rawUser?.role)
  return {
    id: rawUser?.id || '',
    name: getDisplayName(rawUser),
    email: rawUser?.email || '-',
    roleCode,
    role: ROLE_LABELS[roleCode] || roleCode || '-',
    status: normalizeStatus(rawUser),
    createdAt: rawUser?.createdAt || '',
  }
}

function AdminsManager() {
  const { token, user } = useAuth()
  const [admins, setAdmins] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionInfo, setActionInfo] = useState('')
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [busyUserId, setBusyUserId] = useState('')

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState(EMPTY_FORM)
  const [createError, setCreateError] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const [selectedAdmin, setSelectedAdmin] = useState(null)
  const [roleDraft, setRoleDraft] = useState('CONTENT_ADMIN')
  const [isRoleSaving, setIsRoleSaving] = useState(false)

  const currentUserId = user?.id || ''

  const loadAdmins = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const rows = await fetchManagementUsers({
        token,
        search: search.trim(),
        role: roleFilter === 'ALL' ? '' : roleFilter,
      })
      setAdmins(rows.map(mapAdmin).filter((admin) => admin.roleCode === 'CONTENT_ADMIN' || admin.roleCode === 'SUPER_ADMIN'))
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'Не удалось загрузить администраторов'
      setAdmins([])
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [roleFilter, search, token])

  useEffect(() => {
    const timeoutId = window.setTimeout(loadAdmins, 250)
    return () => window.clearTimeout(timeoutId)
  }, [loadAdmins])

  const filteredAdmins = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return admins

    return admins.filter((admin) => {
      return (
        admin.name.toLowerCase().includes(query) ||
        admin.email.toLowerCase().includes(query) ||
        admin.role.toLowerCase().includes(query)
      )
    })
  }, [admins, search])

  const summary = useMemo(() => {
    let superAdmins = 0
    let contentAdmins = 0
    let blocked = 0

    for (const admin of admins) {
      if (admin.roleCode === 'SUPER_ADMIN') superAdmins += 1
      if (admin.roleCode === 'CONTENT_ADMIN') contentAdmins += 1
      if (admin.status.key === 'blocked') blocked += 1
    }

    return {
      total: admins.length,
      superAdmins,
      contentAdmins,
      blocked,
    }
  }, [admins])

  const openCreateModal = () => {
    setCreateForm(EMPTY_FORM)
    setCreateError('')
    setIsCreateOpen(true)
  }

  const closeCreateModal = () => {
    setIsCreateOpen(false)
    setCreateError('')
    setIsCreating(false)
  }

  const submitCreateAdmin = async (event) => {
    event.preventDefault()
    setIsCreating(true)
    setCreateError('')
    setActionInfo('')

    try {
      await createAdmin({
        token,
        admin: {
          firstName: createForm.firstName.trim(),
          lastName: createForm.lastName.trim(),
          email: createForm.email.trim(),
          password: createForm.password.trim() || undefined,
          role: createForm.role,
        },
      })
      setActionInfo('Администратор создан')
      closeCreateModal()
      await loadAdmins()
    } catch (createAdminError) {
      const message = createAdminError instanceof Error ? createAdminError.message : 'Не удалось создать администратора'
      setCreateError(message)
    } finally {
      setIsCreating(false)
    }
  }

  const openRoleEditor = (admin) => {
    setSelectedAdmin(admin)
    setRoleDraft(admin.roleCode === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'CONTENT_ADMIN')
    setActionInfo('')
  }

  const closeRoleEditor = () => {
    setSelectedAdmin(null)
    setRoleDraft('CONTENT_ADMIN')
    setIsRoleSaving(false)
  }

  const saveRole = async () => {
    if (!selectedAdmin?.id) return

    setIsRoleSaving(true)
    setActionInfo('')
    try {
      await updateManagementUserRole({ token, userId: selectedAdmin.id, role: roleDraft })
      setActionInfo('Роль администратора обновлена')
      closeRoleEditor()
      await loadAdmins()
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'Не удалось обновить роль'
      setActionInfo(message)
    } finally {
      setIsRoleSaving(false)
    }
  }

  const toggleBlock = async (admin) => {
    if (!admin?.id) return
    setBusyUserId(admin.id)
    setActionInfo('')

    try {
      if (admin.status.key === 'blocked') {
        await unblockManagementUser({ token, userId: admin.id })
        setActionInfo(`${admin.name} разблокирован`)
      } else {
        await blockManagementUser({ token, userId: admin.id })
        setActionInfo(`${admin.name} заблокирован`)
      }
      await loadAdmins()
    } catch (toggleError) {
      const message = toggleError instanceof Error ? toggleError.message : 'Не удалось изменить статус'
      setActionInfo(message)
    } finally {
      setBusyUserId('')
    }
  }

  return (
    <section className="admin-page admins-page">
      <header className="admins-page-header">
        <div>
          <h1>Управление администраторами</h1>
          <p>Создание админов, смена ролей и контроль доступа супер-админа</p>
        </div>

        <button type="button" className="admins-create-btn" onClick={openCreateModal}>
          <AdminIcon name="plus" className="admin-icon" />
          Добавить администратора
        </button>
      </header>

      <section className="admins-role-note">
        <header>
          <AdminIcon name="shield" className="admin-icon" />
          <h2>Права доступа</h2>
        </header>
        <p>
          <strong>Супер админ:</strong> управляет пользователями, администраторами, сертификатами и всем контентом.
        </p>
        <p>
          <strong>Контент-админ:</strong> работает с курсами, уроками, тестами, библиотекой и словарем.
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
          <strong className="is-green">{summary.contentAdmins}</strong>
        </article>
        <article className="admins-summary-card">
          <p>Заблокированных</p>
          <strong className="is-red">{summary.blocked}</strong>
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

        <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} aria-label="роль">
          {ROLE_FILTER_OPTIONS.map((role) => (
            <option key={role} value={role}>
              {role === 'ALL' ? 'Все роли' : ROLE_LABELS[role]}
            </option>
          ))}
        </select>
      </section>

      <section className="admins-table-card">
        {isLoading ? <div className="users-feedback">Загрузка администраторов...</div> : null}
        {!isLoading && error ? <Toast message={error} tone="error" onClose={() => setError('')} /> : null}
        {actionInfo ? <Toast message={actionInfo} onClose={() => setActionInfo('')} /> : null}

        {!isLoading && !error ? (
          filteredAdmins.length > 0 ? (
            <table className="admins-table">
              <thead>
                <tr>
                  <th>Администратор</th>
                  <th>Email</th>
                  <th>Роль</th>
                  <th>Статус</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdmins.map((admin) => {
                  const isCurrentUser = currentUserId && admin.id === currentUserId
                  return (
                    <tr key={admin.id || admin.email}>
                      <td>
                        <div className="admins-name-cell">
                          <span className="admins-avatar">{getInitial(admin.name)}</span>
                          <strong>{admin.name}</strong>
                        </div>
                      </td>
                      <td>{admin.email}</td>
                      <td>
                        <span className={`admins-role-badge ${admin.roleCode === 'SUPER_ADMIN' ? 'is-violet' : 'is-green'}`}>
                          {admin.role}
                        </span>
                      </td>
                      <td>
                        <span className={`admins-status-badge is-${admin.status.key}`}>{admin.status.label}</span>
                      </td>
                      <td>
                        <div className="admins-actions">
                          <button
                            type="button"
                            aria-label={`Изменить роль администратора ${admin.name}`}
                            onClick={() => openRoleEditor(admin)}
                          >
                            <AdminIcon name="edit" className="admin-icon" />
                          </button>
                          <button
                            type="button"
                            aria-label={`${admin.status.key === 'blocked' ? '� азблокировать' : 'Заблокировать'} администратора ${admin.name}`}
                            onClick={() => toggleBlock(admin)}
                            disabled={busyUserId === admin.id || isCurrentUser}
                          >
                            <AdminIcon name={admin.status.key === 'blocked' ? 'unlock' : 'lock'} className="admin-icon" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <div className="users-feedback">Администраторы не найдены</div>
          )
        ) : null}
      </section>

      {isCreateOpen ? (
        <div className="users-modal-overlay" role="dialog" aria-modal="true" aria-label="Создание администратора">
          <form className="users-modal admins-modal" onSubmit={submitCreateAdmin}>
            <header className="users-modal-header">
              <h2>Новый администратор</h2>
              <button type="button" className="users-modal-close" onClick={closeCreateModal}>
                x
              </button>
            </header>

            <div className="users-modal-body">
              <label className="users-modal-label" htmlFor="admin-first-name">Имя</label>
              <input
                id="admin-first-name"
                value={createForm.firstName}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, firstName: event.target.value }))}
                required
              />

              <label className="users-modal-label" htmlFor="admin-last-name">Фамилия</label>
              <input
                id="admin-last-name"
                value={createForm.lastName}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, lastName: event.target.value }))}
                required
              />

              <label className="users-modal-label" htmlFor="admin-email">Email</label>
              <input
                id="admin-email"
                type="email"
                value={createForm.email}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, email: event.target.value }))}
                required
              />

              <label className="users-modal-label" htmlFor="admin-password">Пароль</label>
              <input
                id="admin-password"
                type="password"
                value={createForm.password}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, password: event.target.value }))}
                placeholder="Пароль (оставьте пустым для авто-генерации)"
              />

              <label className="users-modal-label" htmlFor="admin-role">Роль</label>
              <select
                id="admin-role"
                value={createForm.role}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, role: event.target.value }))}
              >
                {ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>
                    {ROLE_LABELS[role]}
                  </option>
                ))}
              </select>

              {createError ? <p className="users-feedback users-feedback--error">{createError}</p> : null}

              <button type="submit" className="users-profile-btn" disabled={isCreating}>
                {isCreating ? 'Создаем...' : 'Создать администратора'}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {selectedAdmin ? (
        <div className="users-modal-overlay" role="dialog" aria-modal="true" aria-label="Изменение роли администратора">
          <div className="users-modal admins-modal">
            <header className="users-modal-header">
              <h2>Роль администратора</h2>
              <button type="button" className="users-modal-close" onClick={closeRoleEditor}>
                x
              </button>
            </header>

            <div className="users-modal-body">
              <div className="admins-editor-user">
                <span className="admins-avatar">{getInitial(selectedAdmin.name)}</span>
                <div>
                  <strong>{selectedAdmin.name}</strong>
                  <span>{selectedAdmin.email}</span>
                </div>
              </div>

              <label className="users-modal-label" htmlFor="admin-role-draft">Новая роль</label>
              <select id="admin-role-draft" value={roleDraft} onChange={(event) => setRoleDraft(event.target.value)}>
                {ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>
                    {ROLE_LABELS[role]}
                  </option>
                ))}
              </select>

              <button type="button" className="users-profile-btn" onClick={saveRole} disabled={isRoleSaving}>
                {isRoleSaving ? 'Сохраняем...' : 'Сохранить роль'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default AdminsManager
