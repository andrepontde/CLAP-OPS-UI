import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/useAuth'

export function AppLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <NavLink className="brand" to="/dashboard">
          CLAP-OPS
        </NavLink>

        <nav aria-label="Primary navigation">
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/vehicles">Vehicles</NavLink>
        </nav>

        <button className="logout-button" type="button" onClick={handleLogout}>
          Sign out
        </button>
      </aside>

      <main className="page-content">
        <Outlet />
      </main>
    </div>
  )
}
