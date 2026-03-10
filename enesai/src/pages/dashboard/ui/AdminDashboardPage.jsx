import { useMemo, useState } from 'react'
import { useAuth } from '../../../features/auth/context/AuthProvider.jsx'
import './admin-dashboard-page.css'

const menuItems = [
  { label: 'Дашборд', icon: 'dashboard', active: true },
  { label: 'Курсы', icon: 'book' },
  { label: 'Уроки', icon: 'cap' },
  { label: 'Тесты', icon: 'quiz' },
  { label: 'Статьи', icon: 'article' },
  { label: 'Словарь', icon: 'dictionary' },
  { label: 'Пользователи', icon: 'users' },
  { label: 'Администраторы', icon: 'shield' },
  { label: 'Сертификаты', icon: 'certificate' },
]

const stats = [
  {
    title: 'Всего пользователей',
    value: '2,543',
    growth: '+12.5%',
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

const users = [
  { name: 'Айдай Асанова', email: 'aiday@mail.com', status: 'Активен', date: '5 марта 2026' },
  { name: 'Бекжан Тойчиев', email: 'bekzhan@mail.com', status: 'Активен', date: '4 марта 2026' },
  { name: 'Гулнара Садырова', email: 'gulnara@mail.com', status: 'Неактивен', date: '4 марта 2026' },
]

const courses = [
  { title: 'Основы кыргызского языка', students: 1234, progress: '78% завершение', rating: '4.8' },
  { title: 'Разговорная практика', students: 856, progress: '65% завершение', rating: '4.9' },
]

function Icon({ name, className = '' }) {
  switch (name) {
    case 'dashboard':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
          <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
          <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
          <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
        </svg>
      )
    case 'book':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M12 5.25c-2.28-1.39-5.09-1.82-8-1.2v12.77c2.86-.71 5.67-.3 8 1.2v-12.77z" />
          <path d="M12 5.25c2.28-1.39 5.09-1.82 8-1.2v12.77c-2.86-.71-5.67-.3-8 1.2v-12.77z" />
        </svg>
      )
    case 'cap':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="m3 10 9-4 9 4-9 4-9-4z" />
          <path d="M6.5 12.2v3.2c1.8 1.4 3.58 2.1 5.5 2.1s3.7-.7 5.5-2.1v-3.2" />
        </svg>
      )
    case 'quiz':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M7 2.75h8l4 4v14.5H5V2.75h2z" />
          <path d="M15 2.75v4h4" />
          <path d="M9.2 11.15a2.45 2.45 0 1 1 4.8.83c-.21.72-.78 1.14-1.33 1.55-.55.42-1.08.82-1.17 1.47" />
          <circle cx="11.5" cy="18" r=".9" />
        </svg>
      )
    case 'article':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M7 2.75h8l4 4v14.5H5V2.75h2z" />
          <path d="M15 2.75v4h4" />
          <path d="M8 11.25h8M8 15h8M8 18.75h5" />
        </svg>
      )
    case 'dictionary':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="m3.25 6.5 8.75 11 8.75-11" />
          <path d="M12 17.5V6.5" />
          <path d="M19.5 4.5h-3M7.5 4.5h-3" />
        </svg>
      )
    case 'users':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <circle cx="9.5" cy="8.5" r="3.2" />
          <path d="M4.5 18.5c.4-2.9 2.2-4.6 5-4.6s4.6 1.7 5 4.6" />
          <path d="M16.75 7.25a2.75 2.75 0 1 1 .02 5.5" />
          <path d="M16.5 14.35c1.87.43 3.02 1.68 3.4 3.65" />
        </svg>
      )
    case 'shield':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M12 3.5 19 6v5.45c0 4.43-2.6 7.28-7 9.05-4.4-1.77-7-4.62-7-9.05V6l7-2.5z" />
        </svg>
      )
    case 'certificate':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <circle cx="12" cy="9.2" r="4.6" />
          <path d="M9.8 13.5 8.4 20l3.6-2.05L15.6 20l-1.4-6.5" />
        </svg>
      )
    case 'menu':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M4 6.5h16M4 12h16M4 17.5h16" />
        </svg>
      )
    case 'logout':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M14.5 5.5h-7a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h7" />
          <path d="m11.5 12 7 0" />
          <path d="m15.75 8.25 3.75 3.75-3.75 3.75" />
        </svg>
      )
    case 'star':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="m12 4.7 2.16 4.36 4.82.71-3.49 3.4.82 4.8L12 15.66l-4.31 2.27.83-4.8-3.5-3.4 4.84-.71L12 4.7z" />
        </svg>
      )
    case 'trend':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="m4 15.75 5.2-5.2 3.3 3.3 6.5-6.5" />
          <path d="M15.5 7.35h3.5v3.5" />
        </svg>
      )
    default:
      return null
  }
}

