import { BrowserRouter, Routes, Route } from 'react-router'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { PublicRoute } from './components/PublicRoute'
import { Layout } from './components/Layout'
import { LoginPage } from './modules/Auth/LoginPage'
import { RegisterPage } from './modules/Auth/RegisterPage'
import { HomePage } from './modules/HomePage/HomePage'
import { ProfilePage } from './pages/ProfilePage'
import { NotFoundPage } from './pages/NotFoundPage'

/**
 * ============================================================================
 * STEP-BY-STEP GUIDE TO HOW REACT ROUTER WORKS IN THIS APPLICATION
 * ============================================================================
 * 
 * 1. <BrowserRouter>:
 *    - Connects your React app to the browser's URL address bar using HTML5 History API
 *      (pushState, replaceState, popstate events).
 *    - Must wrap all routes and any components using hooks like `useNavigate`, `useLocation`.
 * 
 * 2. <AuthProvider>:
 *    - Sits right inside BrowserRouter so that all child routes have access to authentication
 *      state (`user`, `isAuthenticated`, `login`, `logout`) via `useAuth()`.
 * 
 * 3. <Routes>:
 *    - Looks at the current URL pathname and compares it against all child <Route> patterns.
 *    - React Router automatically matches the most specific route and renders its element.
 * 
 * 4. ROUTE NESTING & OUTLETS:
 *    - When a Route wraps other child Routes without specifying a `path` (or with a base path),
 *      it acts as a "Layout Route" or "Guard Route".
 *    - Example below:
 *        <Route element={<ProtectedRoute />}>
 *          <Route element={<Layout />}>
 *            <Route path="/" element={<DashboardPage />} />
 *          </Route>
 *        </Route>
 *      Here, `ProtectedRoute` runs first. If authorized, it renders its `<Outlet />`, which is
 *      `Layout`. `Layout` renders the persistent navbar, and its `<Outlet />` renders `DashboardPage`.
 * 
 * 5. CATCH-ALL ROUTE (`path="*"`):
 *    - Matches any URL that didn't match the routes above, serving a friendly 404 page.
 */
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ========================================================= */}
          {/* PUBLIC / GUEST ROUTES (e.g. /login)                       */}
          {/* Uses PublicRoute so logged-in users are redirected away.  */}
          {/* ========================================================= */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* ========================================================= */}
          {/* PROTECTED ROUTES                                          */}
          {/* Users MUST be authenticated; otherwise redirected to /login */}
          {/* ========================================================= */}
          <Route element={<ProtectedRoute />}>
            {/* Layout provides shared navbar, header, and container */}
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Route>

          {/* ========================================================= */}
          {/* FALLBACK / 404 NOT FOUND ROUTE                            */}
          {/* ========================================================= */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
