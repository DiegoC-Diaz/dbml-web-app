import { useState, useCallback } from 'react'
import {
  createProject as createProjectAction,
  cloneProject as cloneProjectAction,
  type CreateProjectDTO,
  type CloneProjectDTO,
  type ProjectResponseDTO,
} from '../action/create.projects.actions'
import { getApiErrorMessage } from '../../../lib/http/error'

export interface UseCreateProjectOptions {
  /** Callback fired immediately upon successful project creation */
  onSuccess?: (data: ProjectResponseDTO) => void | Promise<void>
  /** Callback fired when the request fails with the extracted error message */
  onError?: (errorMessage: string) => void | Promise<void>
}

export interface UseCreateProjectReturn {
  /** Triggers the create project action (`POST /projects`) */
  createProject: (dto: CreateProjectDTO) => Promise<ProjectResponseDTO | null>
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
  /** Created project returned by the server on success, or null */
  data: ProjectResponseDTO | null
  /** Clears the current state back to initial values */
  reset: () => void
}

/**
 * Hook dedicated to creating a new DBML project (`POST /projects`).
 * Follows Single Responsibility Principle (SRP): encapsulates only project creation state.
 */
export function useCreateProject(
  options: UseCreateProjectOptions = {},
): UseCreateProjectReturn {
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

  const executeCreateProject = useCallback(
    async (dto: CreateProjectDTO): Promise<ProjectResponseDTO | null> => {
      setIsLoading(true)
      setIsSuccess(false)
      setError(null)

      try {
        const responseData = await createProjectAction(dto)
        setData(responseData)
        setIsSuccess(true)

        if (onSuccess) {
          await onSuccess(responseData)
        }

        return responseData
      } catch (err: unknown) {
        const message = getApiErrorMessage(
          err,
          'Failed to create project. Please check your input and try again.',
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
    createProject: executeCreateProject,
    isLoading,
    isPending: isLoading,
    isSuccess,
    isError: error !== null,
    error,
    data,
    reset,
  }
}

export interface UseCloneProjectOptions {
  /** Callback fired immediately upon successful project cloning */
  onSuccess?: (data: ProjectResponseDTO) => void | Promise<void>
  /** Callback fired when the request fails with the extracted error message */
  onError?: (errorMessage: string) => void | Promise<void>
}

export interface UseCloneProjectReturn {
  /** Triggers the clone project action (`POST /projects/:id/clone`) */
  cloneProject: (
    id: string,
    dto?: CloneProjectDTO,
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
  /** Cloned project returned by the server on success, or null */
  data: ProjectResponseDTO | null
  /** Clears the current state back to initial values */
  reset: () => void
}

/**
 * Hook dedicated to cloning an existing DBML project (`POST /projects/:id/clone`).
 */
export function useCloneProject(
  options: UseCloneProjectOptions = {},
): UseCloneProjectReturn {
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

  const executeCloneProject = useCallback(
    async (
      id: string,
      dto?: CloneProjectDTO,
    ): Promise<ProjectResponseDTO | null> => {
      setIsLoading(true)
      setIsSuccess(false)
      setError(null)

      try {
        const responseData = await cloneProjectAction(id, dto)
        setData(responseData)
        setIsSuccess(true)

        if (onSuccess) {
          await onSuccess(responseData)
        }

        return responseData
      } catch (err: unknown) {
        const message = getApiErrorMessage(err, 'Failed to clone project.')
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
    cloneProject: executeCloneProject,
    isLoading,
    isPending: isLoading,
    isSuccess,
    isError: error !== null,
    error,
    data,
    reset,
  }
}
