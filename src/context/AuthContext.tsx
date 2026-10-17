import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { api } from '../lib/http/client'
import { tokenStore } from '../lib/http/tokenStore'
/**
 * Interface defining the authenticated user object.
 */
export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user'
}

/**
 * Interface defining what AuthContext exposes across the entire application.
 */
interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const STORAGE_KEY = 'demo_auth_user'

/**
 * AuthProvider component:
 * Wraps your application to supply global authentication state.
 * Any component (like ProtectedRoute or LoginPage) can read or modify
 * authentication without passing props through multiple levels (prop drilling).
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 1. On initial mount, restore session from localStorage if available
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setUser(JSON.parse(stored))
      }
    } catch (error) {
      console.error('Failed to parse stored user session:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])


  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password })

    if (response.data.token) {
      tokenStore.set(response.data.token)
    }

    const userData = response.data.user || response.data
    const loggedInUser: User = {
      id: userData.id,
      email: userData.email,
      name: userData.username || userData.name || userData.email.split('@')[0],
      role: userData.role || 'user',
    }

    setUser(loggedInUser)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loggedInUser))
  }
      

  // 3. Logout action: clear state and storage
  const logout = () => {
    setUser(null)
    tokenStore.set(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Custom hook to easily consume AuthContext in any component.
 * Throws an informative error if used outside <AuthProvider>.
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an <AuthProvider>')
  }
  return context
}
