import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/useAuth'

export function RequireAuth() {
  const { accessToken } = useAuth()
  const location = useLocation()

  if (!accessToken) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    )
  }

  return <Outlet />
}
