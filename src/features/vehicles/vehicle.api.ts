import { useMemo } from 'react'
import { apiRequest } from '../../lib/api'
import { useAuth } from '../../lib/useAuth'
import type { VehicleListResponse } from './vehicle.types'

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
    }),
    [accessToken, selectedFleetId],
  )
}
