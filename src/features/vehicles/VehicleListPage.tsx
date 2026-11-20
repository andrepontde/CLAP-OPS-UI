import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PermissionGate } from '../../components/PermissionGate'
import { ApiError } from '../../lib/api'
import { hasFleetRole } from '../../lib/permissions'
import { useAuth } from '../../lib/useAuth'
import { useVehicleApi } from './vehicle.api'
import type { Vehicle } from './vehicle.types'

export function VehicleListPage() {
  const { admin, selectedFleetId } = useAuth()
  const vehicleApi = useVehicleApi()
  const canCreateVehicle = hasFleetRole(admin, selectedFleetId, 'MANAGER')
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!selectedFleetId) {
      return
    }

    let isMounted = true

    vehicleApi.list()
      .then((response) => {
        if (isMounted) {
          setVehicles(response.vehicles)
        }
      })
      .catch((requestError) => {
        if (isMounted) {
          setError(
            requestError instanceof ApiError
              ? requestError.message
              : 'Unable to load vehicles',
          )
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [selectedFleetId, vehicleApi])

  if (!selectedFleetId) {
    return (
      <section>
        <header className="page-header">
          <div>
            <p className="eyebrow">Fleet management</p>
            <h1>Vehicles</h1>
            <p className="page-description">
              Manage the vehicles assigned to your selected fleet.
            </p>
          </div>
        </header>
        <div className="empty-state">
          You do not have access to a fleet yet.
        </div>
      </section>
    )
  }

  return (
    <section>
      <header className="page-header">
        <div>
          <p className="eyebrow">Fleet management</p>
          <h1>Vehicles</h1>
          <p className="page-description">
            Manage the vehicles assigned to your selected fleet.
          </p>
        </div>
        <PermissionGate allowed={canCreateVehicle}>
          <Link className="glass-button" to="/vehicles/new">
            <span aria-hidden="true">+</span>
            Add vehicle
          </Link>
        </PermissionGate>
      </header>

      {isLoading && <p>Loading vehicles...</p>}
      {error && <p className="form-error" role="alert">{error}</p>}

      {!isLoading && !error && vehicles.length === 0 && (
        <div className="empty-state">No vehicles have been added yet.</div>
      )}

      {vehicles.length > 0 && (
        <div className="table-shell">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Make and model</th>
                <th>License plate</th>
                <th>Status</th>
                <th>Odometer</th>
                <th><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle) => (
                <tr key={vehicle.id}>
                  <td>{vehicle.name}</td>
                  <td>{vehicle.year} {vehicle.make} {vehicle.model}</td>
                  <td>{vehicle.license_plate}</td>
                  <td>
                    <span className={`status status-${vehicle.status.toLowerCase()}`}>
                      {vehicle.status.replaceAll('_', ' ')}
                    </span>
                  </td>
                  <td>{vehicle.current_odometer.toLocaleString()}</td>
                  <td>
                    <Link
                      className="table-action"
                      to={`/vehicles/${vehicle.id}`}
                    >
                      View details
                    </Link>
                    <PermissionGate
                      allowed={hasFleetRole(
                        admin,
                        selectedFleetId,
                        'MANAGER',
                      )}
                    >
                      <Link
                        className="table-action table-action-secondary"
                        to={`/vehicles/${vehicle.id}/edit`}
                      >
                        Edit
                      </Link>
                    </PermissionGate>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
