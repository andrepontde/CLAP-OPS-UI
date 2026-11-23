import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '../../lib/api'
import { hasFleetRole } from '../../lib/permissions'
import { useAuth } from '../../lib/useAuth'
import { useVehicleApi } from '../vehicles/vehicle.api'
import type { Vehicle } from '../vehicles/vehicle.types'
import { HistoryEntryForm } from './HistoryEntryForm'
import { useFuelEnergyApi } from './fuelEnergy.api'
import type { FuelCreateInput, ChargingCreateInput, HistoryKind } from './fuelEnergy.types'

export function FuelEnergyCreatePage() {
  const { kind } = useParams<{ kind: string }>()
  const historyKind = kind === 'energy' ? 'energy' : kind === 'fuel' ? 'fuel' : null
  const { admin, selectedFleetId } = useAuth()
  const navigate = useNavigate()
  const historyApi = useFuelEnergyApi()
  const vehicleApi = useVehicleApi()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    let mounted = true
    vehicleApi.list()
      .then((response) => { if (mounted) setVehicles(response.vehicles) })
      .catch((requestError) => { if (mounted) setError(requestError instanceof ApiError ? requestError.message : 'Unable to load vehicles') })
      .finally(() => { if (mounted) setIsLoading(false) })
    return () => { mounted = false }
  }, [vehicleApi])

  if (!historyKind) return <Navigate to="/fuel-energy" replace />
  if (!hasFleetRole(admin, selectedFleetId, 'MEMBER')) return <Navigate to="/fuel-energy" replace />

  async function submitFuel(values: FuelCreateInput) {
    setError('')
    setIsSubmitting(true)
    try {
      await historyApi.createFuel(values)
      navigate('/fuel-energy')
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : 'Unable to add fuel entry')
    } finally { setIsSubmitting(false) }
  }

  async function submitCharging(values: ChargingCreateInput) {
    setError('')
    setIsSubmitting(true)
    try {
      await historyApi.createCharging(values)
      navigate('/fuel-energy')
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : 'Unable to add charging entry')
    } finally { setIsSubmitting(false) }
  }

  return (
    <section>
      <header className="page-header"><div>
        <Link className="back-link" to="/fuel-energy">← Fuel &amp; energy</Link>
        <p className="eyebrow">Fleet management</p>
        <h1>{historyKind === 'fuel' ? 'Add fuel entry' : 'Add energy entry'}</h1>
      </div></header>
      {isLoading ? <p>Loading vehicles...</p> : (
        <HistoryEntryForm kind={historyKind as HistoryKind} vehicles={vehicles} submitLabel={historyKind === 'fuel' ? 'Save fuel entry' : 'Save energy entry'} isSubmitting={isSubmitting} error={error} cancelTo="/fuel-energy" onFuelSubmit={submitFuel} onChargingSubmit={submitCharging} />
      )}
    </section>
  )
}
