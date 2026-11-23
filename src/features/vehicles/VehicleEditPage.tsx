import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '../../lib/api'
import { hasFleetRole } from '../../lib/permissions'
import { useAuth } from '../../lib/useAuth'
import { useVehicleApi } from './vehicle.api'
import { VehicleForm } from './VehicleForm'
import type { Vehicle, VehicleCreateInput } from './vehicle.types'

function toFormValues(vehicle: Vehicle): VehicleCreateInput {
  return {
    name: vehicle.name,
    status: vehicle.status,
    type: vehicle.type,
    propulsion_type: vehicle.propulsion_type,
    fuel_type: vehicle.fuel_type,
    vin_sn: vehicle.vin_sn,
    license_plate: vehicle.license_plate,
    year: vehicle.year,
    make: vehicle.make,
    model: vehicle.model,
    current_odometer: vehicle.current_odometer,
    insurance_policy_number: vehicle.insurance_policy_number,
    insurance_expiration: vehicle.insurance_expiration,
    circulation_card_number: vehicle.circulation_card_number,
    verification_expiration: vehicle.verification_expiration,
  }
}

export function VehicleEditPage() {
  const { admin, selectedFleetId } = useAuth()
  const { vehicleId } = useParams<{ vehicleId: string }>()
  const navigate = useNavigate()
  const vehicleApi = useVehicleApi()
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  if (!hasFleetRole(admin, selectedFleetId, 'MANAGER')) {
    return <Navigate to="/vehicles" replace />
  }

  if (!vehicleId || isLoading) {
    return <p>Loading vehicle...</p>
  }

  if (!vehicle) {
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

  const loadedVehicle = vehicle

  async function handleSubmit(values: VehicleCreateInput) {
    setError('')
    setIsSubmitting(true)

    try {
      await vehicleApi.update(loadedVehicle.id, values)
      navigate(`/vehicles/${loadedVehicle.id}`)
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : 'Unable to update vehicle',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section>
      <header className="page-header">
        <div>
          <Link className="back-link" to={`/vehicles/${loadedVehicle.id}`}>
            ← Vehicle details
          </Link>
          <p className="eyebrow">Fleet management</p>
          <h1>Edit {loadedVehicle.name}</h1>
          <p className="page-description">
            Update the vehicle information in one form.
          </p>
        </div>
      </header>
      <VehicleForm
        initialValues={toFormValues(loadedVehicle)}
        submitLabel="Save changes"
        isSubmitting={isSubmitting}
        error={error}
        onSubmit={handleSubmit}
        cancelTo={`/vehicles/${loadedVehicle.id}`}
      />
    </section>
  )
}
