import { useMemo } from 'react'
import { apiRequest } from '../../lib/api'
import { useAuth } from '../../lib/useAuth'
import type {
  Operator,
  OperatorCreateInput,
  OperatorListResponse,
  OperatorUpdateInput,
} from './operator.types'

export function useOperatorApi() {
  const { accessToken, selectedFleetId } = useAuth()

  return useMemo(
    () => ({
      list: async () => {
        if (!accessToken || !selectedFleetId) {
          throw new Error('An operator request requires a selected fleet')
        }
        return apiRequest<OperatorListResponse>('/operators', {
          accessToken,
          fleetId: selectedFleetId,
        })
      },
      get: async (operatorId: string) => {
        if (!accessToken || !selectedFleetId) {
          throw new Error('An operator request requires a selected fleet')
        }
        return apiRequest<Operator>(`/operators/${operatorId}`, {
          accessToken,
          fleetId: selectedFleetId,
        })
      },
      create: async (operator: OperatorCreateInput) => {
        if (!accessToken || !selectedFleetId) {
          throw new Error('An operator request requires a selected fleet')
        }
        return apiRequest<Operator>('/operators', {
          method: 'POST',
          accessToken,
          fleetId: selectedFleetId,
          body: JSON.stringify(operator),
        })
      },
      update: async (operatorId: string, operator: OperatorUpdateInput) => {
        if (!accessToken || !selectedFleetId) {
          throw new Error('An operator request requires a selected fleet')
        }
        return apiRequest<Operator>(`/operators/${operatorId}`, {
          method: 'PATCH',
          accessToken,
          fleetId: selectedFleetId,
          body: JSON.stringify(operator),
        })
      },
      delete: async (operatorId: string) => {
        if (!accessToken || !selectedFleetId) {
          throw new Error('An operator request requires a selected fleet')
        }
        return apiRequest<void>(`/operators/${operatorId}`, {
          method: 'DELETE',
          accessToken,
          fleetId: selectedFleetId,
        })
      },
    }),
    [accessToken, selectedFleetId],
  )
}
