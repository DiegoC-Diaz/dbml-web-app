import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '../context/AuthContext'

/**
 * ============================================================================
 * ProtectedRoute Component
 * ============================================================================
 * 
 * HOW PROTECTED ROUTES WORK IN REACT ROUTER:
 * 
 * 1. Layout / Wrapper Pattern:
 *    Instead of wrapping every single page component manually, React Router allows
 *    us to declare a parent <Route element={<ProtectedRoute />}> that contains child
 *    routes. The parent renders `<Outlet />`, which acts as a placeholder where any
 *    matching child route's component is dynamically injected.
 * 
 * 2. Handling the Loading State:
 *    When the application boots, checking authentication (e.g., inspecting localStorage
 *    or validating a JWT with a backend) is asynchronous. If we redirected immediately
 *    before loading finishes, authenticated users would be falsely kicked to /login
 *    on every page reload! We render a loading spinner until auth state is resolved.
 * 
 * 3. The `<Navigate />` Component:
 *    - `to="/login"`: The target redirect URL.
 *    - `replace`: By default, navigation pushes a new entry onto the browser's history stack.
 *      Using `replace` overwrites the current entry so the user does NOT get stuck in an
 *      infinite redirect loop when clicking the browser's "Back" button.
 *    - `state={{ from: location }}`: Saves where the user was trying to go! Once the user
 *      logs in successfully, LoginPage can inspect `location.state.from` and take them
 *      back to the exact page they originally wanted to visit.
 */
export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  // STEP 1: Wait for auth session restoration before deciding to redirect
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-sm font-medium text-slate-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // STEP 2: If unauthenticated, redirect to /login and preserve requested location
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // STEP 3: If authenticated, render child routes via <Outlet />
  return <Outlet />
}
