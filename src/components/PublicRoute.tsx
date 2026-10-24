
import { Navigate, Outlet } from 'react-router'
import { useAuth } from '../context/AuthContext'

/**
 * ============================================================================
 * PublicRoute Component (Guest-only routes)
 * ============================================================================
 * 
 * WHY USE THIS:
 * Pages like `/login`, `/register`, or `/forgot-password` are intended for guests.
 * If an already-authenticated user tries to visit `/login`, this wrapper intercepts
 * the request and redirects them directly to the main dashboard (`/`).
 */
export function PublicRoute() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return null
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
