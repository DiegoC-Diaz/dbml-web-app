import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

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
  login: (email: string, name?: string) => Promise<void>
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

  // 2. Simulated login action (in real app, call your backend API here)
  const login = async (email: string, name = 'Jane Doe') => {
    setIsLoading(true)
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 600))

    const loggedInUser: User = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      email,
      name,
      role: 'user',
    }

    setUser(loggedInUser)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loggedInUser))
    setIsLoading(false)
  }

  // 3. Logout action: clear state and storage
  const logout = () => {
    setUser(null)
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
