import { createContext } from 'react'

export type FleetRole = 'MANAGER' | 'MEMBER' | null

export interface FleetMembership {
  id: string
  name: string
  role: FleetRole
}

export interface CurrentAdmin {
  id: string
  email: string
  is_superadmin: boolean
  fleets: FleetMembership[]
}

export interface AuthContextValue {
  accessToken: string | null
  admin: CurrentAdmin | null
  selectedFleetId: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  selectFleet: (fleetId: string) => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
