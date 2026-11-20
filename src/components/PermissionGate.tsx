import type { ReactNode } from 'react'

interface PermissionGateProps {
  allowed: boolean
  children: ReactNode
}

export function PermissionGate({
  allowed,
  children,
}: PermissionGateProps) {
  if (!allowed) {
    return null
  }

  return children
}
