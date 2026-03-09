import { useAuth } from '../../../features/auth/context/AuthProvider.jsx'
import './admin-dashboard-page.css'

function AdminDashboardPage() {
  const { user, logout } = useAuth()

  return (
    <main className="dashboard-page">
      <section className="dashboard-card">
        <header className="dashboard-header">
          <div>
            <p className="dashboard-label">Панель администратора</p>
            <h1>ENESAI</h1>
            <p className="dashboard-email">{user?.email}</p>
          </div>
          <button className="logout-btn" type="button" onClick={logout}>
            Выйти
          </button>
        </header>

        <div className="dashboard-grid">
          <article className="stat-card">
            <p>Пользователи</p>
            <strong>1 284</strong>
          </article>
          <article className="stat-card">
            <p>Активные заявки</p>
            <strong>46</strong>
          </article>
          <article className="stat-card">
            <p>Ошибки системы</p>
            <strong>0</strong>
          </article>
        </div>
      </section>
    </main>
  )
}

export default AdminDashboardPage
