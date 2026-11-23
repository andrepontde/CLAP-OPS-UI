import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import type { Vehicle } from '../vehicles/vehicle.types'
import type {
  ChargingCreateInput,
  FuelCreateInput,
  HistoryKind,
} from './fuelEnergy.types'

interface HistoryEntryFormProps {
  kind: HistoryKind
  vehicles: Vehicle[]
  fuelInitial?: FuelCreateInput
  chargingInitial?: ChargingCreateInput
  submitLabel: string
  isSubmitting: boolean
  error: string
  cancelTo: string
  onFuelSubmit?: (values: FuelCreateInput) => Promise<void>
  onChargingSubmit?: (values: ChargingCreateInput) => Promise<void>
}

export function HistoryEntryForm({
  kind,
  vehicles,
  fuelInitial,
  chargingInitial,
  submitLabel,
  isSubmitting,
  error,
  cancelTo,
  onFuelSubmit,
  onChargingSubmit,
}: HistoryEntryFormProps) {
  const [fuel, setFuel] = useState<FuelCreateInput>(fuelInitial ?? {
    vehicle_id: '',
    date: '',
    odometer: 0,
    vendor: '',
    fuel_type: '',
    volume: 0,
    total_price: 0,
  })
  const [charging, setCharging] = useState<ChargingCreateInput>(chargingInitial ?? {
    vehicle_id: '',
    vendor: '',
    charging_started_at: '',
    charging_ended_at: '',
    odometer: 0,
    total_energy_kwh: 0,
    energy_price: 0,
  })

  const eligibleVehicles = vehicles.filter((vehicle) =>
    kind === 'fuel'
      ? vehicle.propulsion_type !== 'ELECTRIC'
      : vehicle.propulsion_type === 'ELECTRIC' || vehicle.propulsion_type === 'HYBRID',
  )

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (kind === 'fuel') {
      await onFuelSubmit?.(fuel)
    } else {
      await onChargingSubmit?.({
        ...charging,
        charging_started_at: new Date(charging.charging_started_at).toISOString(),
        charging_ended_at: new Date(charging.charging_ended_at).toISOString(),
      })
    }
  }

  return (
    <form className="history-form" onSubmit={handleSubmit}>
      <div className="form-section">
        <h2>{kind === 'fuel' ? 'Fuel information' : 'Charging information'}</h2>
        {eligibleVehicles.length === 0 && (
          <p className="form-error">No eligible vehicles are available in this fleet.</p>
        )}
        <div className="form-grid">
          <label>
            Vehicle
            <select
              value={kind === 'fuel' ? fuel.vehicle_id : charging.vehicle_id}
              onChange={(event) => kind === 'fuel'
                ? setFuel({ ...fuel, vehicle_id: event.target.value })
                : setCharging({ ...charging, vehicle_id: event.target.value })}
              required
            >
              <option value="">Select a vehicle</option>
              {eligibleVehicles.map((vehicle) => (
                <option value={vehicle.id} key={vehicle.id}>
                  {vehicle.name} — {vehicle.license_plate}
                </option>
              ))}
            </select>
          </label>

          {kind === 'fuel' ? (
            <>
              <label>Date<input type="date" value={fuel.date} onChange={(event) => setFuel({ ...fuel, date: event.target.value })} required /></label>
              <label>Odometer<input type="number" min="0" value={fuel.odometer} onChange={(event) => setFuel({ ...fuel, odometer: Number(event.target.value) })} required /></label>
              <label>Vendor<input value={fuel.vendor} maxLength={100} onChange={(event) => setFuel({ ...fuel, vendor: event.target.value })} /></label>
              <label>Fuel type<input value={fuel.fuel_type} maxLength={50} onChange={(event) => setFuel({ ...fuel, fuel_type: event.target.value })} required /></label>
              <label>Volume (litres)<input type="number" min="0.001" step="0.001" value={fuel.volume} onChange={(event) => setFuel({ ...fuel, volume: Number(event.target.value) })} required /></label>
              <label>Total price<input type="number" min="0" step="0.01" value={fuel.total_price} onChange={(event) => setFuel({ ...fuel, total_price: Number(event.target.value) })} required /></label>
            </>
          ) : (
            <>
              <label>Charging started<input type="datetime-local" value={charging.charging_started_at} onChange={(event) => setCharging({ ...charging, charging_started_at: event.target.value })} required /></label>
              <label>Charging ended<input type="datetime-local" value={charging.charging_ended_at} onChange={(event) => setCharging({ ...charging, charging_ended_at: event.target.value })} required /></label>
              <label>Odometer<input type="number" min="0" value={charging.odometer} onChange={(event) => setCharging({ ...charging, odometer: Number(event.target.value) })} required /></label>
              <label>Vendor<input value={charging.vendor} maxLength={100} onChange={(event) => setCharging({ ...charging, vendor: event.target.value })} /></label>
              <label>Total energy (kWh)<input type="number" min="0.001" step="0.001" value={charging.total_energy_kwh} onChange={(event) => setCharging({ ...charging, total_energy_kwh: Number(event.target.value) })} required /></label>
              <label>Energy price (per kWh)<input type="number" min="0" step="0.0001" value={charging.energy_price} onChange={(event) => setCharging({ ...charging, energy_price: Number(event.target.value) })} required /></label>
            </>
          )}
        </div>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="form-actions">
        <Link className="secondary-button" to={cancelTo}>Cancel</Link>
        <button className="glass-button" type="submit" disabled={isSubmitting || eligibleVehicles.length === 0}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
