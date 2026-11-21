import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/useAuth'

export function AppLayout() {
  const { admin, logout, selectedFleetId, selectFleet } = useAuth()
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
          <NavLink to="/operators">Operators</NavLink>
          <NavLink to="/vehicles">Vehicles</NavLink>
        </nav>

        {admin && admin.fleets.length > 0 && (
          <label className="fleet-selector">
            <span>Current fleet</span>
            <select
              value={selectedFleetId ?? ''}
              onChange={(event) => selectFleet(event.target.value)}
            >
              {admin.fleets.map((fleet) => (
                <option key={fleet.id} value={fleet.id}>
                  {fleet.name}
                </option>
              ))}
            </select>
          </label>
        )}

        {admin?.is_superadmin && <p className="admin-badge">Superadmin</p>}
        {admin && <p className="admin-name">{admin.name}</p>}

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
