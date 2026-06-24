import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../../features/auth/context/useAuth.js'
import { fetchMyCertificates } from '../../../features/certificates/api/certificatesApi.js'
import { fetchAdminCourses } from '../../../features/courses/api/coursesApi.js'
import { fetchAllUsers } from '../../../features/users/api/usersApi.js'
import AdminIcon from '../../../shared/ui/AdminIcon.jsx'
import { fetchMyAnalytics } from '../../../features/dashboard/api/dashboardApi.js'

const STAT_CONFIG = [
  { title: 'Всего пользователей', key: 'totalUsers', icon: 'users', variant: 'violet' },
  { title: 'Активных курсов', key: 'activeCourses', icon: 'book', variant: 'rose' },
  { title: 'Завершенных уроков', key: 'completedLessons', icon: 'cap', variant: 'mint' },
  { title: 'Выданных сертификатов', key: 'issuedCertificates', icon: 'certificate', variant: 'amber' },
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

function formatNumber(value) {
  const number = Number(value)
  if (!Number.isFinite(number)) return '0'
  return new Intl.NumberFormat('ru-RU').format(number)
}

function formatGrowth(value) {
  const number = Number(value)
  if (!Number.isFinite(number)) return ''
  return `${number >= 0 ? '+' : ''}${number.toFixed(number % 1 === 0 ? 0 : 1)}%`
}

function calculateGrowth(currentCount, previousCount) {
  if (previousCount === 0) return currentCount > 0 ? 100 : 0
  return ((currentCount - previousCount) / previousCount) * 100
}

function countCreatedInRanges(rows, dateField = 'createdAt') {
  const now = new Date()
  const msInDay = 24 * 60 * 60 * 1000
  const currentStart = now.getTime() - 30 * msInDay
  const previousStart = now.getTime() - 60 * msInDay
  let currentCount = 0
  let previousCount = 0

  for (const row of rows) {
    const createdAtMs = new Date(row?.[dateField] || 0).getTime()
    if (!Number.isFinite(createdAtMs) || createdAtMs <= 0) continue

    if (createdAtMs >= currentStart) currentCount += 1
    else if (createdAtMs >= previousStart && createdAtMs < currentStart) previousCount += 1
  }

  return { currentCount, previousCount }
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

function normalizeCourse(rawCourse) {
  const rating = Number(rawCourse?.rating)
  const ratingCount = Number(rawCourse?.ratingCount)
  const totalLessons = Number(rawCourse?.totalLessons)
  const totalModules = Number(rawCourse?.totalModules)

  return {
    id: rawCourse?.id || rawCourse?.title,
    title: rawCourse?.title || 'Без названия',
    status: rawCourse?.status || '',
    rating: Number.isFinite(rating) ? rating : 0,
    ratingCount: Number.isFinite(ratingCount) ? ratingCount : 0,
    totalLessons: Number.isFinite(totalLessons) ? totalLessons : 0,
    totalModules: Number.isFinite(totalModules) ? totalModules : 0,
  }
}

function readSettledValue(result, fallback) {
  return result.status === 'fulfilled' ? result.value : fallback
}

function DashboardStats({ onOpenUsersPage, onOpenCoursesPage }) {
  const { token } = useAuth()
  const [latestUsers, setLatestUsers] = useState([])
  const [popularCourses, setPopularCourses] = useState([])
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    activeCourses: 0,
    completedLessons: 0,
    issuedCertificates: 0,
  })
  const [growthByKey, setGrowthByKey] = useState({})
  const [dashboardError, setDashboardError] = useState('')
  const [coursesError, setCoursesError] = useState('')

  useEffect(() => {
    let isAlive = true

    const loadDashboard = async () => {
      setDashboardError('')
      setCoursesError('')

      const [usersResult, coursesResult, analyticsResult, certificatesResult] = await Promise.allSettled([
        fetchAllUsers({ token }),
        fetchAdminCourses({ token }),
        fetchMyAnalytics({ token }),
        fetchMyCertificates({ token }),
      ])

      if (!isAlive) return

      const allUsers = readSettledValue(usersResult, [])
      const courses = readSettledValue(coursesResult, []).map(normalizeCourse)
      const analytics = readSettledValue(analyticsResult, {}) ?? {}
      const certificates = readSettledValue(certificatesResult, [])

      if (usersResult.status === 'rejected') {
        setDashboardError(usersResult.reason instanceof Error ? usersResult.reason.message : 'Не удалось загрузить пользователей')
      }
      if (coursesResult.status === 'rejected') {
        setCoursesError(coursesResult.reason instanceof Error ? coursesResult.reason.message : 'Не удалось загрузить курсы')
      }

      const sortedUsers = [...allUsers].sort((a, b) => {
        const dateA = new Date(a?.createdAt || 0).getTime()
        const dateB = new Date(b?.createdAt || 0).getTime()
        return dateB - dateA
      })

      const topUsers = sortedUsers.slice(0, 5).map((user) => {
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

      const sortedCourses = [...courses]
        .sort((a, b) => {
          if (b.rating !== a.rating) return b.rating - a.rating
          if (b.ratingCount !== a.ratingCount) return b.ratingCount - a.ratingCount
          return b.totalLessons - a.totalLessons
        })
        .slice(0, 4)

      const activeCourses = courses.filter((course) => course.status === 'PUBLISHED').length
      const lessonsFromCourses = courses.reduce((sum, course) => sum + course.totalLessons, 0)
      const issuedCertificates =
        typeof analytics.certificatesEarned === 'number'
          ? analytics.certificatesEarned
          : certificates.filter((certificate) => certificate?.status !== 'REVOKED').length
      const completedLessons =
        typeof analytics.lessonsCompleted === 'number' ? analytics.lessonsCompleted : lessonsFromCourses
      const userRanges = countCreatedInRanges(allUsers)

      setLatestUsers(topUsers)
      setPopularCourses(sortedCourses)
      setDashboardStats({
        totalUsers: allUsers.length,
        activeCourses,
        completedLessons,
        issuedCertificates,
      })
      setGrowthByKey({
        totalUsers: formatGrowth(calculateGrowth(userRanges.currentCount, userRanges.previousCount)),
      })
    }

    loadDashboard()
    return () => {
      isAlive = false
    }
  }, [token])

  const statsCards = useMemo(() => {
    return STAT_CONFIG.map((card) => ({
      ...card,
      value: formatNumber(dashboardStats[card.key]),
      growth: growthByKey[card.key] || '',
    }))
  }, [dashboardStats, growthByKey])

  const usersContent = useMemo(() => {
    if (dashboardError) {
      return <div className="admin-panel-empty">{dashboardError}</div>
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
  }, [dashboardError, latestUsers])

  const coursesContent = useMemo(() => {
    if (coursesError) {
      return <div className="admin-panel-empty">{coursesError}</div>
    }

    if (popularCourses.length === 0) {
      return <div className="admin-panel-empty">Курсы не найдены</div>
    }

    return popularCourses.map((course) => (
      <div key={course.id || course.title} className="admin-course-row">
        <div className="admin-course-main">
          <h3>{course.title}</h3>
          <p>
            <AdminIcon name="users" className="admin-icon admin-users-mini-icon" /> {formatNumber(course.ratingCount)}{' '}
            оценок
            <span>{formatNumber(course.totalLessons)} уроков</span>
          </p>
        </div>
        <div className="admin-course-rating">
          <strong>{course.rating.toFixed(1)}</strong>
          <AdminIcon name="star" className="admin-icon" />
        </div>
      </div>
    ))
  }, [coursesError, popularCourses])

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
                {card.growth ? (
                  <>
                    <AdminIcon name="trend" className="admin-icon" />
                    {card.growth}
                  </>
                ) : null}
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
            <button type="button" className="admin-panel-link" onClick={onOpenCoursesPage}>
              Все курсы
              <span>→</span>
            </button>
          </header>
          <div className="admin-panel-list">
            {coursesContent}
          </div>
        </article>
      </div>
    </section>
  )
}

export default DashboardStats
