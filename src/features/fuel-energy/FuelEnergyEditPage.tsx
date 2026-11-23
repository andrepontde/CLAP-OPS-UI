import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '../../lib/api'
import { hasFleetRole } from '../../lib/permissions'
import { useAuth } from '../../lib/useAuth'
import { useVehicleApi } from '../vehicles/vehicle.api'
import type { Vehicle } from '../vehicles/vehicle.types'
import { HistoryEntryForm } from './HistoryEntryForm'
import { useFuelEnergyApi } from './fuelEnergy.api'
import type { ChargingCreateInput, ChargingEntry, FuelCreateInput, FuelEntry } from './fuelEnergy.types'

function toLocalDateTime(value: string) {
  const date = new Date(value)
  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

export function FuelEnergyEditPage() {
  const { kind, entryId } = useParams<{ kind: string; entryId: string }>()
  const historyKind = kind === 'energy' ? 'energy' : kind === 'fuel' ? 'fuel' : null
  const { admin, selectedFleetId } = useAuth()
  const navigate = useNavigate()
  const historyApi = useFuelEnergyApi()
  const vehicleApi = useVehicleApi()
  const [fuel, setFuel] = useState<FuelEntry | null>(null)
  const [charging, setCharging] = useState<ChargingEntry | null>(null)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!entryId || !historyKind) return
    let mounted = true
    Promise.all([
      historyKind === 'fuel' ? historyApi.getFuel(entryId) : historyApi.getCharging(entryId),
      vehicleApi.list(),
    ])
      .then(([entry, vehicleResponse]) => {
        if (!mounted) return
        if (historyKind === 'fuel') setFuel(entry as FuelEntry)
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
  }, [entryId, historyApi, historyKind, vehicleApi])

  if (!historyKind) return <Navigate to="/fuel-energy" replace />
  if (!hasFleetRole(admin, selectedFleetId, 'MANAGER')) return <Navigate to={`/fuel-energy/${kind}/${entryId}`} replace />

  async function submitFuel(values: FuelCreateInput) {
    if (!entryId) return
    setError('')
    setIsSubmitting(true)
    try {
      await historyApi.updateFuel(entryId, values)
      navigate(`/fuel-energy/fuel/${entryId}`)
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : 'Unable to update fuel entry')
    } finally { setIsSubmitting(false) }
  }

  async function submitCharging(values: ChargingCreateInput) {
    if (!entryId) return
    setError('')
    setIsSubmitting(true)
    try {
      await historyApi.updateCharging(entryId, values)
      navigate(`/fuel-energy/energy/${entryId}`)
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : 'Unable to update charging entry')
    } finally { setIsSubmitting(false) }
  }

  if (isLoading) return <p>Loading history entry...</p>
  if (error && (!fuel && !charging)) {
    return (
      <section>
        <Link className="back-link" to="/fuel-energy">← Fuel &amp; energy</Link>
        <div className="empty-state" role="alert">{error}</div>
      </section>
    )
  }

  const fuelInitial: FuelCreateInput | undefined = fuel ? {
    vehicle_id: fuel.vehicle_id,
    date: fuel.date,
    odometer: fuel.odometer,
    vendor: fuel.vendor,
    fuel_type: fuel.fuel_type,
    volume: Number(fuel.volume),
    total_price: Number(fuel.total_price),
  } : undefined

  const chargingInitial: ChargingCreateInput | undefined = charging ? {
    vehicle_id: charging.vehicle_id,
    vendor: charging.vendor,
    charging_started_at: toLocalDateTime(charging.charging_started_at),
    charging_ended_at: toLocalDateTime(charging.charging_ended_at),
    odometer: charging.odometer,
    total_energy_kwh: Number(charging.total_energy_kwh),
    energy_price: Number(charging.energy_price),
  } : undefined

  return (
    <section>
      <header className="page-header"><div>
        <Link className="back-link" to={`/fuel-energy/${kind}/${entryId}`}>← Entry details</Link>
        <p className="eyebrow">Fleet management</p>
        <h1>{historyKind === 'fuel' ? 'Edit fuel entry' : 'Edit energy entry'}</h1>
      </div></header>
      <HistoryEntryForm
        kind={historyKind}
        vehicles={vehicles}
        fuelInitial={fuelInitial}
        chargingInitial={chargingInitial}
        submitLabel="Save changes"
        isSubmitting={isSubmitting}
        error={error}
        cancelTo={`/fuel-energy/${kind}/${entryId}`}
        onFuelSubmit={submitFuel}
        onChargingSubmit={submitCharging}
      />
    </section>
  )
}
