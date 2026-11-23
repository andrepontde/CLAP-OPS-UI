import { useMemo } from 'react'
import { apiRequest } from '../../lib/api'
import { useAuth } from '../../lib/useAuth'
import type {
  ChargingCreateInput,
  ChargingEntry,
  FuelCreateInput,
  FuelEntry,
} from './fuelEnergy.types'

export function useFuelEnergyApi() {
  const { accessToken, selectedFleetId } = useAuth()

  return useMemo(() => {
    const request = <T,>(path: string, options: RequestInit = {}) =>
      apiRequest<T>(path, {
        ...options,
        accessToken: accessToken ?? undefined,
        fleetId: selectedFleetId ?? undefined,
      })

    return {
      listFuel: () => request<{ entries: FuelEntry[] }>('/fuel-history'),
      getFuel: (id: string) => request<FuelEntry>(`/fuel-history/${id}`),
      createFuel: (entry: FuelCreateInput) =>
        request<FuelEntry>('/fuel-history', {
          method: 'POST',
          body: JSON.stringify(entry),
        }),
      updateFuel: (id: string, entry: Partial<FuelCreateInput>) =>
        request<FuelEntry>(`/fuel-history/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(entry),
        }),
      deleteFuel: (id: string) =>
        request<void>(`/fuel-history/${id}`, { method: 'DELETE' }),

      listCharging: () => request<{ entries: ChargingEntry[] }>('/charging-history'),
      getCharging: (id: string) => request<ChargingEntry>(`/charging-history/${id}`),
      createCharging: (entry: ChargingCreateInput) =>
        request<ChargingEntry>('/charging-history', {
          method: 'POST',
          body: JSON.stringify(entry),
        }),
      updateCharging: (id: string, entry: Partial<ChargingCreateInput>) =>
        request<ChargingEntry>(`/charging-history/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(entry),
        }),
      deleteCharging: (id: string) =>
        request<void>(`/charging-history/${id}`, { method: 'DELETE' }),
    }
  }, [accessToken, selectedFleetId])
}
