import { useEffect, useMemo, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  ADMIN_PAGE_KEYS,
  getAdminKeyByPath,
  getAdminMenuByRole,
  getAdminRoleLabel,
  getAdminRouteByKey,
} from '../router/adminNavigation.js'
import { useAuth } from '../../features/auth/context/useAuth.js'
import AdminSidebar from '../../widgets/sidebar/ui/AdminSidebar.jsx'
import './admin-layout.css'

function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const userRoleCode = typeof user?.role === 'string' ? user.role.trim().toUpperCase() : ''

  const allowedMenuItems = useMemo(() => getAdminMenuByRole(userRoleCode), [userRoleCode])

  const allowedPageKeys = useMemo(
    () => new Set(allowedMenuItems.map((item) => item.key)),
    [allowedMenuItems],
  )

  const currentPage = getAdminKeyByPath(location.pathname)
  const safeActivePage = allowedPageKeys.has(currentPage)
    ? currentPage
    : allowedMenuItems[0]?.key ?? ADMIN_PAGE_KEYS.dashboard

  const adminName = user?.email ? user.email.split('@')[0] : 'Админ'
  const adminRoleLabel = useMemo(() => getAdminRoleLabel(userRoleCode), [userRoleCode])

  const handleSelectPage = (pageKey) => {
    if (!allowedPageKeys.has(pageKey)) return
    navigate(getAdminRouteByKey(pageKey))
  }

  useEffect(() => {
    if (allowedPageKeys.size === 0 || allowedPageKeys.has(currentPage)) return

    const fallbackPage = allowedMenuItems[0]?.key ?? ADMIN_PAGE_KEYS.dashboard
    navigate(getAdminRouteByKey(fallbackPage), { replace: true })
  }, [allowedMenuItems, allowedPageKeys, currentPage, navigate])

  const openUsersPage = () => handleSelectPage(ADMIN_PAGE_KEYS.users)
  const openCoursesPage = () => handleSelectPage(ADMIN_PAGE_KEYS.courses)

  return (
    <main className={`admin-layout ${isCollapsed ? 'collapsed' : ''}`}>
      <AdminSidebar
        collapsed={isCollapsed}
        activePage={safeActivePage}
        onToggle={() => setIsCollapsed((value) => !value)}
        onSelectPage={handleSelectPage}
        adminName={adminName}
        adminRoleLabel={adminRoleLabel}
        onLogout={logout}
        menuItems={allowedMenuItems}
      />

      <section className="admin-main">
        <Outlet context={{ openUsersPage, openCoursesPage }} />
      </section>
    </main>
  )
}

export default AdminLayout
