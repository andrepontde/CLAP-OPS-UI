import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import type {
  VehicleCreateInput,
  VehiclePropulsionType,
  VehicleStatus,
} from './vehicle.types'

interface VehicleFormProps {
  initialValues: VehicleCreateInput
  submitLabel: string
  isSubmitting: boolean
  error: string
  onSubmit: (values: VehicleCreateInput) => Promise<void>
  cancelTo: string
}

export function VehicleForm({
  initialValues,
  submitLabel,
  isSubmitting,
  error,
  onSubmit,
  cancelTo,
}: VehicleFormProps) {
  const [form, setForm] = useState(initialValues)

  function updateField(
    field: keyof VehicleCreateInput,
    value: string | number | null,
  ) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSubmit(form)
  }

  return (
    <form className="vehicle-form" onSubmit={handleSubmit}>
      <div className="form-section">
        <h2>Vehicle details</h2>
        <div className="form-grid">
          <label>
            Name
            <input
              value={form.name}
              maxLength={100}
              onChange={(event) => updateField('name', event.target.value)}
              required
            />
          </label>
          <label>
            Status
            <select
              value={form.status}
              onChange={(event) =>
                updateField('status', event.target.value as VehicleStatus)
              }
            >
              <option value="ACTIVE">Active</option>
              <option value="IN_MAINTENANCE">In maintenance</option>
              <option value="DECOMMISSIONED">Decommissioned</option>
            </select>
          </label>
          <label>
            Type
            <input
              value={form.type}
              maxLength={50}
              onChange={(event) => updateField('type', event.target.value)}
              required
            />
          </label>
          <label>
            Propulsion type
            <select
              value={form.propulsion_type}
              onChange={(event) => {
                const propulsionType =
                  event.target.value as VehiclePropulsionType
                setForm((current) => ({
                  ...current,
                  propulsion_type: propulsionType,
                  fuel_type:
                    propulsionType === 'ELECTRIC' ? null : current.fuel_type,
                }))
              }}
            >
              <option value="FUEL">Fuel</option>
              <option value="ELECTRIC">Electric</option>
              <option value="HYBRID">Hybrid</option>
            </select>
          </label>
          {form.propulsion_type !== 'ELECTRIC' && (
          <label>
            Fuel type
            <input
              value={form.fuel_type ?? ''}
              maxLength={50}
              onChange={(event) => updateField('fuel_type', event.target.value)}
              required
            />
          </label>
          )}
          <label>
            Make
            <input
              value={form.make}
              maxLength={50}
              onChange={(event) => updateField('make', event.target.value)}
              required
            />
          </label>
          <label>
            Model
            <input
              value={form.model}
              maxLength={50}
              onChange={(event) => updateField('model', event.target.value)}
              required
            />
          </label>
          <label>
            Year
            <input
              type="number"
              min="1886"
              max="2100"
              value={form.year}
              onChange={(event) => updateField('year', Number(event.target.value))}
              required
            />
          </label>
          <label>
            Current odometer
            <input
              type="number"
              min="0"
              value={form.current_odometer}
              onChange={(event) =>
                updateField('current_odometer', Number(event.target.value))
              }
              required
            />
          </label>
          <label>
            VIN / serial number
            <input
              value={form.vin_sn}
              maxLength={100}
              onChange={(event) => updateField('vin_sn', event.target.value)}
              required
            />
          </label>
          <label>
            License plate
            <input
              value={form.license_plate}
              maxLength={20}
              onChange={(event) => updateField('license_plate', event.target.value)}
              required
            />
          </label>
        </div>
      </div>

      <div className="form-section">
        <h2>Documents</h2>
        <div className="form-grid">
          <label>
            Insurance policy number
            <input
              value={form.insurance_policy_number ?? ''}
              maxLength={100}
              onChange={(event) =>
                updateField('insurance_policy_number', event.target.value || null)
              }
            />
          </label>
          <label>
            Insurance expiration
            <input
              type="date"
              value={form.insurance_expiration ?? ''}
              onChange={(event) =>
                updateField('insurance_expiration', event.target.value || null)
              }
            />
          </label>
          <label>
            Circulation card number
            <input
              value={form.circulation_card_number ?? ''}
              maxLength={100}
              onChange={(event) =>
                updateField('circulation_card_number', event.target.value || null)
              }
            />
          </label>
          <label>
            Verification expiration
            <input
              type="date"
              value={form.verification_expiration ?? ''}
              onChange={(event) =>
                updateField('verification_expiration', event.target.value || null)
              }
            />
          </label>
        </div>
      </div>

      {error && <p className="form-error" role="alert">{error}</p>}

      <div className="form-actions">
        <Link className="secondary-button" to={cancelTo}>
          Cancel
        </Link>
        <button className="glass-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
