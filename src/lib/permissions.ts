import type { CurrentAdmin } from './auth-context'

export type FleetRole = 'MANAGER' | 'MEMBER'

export function hasFleetRole(
  admin: CurrentAdmin | null,
  selectedFleetId: string | null,
  requiredRole: FleetRole,
): boolean {
  if (!admin || !selectedFleetId) {
    return false
  }

  if (admin.is_superadmin) {
    return true
  }

  const membership = admin.fleets.find(
    (fleet) => fleet.id === selectedFleetId,
  )

  if (!membership) {
    return false
  }

  if (requiredRole === 'MEMBER') {
    return membership.role === 'MEMBER' || membership.role === 'MANAGER'
  }

  return membership.role === requiredRole
}
