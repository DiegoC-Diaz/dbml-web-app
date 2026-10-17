import { useState, useCallback } from 'react'
import { registerUser, type RegisterDTO, type RegisterResponse } from '../action/register.action'
import { getApiErrorMessage } from '../../../lib/http/error'
import { tokenStore } from '../../../lib/http/tokenStore'

/**
 * Configuration options for the useRegister hook.
 * Allows components to inject custom lifecycle callbacks.
 */
export interface UseRegisterOptions {
  /** Callback fired immediately upon successful registration */
  onSuccess?: (data: RegisterResponse) => void | Promise<void>
  /** Callback fired when the request fails with the extracted error message */
  onError?: (errorMessage: string) => void | Promise<void>
  /** Whether to automatically store the returned access token into tokenStore (default: true) */
  autoSaveToken?: boolean
}

/**
 * Return shape for the useRegister hook.
 * Follows standard API request lifecycle conventions (idle -> pending -> success | error).
 */
export interface UseRegisterReturn {
  /** Triggers the registration action */
  register: (dto: RegisterDTO) => Promise<RegisterResponse | null>
  /** True while the HTTP request is in-flight */
  isLoading: boolean
  /** Alias for isLoading, aligned with React 19 / TanStack Query naming */
  isPending: boolean
  /** True if the last request completed successfully */
  isSuccess: boolean
  /** True if the last request encountered an error */
  isError: boolean
  /** Human-readable error message (parsed from backend response) or null */
  error: string | null
  /** Response payload returned by the server on success, or null */
  data: RegisterResponse | null
  /** Clears the current state back to initial values */
  reset: () => void
}

/**
 * ============================================================================
 * PATTERN BLUEPRINT: useRegister Hook (Sample API Request Hook)
 * ============================================================================
 * 
 * Why this architecture?
 * 1. Separation of Concerns:
 *    - Action layer (`register.action.ts`): pure async function making the HTTP call.
 *    - Hook layer (`useRegister.ts`): manages React state (loading, error, data, callbacks).
 *    - View layer (`RegisterPage.tsx`): focuses solely on UI and user experience.
 * 
 * 2. Predictable Lifecycle States:
 *    - `isLoading` / `isPending`: gives immediate UI feedback (spinners, disabling buttons).
 *    - `error`: captures clean error messages from NestJS/Axios for user-facing alerts.
 *    - `data`: contains typed server response.
 *    - `reset`: allows resetting state on form retry or modal close.
 * 
 * 3. Reusability:
 *    This exact structure serves as the template for any mutation/action hook
 *    across your project (e.g. `useLogin`, `useCreateProject`, `useUpdateUser`).
 */
export function useRegister(options: UseRegisterOptions = {}): UseRegisterReturn {
  const { onSuccess, onError, autoSaveToken = true } = options

  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<RegisterResponse | null>(null)

  const reset = useCallback(() => {
    setIsLoading(false)
    setIsSuccess(false)
    setError(null)
    setData(null)
  }, [])

  const executeRegister = useCallback(
    async (dto: RegisterDTO): Promise<RegisterResponse | null> => {
      setIsLoading(true)
      setIsSuccess(false)
      setError(null)

      try {
        const responseData = await registerUser(dto)

        // Store access token if returned and autoSave is enabled
        if (autoSaveToken && responseData.token) {
          tokenStore.set(responseData.token)
        }

        setData(responseData)
        setIsSuccess(true)

        if (onSuccess) {
          await onSuccess(responseData)
        }

        return responseData
      } catch (err: unknown) {
        const message = getApiErrorMessage(err, 'Failed to register. Please check your data and try again.')
        setError(message)
        setIsSuccess(false)

        if (onError) {
          await onError(message)
        }

        return null
      } finally {
        setIsLoading(false)
      }
    },
    [autoSaveToken, onSuccess, onError],
  )

  return {
    register: executeRegister,
    isLoading,
    isPending: isLoading,
    isSuccess,
    isError: error !== null,
    error,
    data,
    reset,
  }
}
