import { useOutletContext } from 'react-router-dom'
import DashboardStats from '../../widgets/dashboard-stats/ui/DashboardStats.jsx'
import './admin-dashboard-page.css'

function AdminDashboardPage() {
  const { openUsersPage, openCoursesPage } = useOutletContext()

  return <DashboardStats onOpenUsersPage={openUsersPage} onOpenCoursesPage={openCoursesPage} />
}

export default AdminDashboardPage
