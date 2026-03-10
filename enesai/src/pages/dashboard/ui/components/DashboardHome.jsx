import AdminIcon from '../../../admin/ui/components/AdminIcon.jsx'

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

function getInitials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function DashboardHome() {
  return (
    <section className="admin-page">
      <header className="admin-page-header">
        <h1>Дашборд</h1>
        <p>Добро пожаловать в панель управления ENESAI</p>
      </header>

      <div className="admin-stats-grid">
        {stats.map((card) => (
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
            <button type="button" className="admin-panel-link">
              Все пользователи
              <span>→</span>
            </button>
          </header>
          <div className="admin-panel-list">
            {users.map((newUser) => (
              <div key={newUser.email} className="admin-user-row">
                <div className="admin-user-main">
                  <div className="admin-list-avatar">{getInitials(newUser.name).slice(0, 1)}</div>
                  <div>
                    <h3>{newUser.name}</h3>
                    <p>{newUser.email}</p>
                  </div>
                </div>
                <div className="admin-user-side">
                  <span className={`admin-status-pill ${newUser.status === 'Активен' ? 'active' : 'inactive'}`}>
                    {newUser.status}
                  </span>
                  <small>{newUser.date}</small>
                </div>
              </div>
            ))}
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
