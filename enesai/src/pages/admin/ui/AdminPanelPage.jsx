import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../../features/auth/context/AuthProvider.jsx'
import AdminSidebar from './components/AdminSidebar.jsx'
import DashboardHome from '../../dashboard/ui/components/DashboardHome.jsx'
import CoursesPage from '../../courses/ui/CoursesPage.jsx'
import TestsPage from '../../tests/ui/TestsPage.jsx'
import ArticlesPage from '../../articles/ui/ArticlesPage.jsx'
import LessonsPage from '../../lessons/ui/LessonsPage.jsx'
import DictionaryPage from '../../dictionary/ui/DictionaryPage.jsx'
import UsersPage from '../../users/ui/UsersPage.jsx'
import AdminsPage from '../../admins/ui/AdminsPage.jsx'
import CertificatesPage from '../../certificates/ui/CertificatesPage.jsx'
import './admin-panel-page.css'

const SUPER_ADMIN_MENU = [
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

const CONTENT_ADMIN_MENU = [
  { key: 'dashboard', label: 'Дашборд', icon: 'dashboard' },
  { key: 'courses', label: 'Курсы', icon: 'book' },
  { key: 'lessons', label: 'Уроки', icon: 'cap' },
  { key: 'tests', label: 'Тесты', icon: 'quiz' },
  { key: 'dictionary', label: 'Словарь', icon: 'dictionary' },
]

function AdminPanelPage() {
  const { user, logout } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [activePage, setActivePage] = useState('courses')
  const userRoleCode = useMemo(
    () => (typeof user?.role === 'string' ? user.role.trim().toUpperCase() : ''),
    [user?.role],
  )

  const allowedMenuItems = useMemo(() => {
    if (userRoleCode === 'CONTENT_ADMIN') return CONTENT_ADMIN_MENU
    return SUPER_ADMIN_MENU
  }, [userRoleCode])

  const allowedPageKeys = useMemo(
    () => new Set(allowedMenuItems.map((item) => item.key)),
    [allowedMenuItems],
  )

  useEffect(() => {
    if (!allowedPageKeys.has(activePage)) {
      const fallbackPage = allowedMenuItems[0]?.key ?? 'dashboard'
      setActivePage(fallbackPage)
    }
  }, [activePage, allowedMenuItems, allowedPageKeys])

  const adminName = useMemo(() => {
    if (!user?.email) return 'Админ'
    return user.email.split('@')[0]
  }, [user?.email])

  const adminRoleLabel = useMemo(() => {
    if (userRoleCode === 'SUPER_ADMIN') return 'Супер админ'
    if (userRoleCode === 'CONTENT_ADMIN') return 'Контент-админ'
    if (userRoleCode === 'ADMIN') return 'Админ'
    if (userRoleCode === 'USER') return 'Пользователь'
    return 'Без роли'
  }, [userRoleCode])

  const canManageUsers = userRoleCode === 'SUPER_ADMIN'

  const safeOpenUsersPage = () => {
    if (canManageUsers) {
      setActivePage('users')
    }
  }

  return (
    <main className={`admin-layout ${isCollapsed ? 'collapsed' : ''}`}>
      <AdminSidebar
        collapsed={isCollapsed}
        activePage={activePage}
        onToggle={() => setIsCollapsed((value) => !value)}
        onSelectPage={setActivePage}
        adminName={adminName}
        adminRoleLabel={adminRoleLabel}
        onLogout={logout}
        menuItems={allowedMenuItems}
      />

      <section className="admin-main">
        {activePage === 'dashboard' && allowedPageKeys.has('dashboard') ? (
          <DashboardHome onOpenUsersPage={safeOpenUsersPage} />
        ) : null}
        {activePage === 'courses' && allowedPageKeys.has('courses') ? <CoursesPage /> : null}
        {activePage === 'lessons' && allowedPageKeys.has('lessons') ? <LessonsPage /> : null}
        {activePage === 'tests' && allowedPageKeys.has('tests') ? <TestsPage /> : null}
        {activePage === 'articles' && allowedPageKeys.has('articles') ? <ArticlesPage /> : null}
        {activePage === 'dictionary' && allowedPageKeys.has('dictionary') ? <DictionaryPage /> : null}
        {activePage === 'users' && allowedPageKeys.has('users') ? <UsersPage /> : null}
        {activePage === 'admins' && allowedPageKeys.has('admins') ? <AdminsPage /> : null}
        {activePage === 'certificates' && allowedPageKeys.has('certificates') ? <CertificatesPage /> : null}
        {!allowedPageKeys.has(activePage) ? <DashboardHome onOpenUsersPage={safeOpenUsersPage} /> : null}
      </section>
    </main>
  )
}

export default AdminPanelPage