function getInitials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function AdminDashboardPage() {
  const { user, logout } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(true)

  const adminName = useMemo(() => {
    if (!user?.email) return 'Админ'
    return user.email.split('@')[0]
  }, [user?.email])

  return (
    <main className={`dashboard-layout ${isCollapsed ? 'collapsed' : ''}`}>
      <aside className={`dashboard-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-top">
          <div className="brand">
            <div className="brand-icon">
              <Icon name="book" className="icon" />
            </div>
            <strong>ENESAI</strong>
          </div>
          <button
            className="sidebar-menu-btn"
            type="button"
            aria-label="Свернуть меню"
            onClick={() => setIsCollapsed((value) => !value)}
          >
            <Icon name="menu" className="icon" />
          </button>
        </div>

        <nav className="sidebar-nav" aria-label="Разделы панели администратора">
          {menuItems.map((item) => (
            <button key={item.label} type="button" className={`nav-item ${item.active ? 'active' : ''}`}>
              <Icon name={item.icon} className="icon" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-user">
          <div className="user-block">
            <div className="user-avatar">{getInitials(adminName)}</div>
            <div className="user-meta">
              <strong>{adminName}</strong>
              <span>Супер админ</span>
            </div>
          </div>
          <button className="logout-link" type="button" onClick={logout}>
            <Icon name="logout" className="icon" />
            <span>Выйти</span>
          </button>
        </div>
      </aside>

      <section className="dashboard-content">
        <header className="content-header">
          <h1>Дашборд</h1>
          <p>Добро пожаловать в панель управления ENESAI</p>
        </header>

        <div className="stats-grid">
          {stats.map((card) => (
            <article key={card.title} className="stats-card">
              <div className="stats-row">
                <div className={`stats-icon ${card.variant}`}>
                  <Icon name={card.icon} className="icon" />
                </div>
                <p className="stats-growth">
                  <Icon name="trend" className="icon" />
                  {card.growth}
                </p>
              </div>
              <p className="stats-title">{card.title}</p>
              <strong className="stats-value">{card.value}</strong>
            </article>
          ))}
        </div>

        <div className="info-grid">
          <article className="panel-card">
            <header className="panel-header">
              <h2>Новые пользователи</h2>
              <button type="button" className="panel-link">
                Все пользователи
                <span>→</span>
              </button>
            </header>
            <div className="panel-list users-list">
              {users.map((newUser) => (
                <div key={newUser.email} className="user-row">
                  <div className="user-main">
                    <div className="list-avatar">{getInitials(newUser.name).slice(0, 1)}</div>
                    <div>
                      <h3>{newUser.name}</h3>
                      <p>{newUser.email}</p>
                    </div>
                  </div>
                  <div className="user-side">
                    <span className={`status-pill ${newUser.status === 'Активен' ? 'active' : 'inactive'}`}>
                      {newUser.status}
                    </span>
                    <small>{newUser.date}</small>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="panel-card">
            <header className="panel-header">
              <h2>Популярные курсы</h2>
              <button type="button" className="panel-link">
                Все курсы
                <span>→</span>
              </button>
            </header>
            <div className="panel-list courses-list">
              {courses.map((course) => (
                <div key={course.title} className="course-row">
                  <div className="course-main">
                    <h3>{course.title}</h3>
                    <p>
                      <Icon name="users" className="icon users-mini-icon" /> {course.students} студентов
                      <span>{course.progress}</span>
                    </p>
                  </div>
                  <div className="course-rating">
                    <strong>{course.rating}</strong>
                    <Icon name="star" className="icon" />
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>
    </main>
  )
}

export default AdminDashboardPage

