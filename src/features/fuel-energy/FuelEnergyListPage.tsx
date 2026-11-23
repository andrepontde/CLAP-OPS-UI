import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PermissionGate } from '../../components/PermissionGate'
import { ApiError } from '../../lib/api'
import { hasFleetRole } from '../../lib/permissions'
import { useAuth } from '../../lib/useAuth'
import { useVehicleApi } from '../vehicles/vehicle.api'
import type { Vehicle } from '../vehicles/vehicle.types'
import { useFuelEnergyApi } from './fuelEnergy.api'
import type { ChargingEntry, FuelEntry, HistoryKind } from './fuelEnergy.types'

export function FuelEnergyListPage() {
  const { admin, selectedFleetId } = useAuth()
  const historyApi = useFuelEnergyApi()
  const vehicleApi = useVehicleApi()
  const [kind, setKind] = useState<HistoryKind>('fuel')
  const [fuelEntries, setFuelEntries] = useState<FuelEntry[]>([])
  const [chargingEntries, setChargingEntries] = useState<ChargingEntry[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const canCreate = hasFleetRole(admin, selectedFleetId, 'MEMBER')
  const canEdit = hasFleetRole(admin, selectedFleetId, 'MANAGER')

  useEffect(() => {
    if (!selectedFleetId) return
    let mounted = true
    Promise.all([historyApi.listFuel(), historyApi.listCharging(), vehicleApi.list()])
      .then(([fuel, charging, vehicleResponse]) => {
        if (!mounted) return
        setFuelEntries(fuel.entries)
        setChargingEntries(charging.entries)
        setVehicles(vehicleResponse.vehicles)
      })
      .catch((requestError) => {
        if (mounted) {
          setError(requestError instanceof ApiError ? requestError.message : 'Unable to load fuel and energy history')
        }
      })
      .finally(() => {
        if (mounted) setIsLoading(false)
      })
    return () => { mounted = false }
  }, [historyApi, selectedFleetId, vehicleApi])

  const vehicleName = (vehicleId: string) => {
    const vehicle = vehicles.find((item) => item.id === vehicleId)
    return vehicle ? `${vehicle.name} (${vehicle.license_plate})` : 'Unknown vehicle'
  }
  const formatDate = (value: string) => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value.length === 10 ? `${value}T00:00:00` : value))
  const formatMoney = (value: string) => Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })

  if (!selectedFleetId) {
    return (
      <section>
        <header className="page-header"><div><p className="eyebrow">Fleet management</p><h1>Fuel &amp; energy</h1></div></header>
        <div className="empty-state">You do not have access to a fleet yet.</div>
      </section>
    )
  }

  return (
    <section>
      <header className="page-header">
        <div>
          <p className="eyebrow">Fleet management</p>
          <h1>Fuel &amp; energy</h1>
          <p className="page-description">Review fueling and charging history for this fleet.</p>
        </div>
        <PermissionGate allowed={canCreate}>
          <Link className="glass-button" to={`/fuel-energy/${kind}/new`}>
            <span aria-hidden="true">+</span>
            Add {kind === 'fuel' ? 'fuel entry' : 'energy entry'}
          </Link>
        </PermissionGate>
      </header>

      <nav className="detail-tabs" aria-label="Fuel and energy history">
        <button className={`dashboard-tab ${kind === 'fuel' ? 'active' : ''}`} type="button" onClick={() => setKind('fuel')}>Fuel</button>
        <button className={`dashboard-tab ${kind === 'energy' ? 'active' : ''}`} type="button" onClick={() => setKind('energy')}>Energy</button>
      </nav>

      {isLoading && <p>Loading history...</p>}
      {error && <p className="form-error" role="alert">{error}</p>}

      {!isLoading && !error && kind === 'fuel' && (
        fuelEntries.length === 0 ? <div className="empty-state">No fuel history entries have been added yet.</div> :
        <div className="table-shell"><table><thead><tr><th>Date</th><th>Vehicle</th><th>Vendor</th><th>Fuel</th><th>Volume</th><th>Unit price</th><th>Total</th><th>Odometer</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>
          {fuelEntries.map((entry) => <tr key={entry.id}>
            <td>{formatDate(entry.date)}</td><td>{vehicleName(entry.vehicle_id)}</td><td>{entry.vendor || 'Not provided'}</td><td>{entry.fuel_type}</td>
            <td>{Number(entry.volume).toLocaleString()} L</td><td>{formatMoney(entry.fuel_price)}</td><td>{formatMoney(entry.total_price)}</td><td>{entry.odometer.toLocaleString()}</td>
            <td><Link className="table-action" to={`/fuel-energy/fuel/${entry.id}`}>View details</Link>{canEdit && <Link className="table-action table-action-secondary" to={`/fuel-energy/fuel/${entry.id}/edit`}>Edit</Link>}</td>
          </tr>)}
        </tbody></table></div>
      )}

      {!isLoading && !error && kind === 'energy' && (
        chargingEntries.length === 0 ? <div className="empty-state">No charging history entries have been added yet.</div> :
        <div className="table-shell"><table><thead><tr><th>Started</th><th>Vehicle</th><th>Vendor</th><th>Energy</th><th>Duration</th><th>Energy price</th><th>Total cost</th><th>Odometer</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>
          {chargingEntries.map((entry) => <tr key={entry.id}>
            <td>{formatDate(entry.charging_started_at)}</td><td>{vehicleName(entry.vehicle_id)}</td><td>{entry.vendor || 'Not provided'}</td>
            <td>{Number(entry.total_energy_kwh).toLocaleString()} kWh</td><td>{entry.charging_duration_minutes} min</td><td>{formatMoney(entry.energy_price)}</td><td>{formatMoney(entry.total_cost)}</td><td>{entry.odometer.toLocaleString()}</td>
            <td><Link className="table-action" to={`/fuel-energy/energy/${entry.id}`}>View details</Link>{canEdit && <Link className="table-action table-action-secondary" to={`/fuel-energy/energy/${entry.id}/edit`}>Edit</Link>}</td>
          </tr>)}
        </tbody></table></div>
      )}
    </section>
  )
}
