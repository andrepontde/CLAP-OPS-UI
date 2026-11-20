import { useEffect, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PermissionGate } from '../../components/PermissionGate'
import { ApiError } from '../../lib/api'
import { hasFleetRole } from '../../lib/permissions'
import { useAuth } from '../../lib/useAuth'
import { useVehicleApi } from './vehicle.api'
import type {
  Vehicle,
  VehicleUpdateInput,
} from './vehicle.types'

const detailTabs = [
  { label: 'Overview', available: true },
  { label: 'Service history', available: false },
  { label: 'Inspections', available: false },
  { label: 'Work orders', available: false },
  { label: 'Documents', available: false },
]

function formatDate(value: string | null) {
  if (!value) {
    return 'Not provided'
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
  }).format(new Date(`${value}T00:00:00`))
}

export function VehicleDetailPage() {
  const { admin, selectedFleetId } = useAuth()
  const { vehicleId } = useParams<{ vehicleId: string }>()
  const vehicleApi = useVehicleApi()
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [editingField, setEditingField] = useState<
    keyof VehicleUpdateInput | null
  >(null)
  const [isSaving, setIsSaving] = useState(false)
  const canEdit = hasFleetRole(admin, selectedFleetId, 'MANAGER')

  useEffect(() => {
    if (!vehicleId) {
      return
    }

    let isMounted = true

    vehicleApi.get(vehicleId)
      .then((response) => {
        if (isMounted) {
          setVehicle(response)
        }
      })
      .catch((requestError) => {
        if (isMounted) {
          setError(
            requestError instanceof ApiError
              ? requestError.message
              : 'Unable to load vehicle',
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
  }, [vehicleApi, vehicleId])

  if (!vehicleId) {
    return (
      <section>
        <Link className="back-link" to="/vehicles">
          ← Vehicles
        </Link>
        <div className="empty-state" role="alert">
          Vehicle ID is missing
        </div>
      </section>
    )
  }

  if (isLoading) {
    return <p>Loading vehicle...</p>
  }

  if (error || !vehicle) {
    return (
      <section>
        <Link className="back-link" to="/vehicles">
          ← Vehicles
        </Link>
        <div className="empty-state" role="alert">
          {error || 'Vehicle not found'}
        </div>
      </section>
    )
  }

  async function saveField(
    field: keyof VehicleUpdateInput,
    value: string | number | null,
  ) {
    if (!vehicle) {
      return
    }

    setError('')
    setIsSaving(true)

    try {
      const updatedVehicle = await vehicleApi.update(vehicle.id, {
        [field]: value,
      })
      setVehicle(updatedVehicle)
      setEditingField(null)
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : 'Unable to update vehicle',
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section>
      <header className="detail-header">
        <div>
          <Link className="back-link" to="/vehicles">
            ← Vehicles
          </Link>
          <p className="eyebrow">Vehicle details</p>
          <h1>{vehicle.name}</h1>
          <p className="page-description">
            {vehicle.year} {vehicle.make} {vehicle.model} · {vehicle.license_plate}
          </p>
        </div>
        <div className="detail-header-actions">
          <span className={`status status-${vehicle.status.toLowerCase()}`}>
            {vehicle.status.replaceAll('_', ' ')}
          </span>
          <PermissionGate allowed={canEdit}>
            <Link className="secondary-button" to={`/vehicles/${vehicle.id}/edit`}>
              Edit
            </Link>
          </PermissionGate>
        </div>
      </header>

      <nav className="detail-tabs" aria-label="Vehicle sections">
        {detailTabs.map((tab) => (
          <span
            className={`detail-tab ${tab.available ? 'active' : 'disabled'}`}
            key={tab.label}
            aria-disabled={!tab.available}
          >
            {tab.label}
          </span>
        ))}
      </nav>

      {error && <p className="form-error" role="alert">{error}</p>}

      <div className="detail-grid">
        <section className="detail-card">
          <h2>Details</h2>
          <dl className="detail-list">
            <EditableDetailItem
              label="Name"
              field="name"
              value={vehicle.name}
              editingField={editingField}
              isSaving={isSaving}
              canEdit={canEdit}
              onEdit={setEditingField}
              onSave={saveField}
            />
            <EditableDetailItem
              label="Status"
              field="status"
              value={vehicle.status}
              displayValue={vehicle.status.replaceAll('_', ' ')}
              inputType="status"
              editingField={editingField}
              isSaving={isSaving}
              canEdit={canEdit}
              onEdit={setEditingField}
              onSave={saveField}
            />
            <EditableDetailItem
              label="Type"
              field="type"
              value={vehicle.type}
              editingField={editingField}
              isSaving={isSaving}
              canEdit={canEdit}
              onEdit={setEditingField}
              onSave={saveField}
            />
            <EditableDetailItem
              label="Fuel type"
              field="fuel_type"
              value={vehicle.fuel_type}
              editingField={editingField}
              isSaving={isSaving}
              canEdit={canEdit}
              onEdit={setEditingField}
              onSave={saveField}
            />
            <EditableDetailItem
              label="VIN / serial number"
              field="vin_sn"
              value={vehicle.vin_sn}
              editingField={editingField}
              isSaving={isSaving}
              canEdit={canEdit}
              onEdit={setEditingField}
              onSave={saveField}
            />
            <EditableDetailItem
              label="License plate"
              field="license_plate"
              value={vehicle.license_plate}
              editingField={editingField}
              isSaving={isSaving}
              canEdit={canEdit}
              onEdit={setEditingField}
              onSave={saveField}
            />
            <EditableDetailItem
              label="Year"
              field="year"
              value={vehicle.year}
              inputType="number"
              editingField={editingField}
              isSaving={isSaving}
              canEdit={canEdit}
              onEdit={setEditingField}
              onSave={saveField}
            />
            <EditableDetailItem
              label="Current odometer"
              field="current_odometer"
              value={vehicle.current_odometer}
              inputType="number"
              editingField={editingField}
              isSaving={isSaving}
              canEdit={canEdit}
              onEdit={setEditingField}
              onSave={saveField}
            />
          </dl>
        </section>

        <section className="detail-card">
          <h2>Documents</h2>
          <dl className="detail-list">
            <EditableDetailItem
              label="Insurance policy"
              field="insurance_policy_number"
              value={vehicle.insurance_policy_number}
              editingField={editingField}
              isSaving={isSaving}
              canEdit={canEdit}
              onEdit={setEditingField}
              onSave={saveField}
            />
            <EditableDetailItem
              label="Insurance expiration"
              field="insurance_expiration"
              value={vehicle.insurance_expiration}
              displayValue={formatDate(vehicle.insurance_expiration)}
              inputType="date"
              editingField={editingField}
              isSaving={isSaving}
              canEdit={canEdit}
              onEdit={setEditingField}
              onSave={saveField}
            />
            <EditableDetailItem
              label="Circulation card"
              field="circulation_card_number"
              value={vehicle.circulation_card_number}
              editingField={editingField}
              isSaving={isSaving}
              canEdit={canEdit}
              onEdit={setEditingField}
              onSave={saveField}
            />
            <EditableDetailItem
              label="Verification expiration"
              field="verification_expiration"
              value={vehicle.verification_expiration}
              displayValue={formatDate(vehicle.verification_expiration)}
              inputType="date"
              editingField={editingField}
              isSaving={isSaving}
              canEdit={canEdit}
              onEdit={setEditingField}
              onSave={saveField}
            />
          </dl>
        </section>
      </div>
    </section>
  )
}

interface EditableDetailItemProps {
  label: string
  field: keyof VehicleUpdateInput
  value: string | number | null
  displayValue?: string
  inputType?: 'text' | 'number' | 'date' | 'status'
  canEdit: boolean
  editingField: keyof VehicleUpdateInput | null
  isSaving: boolean
  onEdit: (field: keyof VehicleUpdateInput | null) => void
  onSave: (
    field: keyof VehicleUpdateInput,
    value: string | number | null,
  ) => Promise<void>
}

function EditableDetailItem({
  label,
  field,
  value,
  displayValue,
  inputType = 'text',
  canEdit,
  editingField,
  isSaving,
  onEdit,
  onSave,
}: EditableDetailItemProps) {
  const isEditingThisField = editingField === field
  const inputValue = value ?? ''

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const rawValue = formData.get('value')?.toString() ?? ''
    const nextValue =
      inputType === 'number'
        ? Number(rawValue)
        : rawValue || null

    await onSave(field, nextValue)
  }

  return (
    <div className="detail-item">
      <dt>{label}</dt>
      <dd>
        {isEditingThisField ? (
          <form className="inline-edit" onSubmit={handleSave}>
            {inputType === 'status' ? (
              <select name="value" defaultValue={String(inputValue)} autoFocus>
                <option value="ACTIVE">Active</option>
                <option value="IN_MAINTENANCE">In maintenance</option>
                <option value="DECOMMISSIONED">Decommissioned</option>
              </select>
            ) : (
              <input
                autoFocus
                defaultValue={String(inputValue)}
                name="value"
                type={inputType}
                required={inputType !== 'text' || value !== null}
              />
            )}
            <button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              className="inline-cancel"
              onClick={() => onEdit(null)}
              disabled={isSaving}
            >
              Cancel
            </button>
          </form>
        ) : (
          canEdit ? (
            <button
              className="detail-value-button"
              type="button"
              onClick={() => onEdit(field)}
            >
              {displayValue ?? (value === null ? 'Not provided' : String(value))}
            </button>
          ) : (
            <span>
              {displayValue ?? (value === null ? 'Not provided' : String(value))}
            </span>
          )
        )}
      </dd>
    </div>
  )
}
