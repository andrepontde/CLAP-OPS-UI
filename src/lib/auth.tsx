import { useEffect, useState, type ReactNode } from 'react'
import { apiRequest } from './api'
import { AuthContext } from './auth-context'
import type { CurrentAdmin, FleetMembership } from './auth-context'

const TOKEN_KEY = 'clap_ops_access_token'
const FLEET_KEY = 'clap_ops_selected_fleet'
const ADMIN_KEY = 'clap_ops_current_admin'

interface LoginResponse {
  access_token: string
  token_type: string
}

interface FleetListResponse {
  fleets: Array<Omit<FleetMembership, 'role'>>
}

async function loadCurrentAdmin(accessToken: string): Promise<CurrentAdmin> {
  const admin = await apiRequest<CurrentAdmin>('/auth/me', { accessToken })

  if (!admin.is_superadmin) {
    return admin
  }

  const fleetResponse = await apiRequest<FleetListResponse>('/fleets', {
    accessToken,
  })

  return {
    ...admin,
    fleets: fleetResponse.fleets.map((fleet) => ({
      ...fleet,
      role: null,
    })),
  }
}

function getStoredFleetId(
  admin: CurrentAdmin,
): string | null {
  const storedFleetId = sessionStorage.getItem(FLEET_KEY)
  if (storedFleetId && admin.fleets.some((fleet) => fleet.id === storedFleetId)) {
    return storedFleetId
  }
  return admin.fleets[0]?.id ?? null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(
    () => sessionStorage.getItem(TOKEN_KEY),
  )
  const [admin, setAdmin] = useState<CurrentAdmin | null>(() => {
    const storedAdmin = sessionStorage.getItem(ADMIN_KEY)
    if (!storedAdmin) {
      return null
    }
    try {
      return JSON.parse(storedAdmin) as CurrentAdmin
    } catch {
      sessionStorage.removeItem(ADMIN_KEY)
      return null
    }
  })
  const [selectedFleetId, setSelectedFleetId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(() => Boolean(
    sessionStorage.getItem(TOKEN_KEY),
  ))

  useEffect(() => {
    const storedToken = sessionStorage.getItem(TOKEN_KEY)
    if (!storedToken) {
      return
    }

    loadCurrentAdmin(storedToken)
      .then((currentAdmin) => {
        sessionStorage.setItem(ADMIN_KEY, JSON.stringify(currentAdmin))
        setAdmin(currentAdmin)
        const fleetId = getStoredFleetId(currentAdmin)
        setSelectedFleetId(fleetId)
        if (fleetId) {
          sessionStorage.setItem(FLEET_KEY, fleetId)
        }
      })
      .catch(() => {
        sessionStorage.removeItem(TOKEN_KEY)
        sessionStorage.removeItem(FLEET_KEY)
        sessionStorage.removeItem(ADMIN_KEY)
        setAccessToken(null)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  async function login(email: string, password: string) {
    const response = await apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    const currentAdmin = await loadCurrentAdmin(response.access_token)
    const fleetId = getStoredFleetId(currentAdmin)

    sessionStorage.setItem(TOKEN_KEY, response.access_token)
    sessionStorage.setItem(ADMIN_KEY, JSON.stringify(currentAdmin))
    if (fleetId) {
      sessionStorage.setItem(FLEET_KEY, fleetId)
    }
    setAccessToken(response.access_token)
    setAdmin(currentAdmin)
    setSelectedFleetId(fleetId)
  }

  async function logout() {
    if (accessToken) {
      try {
        await apiRequest<undefined>('/auth/logout', {
          method: 'POST',
          accessToken,
        })
      } finally {
        sessionStorage.removeItem(TOKEN_KEY)
        sessionStorage.removeItem(FLEET_KEY)
        sessionStorage.removeItem(ADMIN_KEY)
        setAccessToken(null)
        setAdmin(null)
        setSelectedFleetId(null)
      }
      return
    }

    sessionStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(FLEET_KEY)
    sessionStorage.removeItem(ADMIN_KEY)
    setAdmin(null)
    setSelectedFleetId(null)
  }

  function selectFleet(fleetId: string) {
    if (!admin?.fleets.some((fleet) => fleet.id === fleetId)) {
      return
    }
    sessionStorage.setItem(FLEET_KEY, fleetId)
    setSelectedFleetId(fleetId)
  }

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        admin,
        selectedFleetId,
        isLoading,
        login,
        logout,
        selectFleet,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
