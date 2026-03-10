import { useMemo, useState } from 'react'
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

function AdminPanelPage() {
  const { user, logout } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [activePage, setActivePage] = useState('courses')

  const adminName = useMemo(() => {
    if (!user?.email) return 'Админ'
    return user.email.split('@')[0]
  }, [user?.email])

  return (
    <main className={`admin-layout ${isCollapsed ? 'collapsed' : ''}`}>
      <AdminSidebar
        collapsed={isCollapsed}
        activePage={activePage}
        onToggle={() => setIsCollapsed((value) => !value)}
        onSelectPage={setActivePage}
        adminName={adminName}
        onLogout={logout}
      />

      <section className="admin-main">
        {activePage === 'dashboard' ? <DashboardHome /> : null}
        {activePage === 'courses' ? <CoursesPage /> : null}
        {activePage === 'lessons' ? <LessonsPage /> : null}
        {activePage === 'tests' ? <TestsPage /> : null}
        {activePage === 'articles' ? <ArticlesPage /> : null}
        {activePage === 'dictionary' ? <DictionaryPage /> : null}
        {activePage === 'users' ? <UsersPage /> : null}
        {activePage === 'admins' ? <AdminsPage /> : null}
        {activePage === 'certificates' ? <CertificatesPage /> : null}
        {![
          'dashboard',
          'courses',
          'lessons',
          'tests',
          'articles',
          'dictionary',
          'users',
          'admins',
          'certificates',
        ].includes(
          activePage,
        ) ? (
          <DashboardHome />
        ) : null}
      </section>
    </main>
  )
}

export default AdminPanelPage
