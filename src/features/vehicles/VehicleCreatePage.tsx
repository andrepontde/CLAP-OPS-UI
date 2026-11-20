import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ApiError } from '../../lib/api'
import { hasFleetRole } from '../../lib/permissions'
import { useAuth } from '../../lib/useAuth'
import { useVehicleApi } from './vehicle.api'
import { VehicleForm } from './VehicleForm'
import type { VehicleCreateInput } from './vehicle.types'

const initialForm: VehicleCreateInput = {
  name: '',
  status: 'ACTIVE',
  type: '',
  fuel_type: '',
  vin_sn: '',
  license_plate: '',
  year: new Date().getFullYear(),
  make: '',
  model: '',
  current_odometer: 0,
  insurance_policy_number: null,
  insurance_expiration: null,
  circulation_card_number: null,
  verification_expiration: null,
}

export function VehicleCreatePage() {
  const { admin, selectedFleetId } = useAuth()
  const navigate = useNavigate()
  const vehicleApi = useVehicleApi()
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!hasFleetRole(admin, selectedFleetId, 'MANAGER')) {
    return <Navigate to="/vehicles" replace />
  }

  async function handleSubmit(values: VehicleCreateInput) {
    setError('')
    setIsSubmitting(true)

    try {
      await vehicleApi.create(values)
      navigate('/vehicles')
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : 'Unable to create vehicle',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section>
      <header className="page-header">
        <div>
          <Link className="back-link" to="/vehicles">
            ← Vehicles
          </Link>
          <p className="eyebrow">Fleet management</p>
          <h1>Add vehicle</h1>
          <p className="page-description">
            Add a vehicle to the currently selected fleet.
          </p>
        </div>
      </header>
      <VehicleForm
        initialValues={initialForm}
        submitLabel="Save vehicle"
        isSubmitting={isSubmitting}
        error={error}
        onSubmit={handleSubmit}
        cancelTo="/vehicles"
      />
    </section>
  )
}
