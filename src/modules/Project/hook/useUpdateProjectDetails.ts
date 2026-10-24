import { useState, useCallback } from 'react'
import {
  updateProjectDetails as updateProjectDetailsAction,
  updateProjectLayout as updateProjectLayoutAction,
  type UpdateProjectDetailsDTO,
  type UpdateProjectLayoutDTO,
  type ProjectResponseDTO,
} from '../action/update.projects.action'
import { getApiErrorMessage } from '../../../lib/http/error'

export interface UseUpdateProjectDetailsOptions {
  /** Callback fired immediately upon successful project details update */
  onSuccess?: (data: ProjectResponseDTO) => void | Promise<void>
  /** Callback fired when the request fails with the extracted error message */
  onError?: (errorMessage: string) => void | Promise<void>
}

export interface UseUpdateProjectDetailsReturn {
  /** Triggers the update project details action (`PATCH /projects/:id/details`) */
  updateDetails: (
    id: string,
    dto: UpdateProjectDetailsDTO,
  ) => Promise<ProjectResponseDTO | null>
  /** True while the HTTP request is in-flight */
  isLoading: boolean
  /** Alias for isLoading, aligned with React 19 / TanStack Query naming */
  isPending: boolean
  /** True if the last request completed successfully */
  isSuccess: boolean
  /** True if the last request encountered an error */
  isError: boolean
  /** Human-readable error message or null */
  error: string | null
  /** Updated project returned by the server on success, or null */
  data: ProjectResponseDTO | null
  /** Clears the current state back to initial values */
  reset: () => void
}

/**
 * Hook dedicated to updating a project's administrative metadata: title and description
 * (`PATCH /projects/:id/details`).
 * Follows Single Responsibility Principle (SRP): separated from DBML code updates so
 * metadata forms and auto-save editor loops never collide in loading/error state.
 */
export function useUpdateProjectDetails(
  options: UseUpdateProjectDetailsOptions = {},
): UseUpdateProjectDetailsReturn {
  const { onSuccess, onError } = options

  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<ProjectResponseDTO | null>(null)

  const reset = useCallback(() => {
    setIsLoading(false)
    setIsSuccess(false)
    setError(null)
    setData(null)
  }, [])

  const executeUpdateDetails = useCallback(
    async (
      id: string,
      dto: UpdateProjectDetailsDTO,
    ): Promise<ProjectResponseDTO | null> => {
      setIsLoading(true)
      setIsSuccess(false)
      setError(null)

      try {
        const responseData = await updateProjectDetailsAction(id, dto)
        setData(responseData)
        setIsSuccess(true)

        if (onSuccess) {
          await onSuccess(responseData)
        }

        return responseData
      } catch (err: unknown) {
        const message = getApiErrorMessage(
          err,
          'Failed to update project details.',
        )
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
    [onSuccess, onError],
  )

  return {
    updateDetails: executeUpdateDetails,
    isLoading,
    isPending: isLoading,
    isSuccess,
    isError: error !== null,
    error,
    data,
    reset,
  }
}

export interface UseUpdateProjectLayoutOptions {
  /** Callback fired immediately upon successful layout update */
  onSuccess?: (data: ProjectResponseDTO) => void | Promise<void>
  /** Callback fired when the request fails with the extracted error message */
  onError?: (errorMessage: string) => void | Promise<void>
}

export interface UseUpdateProjectLayoutReturn {
  /** Triggers the update project layout action (`PATCH /projects/:id/layout`) */
  updateLayout: (
    id: string,
    dto: UpdateProjectLayoutDTO,
  ) => Promise<ProjectResponseDTO | null>
  /** True while the HTTP request is in-flight */
  isLoading: boolean
  /** Alias for isLoading */
  isPending: boolean
  /** True if the last request completed successfully */
  isSuccess: boolean
  /** True if the last request encountered an error */
  isError: boolean
  /** Human-readable error message or null */
  error: string | null
  /** Updated project returned by the server on success, or null */
  data: ProjectResponseDTO | null
  /** Clears the current state back to initial values */
  reset: () => void
}

/**
 * Hook dedicated to updating only the visual ER diagram layout (`PATCH /projects/:id/layout`).
 */
export function useUpdateProjectLayout(
  options: UseUpdateProjectLayoutOptions = {},
): UseUpdateProjectLayoutReturn {
  const { onSuccess, onError } = options

  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<ProjectResponseDTO | null>(null)

  const reset = useCallback(() => {
    setIsLoading(false)
    setIsSuccess(false)
    setError(null)
    setData(null)
  }, [])

  const executeUpdateLayout = useCallback(
    async (
      id: string,
      dto: UpdateProjectLayoutDTO,
    ): Promise<ProjectResponseDTO | null> => {
      setIsLoading(true)
      setIsSuccess(false)
      setError(null)

      try {
        const responseData = await updateProjectLayoutAction(id, dto)
        setData(responseData)
        setIsSuccess(true)

        if (onSuccess) {
          await onSuccess(responseData)
        }

        return responseData
      } catch (err: unknown) {
        const message = getApiErrorMessage(err, 'Failed to save diagram layout.')
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
    [onSuccess, onError],
  )

  return {
    updateLayout: executeUpdateLayout,
    isLoading,
    isPending: isLoading,
    isSuccess,
    isError: error !== null,
    error,
    data,
    reset,
  }
}
