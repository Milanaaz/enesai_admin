import AdminIcon from './AdminIcon.jsx'

const menuItems = [
  { key: 'dashboard', label: 'Дашборд', icon: 'dashboard' },
  { key: 'courses', label: 'Курсы', icon: 'book' },
  { key: 'lessons', label: 'Уроки', icon: 'cap' },
  { key: 'tests', label: 'Тесты', icon: 'quiz' },
  { key: 'articles', label: 'Статьи', icon: 'article' },
  { key: 'dictionary', label: 'Словарь', icon: 'dictionary' },
  { key: 'users', label: 'Пользователи', icon: 'users' },
  { key: 'admins', label: 'Администраторы', icon: 'shield' },
  { key: 'certificates', label: 'Сертификаты', icon: 'certificate' },
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

function AdminSidebar({ collapsed, activePage, onToggle, onSelectPage, adminName, onLogout }) {
  return (
    <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="admin-sidebar-top">
        <div className="admin-brand">
          <div className="admin-brand-icon">
            <AdminIcon name="book" className="admin-icon" />
          </div>
          <strong>ENESAI</strong>
        </div>

        <button className="admin-menu-button" type="button" aria-label="Свернуть меню" onClick={onToggle}>
          <AdminIcon name="menu" className="admin-icon" />
        </button>
      </div>

      <nav className="admin-nav" aria-label="Разделы панели администратора">
        {menuItems.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`admin-nav-item ${activePage === item.key ? 'active' : ''}`}
            onClick={() => onSelectPage(item.key)}
          >
            <AdminIcon name={item.icon} className="admin-icon" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="admin-sidebar-user">
        <div className="admin-user-block">
          <div className="admin-user-avatar">{getInitials(adminName)}</div>
          <div className="admin-user-meta">
            <strong>{adminName}</strong>
            <span>Супер админ</span>
          </div>
        </div>

        <button className="admin-logout-link" type="button" onClick={onLogout}>
          <AdminIcon name="logout" className="admin-icon" />
          <span>Выйти</span>
        </button>
      </div>
    </aside>
  )
}

export default AdminSidebar
