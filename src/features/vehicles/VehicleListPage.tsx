import { useEffect, useState } from 'react'
import { ApiError } from '../../lib/api'
import { useVehicleApi } from './vehicle.api'
import type { Vehicle } from './vehicle.types'

export function VehicleListPage() {
  const vehicleApi = useVehicleApi()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
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
  }, [vehicleApi])

  return (
    <section>
      <header className="page-header">
        <div>
          <p className="eyebrow">Fleet</p>
          <h1>Vehicles</h1>
        </div>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
