import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../../../features/auth/context/AuthProvider.jsx'
import { fetchAllUsers } from '../../../users/api/usersApi.js'
import AdminIcon from '../../../admin/ui/components/AdminIcon.jsx'

const stats = [
  {
    title: 'Всего пользователей',
    value: null,
    growth: null,
    icon: 'users',
    variant: 'violet',
  },
  {
    title: 'Активных курсов',
    value: '24',
    growth: '+3',
    icon: 'book',
    variant: 'rose',
  },
  {
    title: 'Завершенных уроков',
    value: '15,678',
    growth: '+8.2%',
    icon: 'cap',
    variant: 'mint',
  },
  {
    title: 'Выданных сертификатов',
    value: '456',
    growth: '+15',
    icon: 'certificate',
    variant: 'amber',
  },
]

const courses = [
  { title: 'Основы кыргызского языка', students: 1234, progress: '78% завершение', rating: '4.8' },
  { title: 'Разговорная практика', students: 856, progress: '65% завершение', rating: '4.9' },
]

function getInitials(name) {
  return String(name || '')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function buildName(user) {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
  if (fullName) return fullName
  if (typeof user.name === 'string' && user.name.trim()) return user.name.trim()
  return 'Без имени'
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
    return { label: 'Заблокирован', className: 'inactive' }
  }

  if (rawStatus === 'INACTIVE' || rawStatus === 'DISABLED' || rawStatus === 'DEACTIVATED' || user.active === false || user.enabled === false) {
    return { label: 'Неактивен', className: 'inactive' }
  }

  return { label: 'Активен', className: 'active' }
}

function DashboardHome({ onOpenUsersPage }) {
  const { token } = useAuth()
  const [latestUsers, setLatestUsers] = useState([])
  const [totalUsers, setTotalUsers] = useState(0)
  const [usersGrowth, setUsersGrowth] = useState('0.0%')
  const [usersError, setUsersError] = useState('')

  useEffect(() => {
    let isAlive = true

    const loadLatestUsers = async () => {
      setUsersError('')

      try {
        const allUsers = await fetchAllUsers({ token })
        if (isAlive) {
          setTotalUsers(allUsers.length)
        }

        const now = new Date()
        const msInDay = 24 * 60 * 60 * 1000
        const currentStart = now.getTime() - 30 * msInDay
        const previousStart = now.getTime() - 60 * msInDay
        let currentCount = 0
        let previousCount = 0

        for (const user of allUsers) {
          const createdAtMs = new Date(user?.createdAt || 0).getTime()
          if (!Number.isFinite(createdAtMs) || createdAtMs <= 0) continue

          if (createdAtMs >= currentStart) currentCount += 1
          else if (createdAtMs >= previousStart && createdAtMs < currentStart) previousCount += 1
        }

        const growthValue =
          previousCount === 0
            ? currentCount > 0
              ? 100
              : 0
            : ((currentCount - previousCount) / previousCount) * 100
        const growthLabel = `${growthValue >= 0 ? '+' : ''}${growthValue.toFixed(1)}%`
        if (isAlive) {
          setUsersGrowth(growthLabel)
        }

        const sortedUsers = [...allUsers].sort((a, b) => {
          const dateA = new Date(a?.createdAt || 0).getTime()
          const dateB = new Date(b?.createdAt || 0).getTime()
          return dateB - dateA
        })

        const topUsers = sortedUsers.slice(0, 4).map((user) => {
          const status = normalizeStatus(user)
          return {
            id: user.id || user.email,
            name: buildName(user),
            email: user.email || '-',
            statusLabel: status.label,
            statusClassName: status.className,
            date: formatDate(user.createdAt),
          }
        })

        if (isAlive) {
          setLatestUsers(topUsers)
        }
      } catch (err) {
        if (isAlive) {
          setLatestUsers([])
          setUsersError(err instanceof Error ? err.message : 'Не удалось загрузить новых пользователей')
        }
      }
    }

    loadLatestUsers()
    return () => {
      isAlive = false
    }
  }, [token])

  const statsCards = useMemo(() => {
    return stats.map((card) => {
      if (card.title !== 'Всего пользователей') return card
      return {
        ...card,
        value: new Intl.NumberFormat('ru-RU').format(totalUsers),
        growth: usersGrowth,
      }
    })
  }, [totalUsers, usersGrowth])

  const usersContent = useMemo(() => {
    if (usersError) {
      return <div className="admin-panel-empty">{usersError}</div>
    }

    if (latestUsers.length === 0) {
      return <div className="admin-panel-empty">Нет новых пользователей</div>
    }

    return latestUsers.map((newUser) => (
      <div key={newUser.id} className="admin-user-row">
        <div className="admin-user-main">
          <div className="admin-list-avatar">{getInitials(newUser.name).slice(0, 1)}</div>
          <div>
            <h3>{newUser.name}</h3>
            <p>{newUser.email}</p>
          </div>
        </div>
        <div className="admin-user-side">
          <span className={`admin-status-pill ${newUser.statusClassName}`}>
            {newUser.statusLabel}
          </span>
          <small>{newUser.date}</small>
        </div>
      </div>
    ))
  }, [latestUsers, usersError])

  return (
    <section className="admin-page">
      <header className="admin-page-header">
        <h1>Дашборд</h1>
        <p>Добро пожаловать в панель управления ENESAI</p>
      </header>

      <div className="admin-stats-grid">
        {statsCards.map((card) => (
          <article key={card.title} className="admin-stats-card">
            <div className="admin-stats-row">
              <div className={`admin-stats-icon ${card.variant}`}>
                <AdminIcon name={card.icon} className="admin-icon" />
              </div>
              <p className="admin-stats-growth">
                <AdminIcon name="trend" className="admin-icon" />
                {card.growth}
              </p>
            </div>
            <p className="admin-stats-title">{card.title}</p>
            <strong className="admin-stats-value">{card.value}</strong>
          </article>
        ))}
      </div>

      <div className="admin-info-grid">
        <article className="admin-panel-card">
          <header className="admin-panel-header">
            <h2>Новые пользователи</h2>
            <button type="button" className="admin-panel-link" onClick={onOpenUsersPage}>
              Все пользователи
              <span>→</span>
            </button>
          </header>
          <div className="admin-panel-list">
            {usersContent}
          </div>
        </article>

        <article className="admin-panel-card">
          <header className="admin-panel-header">
            <h2>Популярные курсы</h2>
            <button type="button" className="admin-panel-link">
              Все курсы
              <span>→</span>
            </button>
          </header>
          <div className="admin-panel-list">
            {courses.map((course) => (
              <div key={course.title} className="admin-course-row">
                <div className="admin-course-main">
                  <h3>{course.title}</h3>
                  <p>
                    <AdminIcon name="users" className="admin-icon admin-users-mini-icon" /> {course.students}{' '}
                    студентов
                    <span>{course.progress}</span>
                  </p>
                </div>
                <div className="admin-course-rating">
                  <strong>{course.rating}</strong>
                  <AdminIcon name="star" className="admin-icon" />
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  )
}

export default DashboardHome
