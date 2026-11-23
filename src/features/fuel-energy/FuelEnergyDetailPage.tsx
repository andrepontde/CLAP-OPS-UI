import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PermissionGate } from '../../components/PermissionGate'
import { ApiError } from '../../lib/api'
import { hasFleetRole } from '../../lib/permissions'
import { useAuth } from '../../lib/useAuth'
import { useVehicleApi } from '../vehicles/vehicle.api'
import type { Vehicle } from '../vehicles/vehicle.types'
import { useFuelEnergyApi } from './fuelEnergy.api'
import type { ChargingEntry, FuelEntry } from './fuelEnergy.types'

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(
    new Date(value.length === 10 ? `${value}T00:00:00` : value),
  )
}

export function FuelEnergyDetailPage() {
  const { kind, entryId } = useParams<{ kind: string; entryId: string }>()
  const { admin, selectedFleetId } = useAuth()
  const navigate = useNavigate()
  const historyApi = useFuelEnergyApi()
  const vehicleApi = useVehicleApi()
  const [fuel, setFuel] = useState<FuelEntry | null>(null)
  const [charging, setCharging] = useState<ChargingEntry | null>(null)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const canEdit = hasFleetRole(admin, selectedFleetId, 'MANAGER')

  useEffect(() => {
    if (!entryId || (kind !== 'fuel' && kind !== 'energy')) return
    let mounted = true
    Promise.all([
      kind === 'fuel' ? historyApi.getFuel(entryId) : historyApi.getCharging(entryId),
      vehicleApi.list(),
    ])
      .then(([entry, vehicleResponse]) => {
        if (!mounted) return
        if (kind === 'fuel') setFuel(entry as FuelEntry)
        else setCharging(entry as ChargingEntry)
        setVehicles(vehicleResponse.vehicles)
      })
      .catch((requestError) => {
        if (mounted) setError(requestError instanceof ApiError ? requestError.message : 'Unable to load history entry')
      })
      .finally(() => {
        if (mounted) setIsLoading(false)
      })
    return () => { mounted = false }
  }, [historyApi, entryId, kind, vehicleApi])

  async function handleDelete() {
    if (!entryId || !window.confirm('Delete this history entry?')) return
    setIsDeleting(true)
    setError('')
    try {
      if (kind === 'fuel') await historyApi.deleteFuel(entryId)
      else await historyApi.deleteCharging(entryId)
      navigate('/fuel-energy')
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : 'Unable to delete history entry')
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) return <p>Loading history entry...</p>
  if (error || (!fuel && !charging)) {
    return (
      <section>
        <Link className="back-link" to="/fuel-energy">← Fuel &amp; energy</Link>
        <div className="empty-state" role="alert">{error || 'History entry not found'}</div>
      </section>
    )
  }

  const vehicleId = kind === 'fuel' ? fuel?.vehicle_id : charging?.vehicle_id
  const vehicle = vehicles.find((item) => item.id === vehicleId)

  return (
    <section>
      <header className="detail-header">
        <div>
          <Link className="back-link" to="/fuel-energy">← Fuel &amp; energy</Link>
          <p className="eyebrow">{kind === 'fuel' ? 'Fuel entry' : 'Charging entry'}</p>
          <h1>{vehicle ? vehicle.name : 'History details'}</h1>
          <p className="page-description">
            {kind === 'fuel' && fuel ? formatDate(fuel.date) : charging ? formatDateTime(charging.charging_started_at) : ''}
          </p>
        </div>
        <PermissionGate allowed={canEdit}>
          <div className="detail-header-actions">
            <Link className="secondary-button" to={`/fuel-energy/${kind}/${entryId}/edit`}>Edit</Link>
            <button className="danger-button" type="button" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </PermissionGate>
      </header>
      {error && <p className="form-error" role="alert">{error}</p>}

      {kind === 'fuel' && fuel && (
        <div className="detail-grid">
          <section className="detail-card">
            <h2>Entry details</h2>
            <dl className="detail-list">
              <DetailItem label="Vehicle" value={vehicle ? `${vehicle.name} — ${vehicle.license_plate}` : fuel.vehicle_id} />
              <DetailItem label="Date" value={formatDate(fuel.date)} />
              <DetailItem label="Odometer" value={`${fuel.odometer.toLocaleString()}`} />
              <DetailItem label="Vendor" value={fuel.vendor || 'Not provided'} />
              <DetailItem label="Fuel type" value={fuel.fuel_type} />
              <DetailItem label="Volume" value={`${Number(fuel.volume).toLocaleString()} L`} />
              <DetailItem label="Unit price" value={Number(fuel.fuel_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} />
              <DetailItem label="Total price" value={Number(fuel.total_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} />
              <DetailItem label="Added by" value={fuel.created_by_name} />
            </dl>
          </section>
        </div>
      )}

      {kind === 'energy' && charging && (
        <div className="detail-grid">
          <section className="detail-card">
            <h2>Entry details</h2>
            <dl className="detail-list">
              <DetailItem label="Vehicle" value={vehicle ? `${vehicle.name} — ${vehicle.license_plate}` : charging.vehicle_id} />
              <DetailItem label="Charging started" value={formatDateTime(charging.charging_started_at)} />
              <DetailItem label="Charging ended" value={formatDateTime(charging.charging_ended_at)} />
              <DetailItem label="Duration" value={`${charging.charging_duration_minutes} minutes`} />
              <DetailItem label="Odometer" value={charging.odometer.toLocaleString()} />
              <DetailItem label="Vendor" value={charging.vendor || 'Not provided'} />
              <DetailItem label="Total energy" value={`${Number(charging.total_energy_kwh).toLocaleString()} kWh`} />
              <DetailItem label="Energy price" value={Number(charging.energy_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} />
              <DetailItem label="Energy cost" value={Number(charging.energy_cost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} />
              <DetailItem label="Total cost" value={Number(charging.total_cost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} />
              <DetailItem label="Added by" value={charging.created_by_name} />
            </dl>
          </section>
        </div>
      )}
    </section>
  )
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return <div className="detail-item"><dt>{label}</dt><dd>{value}</dd></div>
}
