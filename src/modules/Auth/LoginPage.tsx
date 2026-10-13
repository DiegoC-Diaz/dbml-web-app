import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useLocation, useNavigate, Link } from 'react-router'
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

/**
 * ============================================================================
 * 1. Zod Validation Schema
 * ============================================================================
 * Defines the shape and constraints of the form data. Zod enforces type safety
 * at both compile-time and runtime.
 */
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long'),
  rememberMe: z.boolean(),
})

type LoginFormValues = z.infer<typeof loginSchema>

/**
 * ============================================================================
 * 2. LoginPage Component
 * ============================================================================
 */
export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  /**
   * Determine where to redirect after login:
   * If the user was kicked to /login by ProtectedRoute, the original route was saved
   * inside `location.state.from.pathname`. Otherwise, default to '/'.
   */
  const fromLocation = (location.state as { from?: { pathname: string } })?.from?.pathname || '/'

  /**
   * React Hook Form setup with Zod resolver:
   * - register: attaches input fields to form state
   * - handleSubmit: runs validation before triggering our onSubmit callback
   * - formState.errors: holds field-level validation errors automatically
   * - formState.isSubmitting: gives us instantaneous pending state for the button
   */
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setServerError(null)
      // Call AuthContext login method
      await login(data.email, data.email.split('@')[0])
      
      // Navigate to destination.
      // replace: true replaces the /login history entry so the Back button doesn't loop back to login.
      navigate(fromLocation, { replace: true })
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'Login failed. Please try again.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50/40 p-4">
      <div className="w-full max-w-md">
        {/* Card Header / Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-500/25">
            <LogIn className="h-7 w-7 text-white" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
            Welcome back
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Sign in to access your protected workspace
          </p>
        </div>

        {/* Card Body */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xl shadow-slate-200/50">
          {/* Server Error Alert */}
          {serverError && (
            <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50/80 p-3.5 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700"
              >
                Email address
              </label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  {...register('email')}
                  className={`block w-full rounded-xl border bg-white py-2.5 pl-10 pr-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                    errors.email
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                      : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-600 font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700"
                >
                  Password
                </label>
                <Link
                  to="#"
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...register('password')}
                  className={`block w-full rounded-xl border bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                    errors.password
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                      : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-600 font-medium">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center">
              <input
                id="rememberMe"
                type="checkbox"
                {...register('rememberMe')}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label
                htmlFor="rememberMe"
                className="ml-2 block text-sm text-slate-600"
              >
                Remember me for 30 days
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign in</span>
                  <LogIn className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Helper Quick Fill Hint */}
          <div className="mt-6 border-t border-slate-100 pt-4 text-center">
            <p className="text-xs text-slate-500">
              Demo tip: You can enter any valid email and 6+ character password.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
