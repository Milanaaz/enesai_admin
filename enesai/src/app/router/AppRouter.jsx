import { BrowserRouter as Router, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { useAuth } from '../../features/auth/context/useAuth.js'
import AdminLayout from '../layouts/AdminLayout.jsx'
import LoginPage from '../../pages/login/LoginPage.jsx'
import DashboardPage from '../../pages/dashboard/AdminDashboardPage.jsx'
import CoursesPage from '../../pages/courses/CoursesPage.jsx'
import TestsPage from '../../pages/tests/TestsPage.jsx'
import ArticlesPage from '../../pages/articles/ArticlesPage.jsx'
import LessonsPage from '../../pages/lessons/LessonsPage.jsx'
import DictionaryPage from '../../pages/dictionary/DictionaryPage.jsx'
import UsersPage from '../../pages/users/UsersPage.jsx'
import AdminsPage from '../../pages/admins/AdminsPage.jsx'
import CertificatesPage from '../../pages/certificates/CertificatesPage.jsx'
import { ADMIN_ROUTES } from './adminNavigation.js'

function RequireAuth() {
  const { isAuthenticated } = useAuth()

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

function PublicOnlyRoute() {
  const { isAuthenticated } = useAuth()

  return isAuthenticated ? <Navigate to={ADMIN_ROUTES.courses} replace /> : <Outlet />
}

function AppRouter() {
  const { isHydrating } = useAuth()

  if (isHydrating) {
    return <div className="app-loading">Загрузка...</div>
  }

  return (
    <Router basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        <Route element={<RequireAuth />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Navigate to={ADMIN_ROUTES.courses} replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="courses" element={<CoursesPage />} />
            <Route path="lessons" element={<LessonsPage />} />
            <Route path="tests" element={<TestsPage />} />
            <Route path="library" element={<ArticlesPage />} />
            <Route path="dictionary" element={<DictionaryPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="admins" element={<AdminsPage />} />
            <Route path="certificates" element={<CertificatesPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to={ADMIN_ROUTES.courses} replace />} />
      </Routes>
    </Router>
  )
}

export default AppRouter
