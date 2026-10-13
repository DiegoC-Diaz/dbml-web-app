import { Outlet, NavLink, useNavigate } from 'react-router'
import { LayoutDashboard, User as UserIcon, LogOut, Shield } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

/**
 * ============================================================================
 * Layout Component
 * ============================================================================
 * 
 * HOW LAYOUTS WORK WITH NESTED ROUTES:
 * 
 * In React Router, you can nest routes inside a parent Route that has a layout element:
 * 
 *   <Route element={<Layout />}>
 *     <Route path="/" element={<DashboardPage />} />
 *     <Route path="/profile" element={<ProfilePage />} />
 *   </Route>
 * 
 * The parent component (`Layout`) stays mounted while navigating between child routes.
 * The `<Outlet />` component defines the exact spot where the matching child component
 * gets rendered!
 */
export function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    // Redirect to login page after signing out
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          {/* Logo / Brand */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5 font-bold text-slate-900">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
                <Shield className="h-5 w-5" />
              </div>
              <span className="text-lg tracking-tight">AppPortal</span>
            </div>

            {/* Navigation Links using NavLink */}
            {/* NavLink automatically injects an `isActive` boolean for active styling */}
            <nav className="hidden sm:flex items-center gap-1">
              <NavLink
                to="/"
                end // `end` ensures '/' matches ONLY exact root, not every subroute
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </NavLink>

              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <UserIcon className="h-4 w-4" />
                Profile
              </NavLink>
            </nav>
          </div>

          {/* User profile badge & Logout button */}
          <div className="flex items-center gap-4">
            <div className="hidden text-right md:block">
              <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-red-50 hover:border-red-200 hover:text-red-600"
              title="Sign out of your account"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area: Child routes are injected here by <Outlet /> */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
