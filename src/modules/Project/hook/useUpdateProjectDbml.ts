import { useState, useCallback, useRef, useEffect } from 'react'
import {
  updateProjectDbml as updateProjectDbmlAction,
  type UpdateProjectDbmlDTO,
  type ProjectResponseDTO,
} from '../action/update.projects.action'
import { getApiErrorMessage } from '../../../lib/http/error'

const DEFAULT_DEBOUNCE_MS = 800

export interface UseUpdateProjectDbmlOptions {
  /** Debounce delay in milliseconds when using `debouncedUpdateDbml` (default: 800ms) */
  debounceMs?: number
  /** Callback fired immediately upon successful DBML update */
  onSuccess?: (data: ProjectResponseDTO) => void | Promise<void>
  /** Callback fired when the request fails with the extracted error message */
  onError?: (errorMessage: string) => void | Promise<void>
}

export interface UseUpdateProjectDbmlReturn {
  /** Immediately sends the DBML update to the server (`PATCH /projects/:id/dbml`) */
  updateDbml: (
    id: string,
    dto: UpdateProjectDbmlDTO,
  ) => Promise<ProjectResponseDTO | null>
  /** Schedules a debounced DBML update (ideal for editor typing / canvas changes) */
  debouncedUpdateDbml: (id: string, dto: UpdateProjectDbmlDTO) => void
  /** Immediately executes any pending debounced DBML update */
  flush: () => Promise<ProjectResponseDTO | null>
  /** Cancels any pending debounced DBML update without sending it */
  cancelPending: () => void
  /** True while a debounced update is queued and waiting to be sent */
  hasPendingChanges: boolean
  /** True while the HTTP request is in-flight */
  isLoading: boolean
  /** Alias for isLoading, aligned with React 19 / TanStack Query naming */
  isPending: boolean
  /** Alias for isLoading, tailored for editor save indicators */
  isSaving: boolean
  /** True if the last request completed successfully */
  isSuccess: boolean
  /** True if the last request encountered an error */
  isError: boolean
  /** Human-readable error message or null */
  error: string | null
  /** Updated project returned by the server on success, or null */
  data: ProjectResponseDTO | null
  /** ISO timestamp of the last successful DBML save, or null */
  lastSavedAt: string | null
  /** Clears the current state back to initial values */
  reset: () => void
}

/**
 * Dedicated hook for updating a project's DBML code and optional canvas layout
 * (`PATCH /projects/:id/dbml`).
 *
 * Designed specifically for the DBML workspace:
 * - Supports both immediate saves (`updateDbml`, e.g., Ctrl+S / Save button) and
 *   debounced auto-saves (`debouncedUpdateDbml`, e.g., while editing DBML code).
 * - Guards against race conditions / out-of-order responses using a monotonically
 *   increasing request sequence ID.
 * - Tracks `hasPendingChanges`, `isSaving`, and `lastSavedAt` for editor status bars.
 */
export function useUpdateProjectDbml(
  options: UseUpdateProjectDbmlOptions = {},
): UseUpdateProjectDbmlReturn {
  const { debounceMs = DEFAULT_DEBOUNCE_MS, onSuccess, onError } = options

  const [isLoading, setIsLoading] = useState(false)
  const [hasPendingChanges, setHasPendingChanges] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<ProjectResponseDTO | null>(null)
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)

  const requestIdRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingPayloadRef = useRef<{
    id: string
    dto: UpdateProjectDbmlDTO
  } | null>(null)

  const cancelPending = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    pendingPayloadRef.current = null
    setHasPendingChanges(false)
  }, [])

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  const reset = useCallback(() => {
    cancelPending()
    requestIdRef.current += 1
    setIsLoading(false)
    setIsSuccess(false)
    setError(null)
    setData(null)
    setLastSavedAt(null)
  }, [cancelPending])

  const updateDbml = useCallback(
    async (
      id: string,
      dto: UpdateProjectDbmlDTO,
    ): Promise<ProjectResponseDTO | null> => {
      // Cancel any queued debounce since we are saving immediately
      cancelPending()

      const currentRequestId = ++requestIdRef.current
      setIsLoading(true)
      setIsSuccess(false)
      setError(null)

      try {
        const responseData = await updateProjectDbmlAction(id, dto)

        // Ignore stale out-of-order responses
        if (currentRequestId !== requestIdRef.current) {
          return null
        }

        setData(responseData)
        setIsSuccess(true)
        setLastSavedAt(responseData.updatedAt ?? new Date().toISOString())

        if (onSuccess) {
          await onSuccess(responseData)
        }

        return responseData
      } catch (err: unknown) {
        if (currentRequestId !== requestIdRef.current) {
          return null
        }

        const message = getApiErrorMessage(
          err,
          'Failed to save DBML changes. Please try again.',
        )
        setError(message)
        setIsSuccess(false)

        if (onError) {
          await onError(message)
        }

        return null
      } finally {
        if (currentRequestId === requestIdRef.current) {
          setIsLoading(false)
        }
      }
    },
    [cancelPending, onSuccess, onError],
  )

  const debouncedUpdateDbml = useCallback(
    (id: string, dto: UpdateProjectDbmlDTO) => {
      pendingPayloadRef.current = { id, dto }
      setHasPendingChanges(true)

      if (timerRef.current !== null) {
        clearTimeout(timerRef.current)
      }

      timerRef.current = setTimeout(() => {
        timerRef.current = null
        const pending = pendingPayloadRef.current
        pendingPayloadRef.current = null
        setHasPendingChanges(false)

        if (pending) {
          void updateDbml(pending.id, pending.dto)
        }
      }, debounceMs)
    },
    [debounceMs, updateDbml],
  )

  const flush = useCallback(async (): Promise<ProjectResponseDTO | null> => {
    const pending = pendingPayloadRef.current
    if (!pending) {
      return null
    }
    return updateDbml(pending.id, pending.dto)
  }, [updateDbml])

  return {
    updateDbml,
    debouncedUpdateDbml,
    flush,
    cancelPending,
    hasPendingChanges,
    isLoading,
    isPending: isLoading,
    isSaving: isLoading,
    isSuccess,
    isError: error !== null,
    error,
    data,
    lastSavedAt,
    reset,
  }
}
