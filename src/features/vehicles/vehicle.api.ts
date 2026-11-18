import { apiRequest } from '../../lib/api'
import { useMemo } from 'react'
import { useAuth } from '../../lib/useAuth'
import type { VehicleListResponse } from './vehicle.types'

export function useVehicleApi() {
  const { accessToken } = useAuth()

  if (!accessToken) {
    throw new Error('A vehicle request requires authentication')
  }

  return useMemo(
    () => ({
      list: () =>
        apiRequest<VehicleListResponse>('/vehicles', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }),
    }),
    [accessToken],
  )
}
