import { useMemo } from 'react'
import { apiRequest } from '../../lib/api'
import { useAuth } from '../../lib/useAuth'
import type {
  Vehicle,
  VehicleCreateInput,
  VehicleListResponse,
  VehicleUpdateInput,
} from './vehicle.types'

export function useVehicleApi() {
  const { accessToken, selectedFleetId } = useAuth()

  return useMemo(
    () => ({
      list: async () => {
        if (!accessToken || !selectedFleetId) {
          throw new Error('A vehicle request requires a selected fleet')
        }

        return apiRequest<VehicleListResponse>('/vehicles', {
          accessToken,
          fleetId: selectedFleetId,
        })
      },
      get: async (vehicleId: string) => {
        if (!accessToken || !selectedFleetId) {
          throw new Error('A vehicle request requires a selected fleet')
        }

        return apiRequest<Vehicle>(`/vehicles/${vehicleId}`, {
          accessToken,
          fleetId: selectedFleetId,
        })
      },
      create: async (vehicle: VehicleCreateInput) => {
        if (!accessToken || !selectedFleetId) {
          throw new Error('A vehicle request requires a selected fleet')
        }

        return apiRequest<Vehicle>('/vehicles', {
          method: 'POST',
          accessToken,
          fleetId: selectedFleetId,
          body: JSON.stringify(vehicle),
        })
      },
      update: async (vehicleId: string, vehicle: VehicleUpdateInput) => {
        if (!accessToken || !selectedFleetId) {
          throw new Error('A vehicle request requires a selected fleet')
        }

        return apiRequest<Vehicle>(`/vehicles/${vehicleId}`, {
          method: 'PATCH',
          accessToken,
          fleetId: selectedFleetId,
          body: JSON.stringify(vehicle),
        })
      },
    }),
    [accessToken, selectedFleetId],
  )
}
