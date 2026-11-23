import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError, apiRequest } from '../../lib/api'
import { useAuth } from '../../lib/useAuth'
import { useVehicleApi } from '../vehicles/vehicle.api'
import { useOperatorApi } from '../operators/operator.api'

interface EntryList<T> {
  entries: T[]
}

export function DashboardPage() {
  const { accessToken, admin, selectedFleetId } = useAuth()
  const vehicleApi = useVehicleApi()
  const operatorApi = useOperatorApi()
  const [vehicleCount, setVehicleCount] = useState<number | null>(null)
  const [operatorCount, setOperatorCount] = useState<number | null>(null)
  const [entryCount, setEntryCount] = useState<number | null>(null)

  useEffect(() => {
    if (!selectedFleetId) return

    let active = true

    vehicleApi.list()
      .then((response) => {
        if (active) setVehicleCount(response.vehicles.length)
      })
      .catch(() => {
        if (active) setVehicleCount(0)
      })

    operatorApi.list()
      .then((response) => {
        if (active) setOperatorCount(response.operators.length)
      })
      .catch(() => {
        if (active) setOperatorCount(0)
      })

    if (accessToken) {
      Promise.all([
        apiRequest<EntryList<unknown>>('/fuel-history', {
          accessToken,
          fleetId: selectedFleetId,
        }),
        apiRequest<EntryList<unknown>>('/charging-history', {
          accessToken,
          fleetId: selectedFleetId,
        }),
      ])
        .then(([fuel, charging]) => {
          if (active) setEntryCount(fuel.entries.length + charging.entries.length)
        })
        .catch((requestError) => {
          if (active) {
            setEntryCount(requestError instanceof ApiError ? 0 : null)
          }
        })
    }

    return () => {
      active = false
    }
  }, [accessToken, selectedFleetId, vehicleApi, operatorApi])

  const fleet = admin?.fleets.find((item) => item.id === selectedFleetId)

  return (
    <section className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">Fleet overview</p>
          <h1>Dashboard</h1>
          <p className="page-description">
            {fleet ? fleet.name : 'No fleet selected'}
          </p>
        </div>
        <Link className="glass-button dashboard-add-button" to="/fuel-energy/fuel/new">
          <span aria-hidden="true">+</span>
          Add fuel entry
        </Link>
      </header>

      <div className="dashboard-grid">
        <article className="dashboard-card">
          <div className="dashboard-card-heading">
            <div>
              <p className="dashboard-card-label">Fleet</p>
              <h2>Vehicles</h2>
            </div>
            <span className="dashboard-card-count">
              {vehicleCount ?? '—'}
            </span>
          </div>
          <p>Manage vehicles and their fleet assignments.</p>
          <Link className="dashboard-card-link" to="/vehicles">
            View vehicles
            <span aria-hidden="true">→</span>
          </Link>
        </article>

        <article className="dashboard-card">
          <div className="dashboard-card-heading">
            <div>
              <p className="dashboard-card-label">People</p>
              <h2>Operators</h2>
            </div>
            <span className="dashboard-card-count">
              {operatorCount ?? '—'}
            </span>
          </div>
          <p>View and manage fleet operators.</p>
          <Link className="dashboard-card-link" to="/operators">
            View operators
            <span aria-hidden="true">→</span>
          </Link>
        </article>

        <article className="dashboard-card">
          <div className="dashboard-card-heading">
            <div>
              <p className="dashboard-card-label">Account</p>
              <h2>Admin</h2>
            </div>
            <span className={`role-dot ${admin?.is_superadmin ? 'superadmin' : ''}`} />
          </div>
          {admin ? (
            <dl className="admin-summary">
              <div>
                <dt>Email</dt>
                <dd>{admin.email}</dd>
              </div>
              <div>
                <dt>Access</dt>
                <dd>{admin.is_superadmin ? 'Superadmin' : 'Fleet admin'}</dd>
              </div>
            </dl>
          ) : (
            <p>Loading admin information…</p>
          )}
        </article>

        <article className="dashboard-card">
          <div className="dashboard-card-heading">
            <div>
              <p className="dashboard-card-label">Consumption</p>
              <h2>Fuel &amp; energy</h2>
            </div>
            <span className="dashboard-card-count">
              {entryCount ?? '—'}
            </span>
          </div>
          <p>Review fuel purchases and charging entries.</p>
          <Link className="dashboard-card-link" to="/fuel-energy">
            View entries
            <span aria-hidden="true">→</span>
          </Link>
        </article>
      </div>
    </section>
  )
}
