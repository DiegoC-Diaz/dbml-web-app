import { useState, useCallback, useEffect, useRef } from 'react'
import { getProjects, getProjectById } from '../queries/projects.queries'
import type { ProjectQueryDTO } from '../dtos/project.query.dto'
import type { ProjectResponseDTO, ProjectsResponseDTO } from '../dtos/project.response.dto'
import { getApiErrorMessage } from '../../../lib/http/error'

export interface UseProjectsOptions {
  /** Initial query parameters for filtering/sorting projects */
  query?: ProjectQueryDTO
  /** Whether to automatically fetch on mount or when query changes (default: true) */
  enabled?: boolean
  /** Callback fired upon successful fetch */
  onSuccess?: (data: ProjectsResponseDTO) => void | Promise<void>
  /** Callback fired when the request fails */
  onError?: (errorMessage: string) => void | Promise<void>
}

export interface UseProjectsReturn {
  /** Fetches the project list manually (optionally overriding query params) */
  fetchProjects: (overrideQuery?: ProjectQueryDTO) => Promise<ProjectsResponseDTO | null>
  /** Alias for fetchProjects */
  refetch: () => Promise<ProjectsResponseDTO | null>
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
  /** Array of projects returned by the server */
  data: ProjectsResponseDTO
  /** Resets the hook state back to initial values */
  reset: () => void
}

/**
 * Hook dedicated to querying the authenticated user's projects (`GET /projects`).
 * Follows Single Responsibility Principle (SRP): handles only collection querying and its lifecycle state.
 */
export function useProjects(options: UseProjectsOptions = {}): UseProjectsReturn {
  const { query, enabled = true, onSuccess, onError } = options

  const [isLoading, setIsLoading] = useState<boolean>(enabled)
  const [isSuccess, setIsSuccess] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<ProjectsResponseDTO>([])

  const requestIdRef = useRef(0)
  const queryRef = useRef<ProjectQueryDTO | undefined>(query)
  queryRef.current = query

  const reset = useCallback(() => {
    requestIdRef.current += 1
    setIsLoading(false)
    setIsSuccess(false)
    setError(null)
    setData([])
  }, [])

  const fetchProjects = useCallback(
    async (overrideQuery?: ProjectQueryDTO): Promise<ProjectsResponseDTO | null> => {
      const currentRequestId = ++requestIdRef.current
      setIsLoading(true)
      setIsSuccess(false)
      setError(null)

      try {
        const result = await getProjects(overrideQuery ?? queryRef.current)
        if (currentRequestId !== requestIdRef.current) {
          return null
        }

        setData(result)
        setIsSuccess(true)

        if (onSuccess) {
          await onSuccess(result)
        }

        return result
      } catch (err: unknown) {
        if (currentRequestId !== requestIdRef.current) {
          return null
        }

        const message = getApiErrorMessage(err, 'Failed to load projects.')
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
    [onSuccess, onError],
  )

  useEffect(() => {
    if (!enabled) {
      return
    }
    void fetchProjects(query)
  }, [
    enabled,
    query?.title,
    query?.project_id,
    query?.date,
    query?.ascending,
    query?.sort_by,
    fetchProjects,
  ])

  const refetch = useCallback(() => fetchProjects(), [fetchProjects])

  return {
    fetchProjects,
    refetch,
    isLoading,
    isPending: isLoading,
    isSuccess,
    isError: error !== null,
    error,
    data,
    reset,
  }
}

export interface UseProjectByIdOptions {
  /** Whether to automatically fetch when a valid `id` is provided (default: true) */
  enabled?: boolean
  /** Callback fired upon successful fetch */
  onSuccess?: (data: ProjectResponseDTO) => void | Promise<void>
  /** Callback fired when the request fails */
  onError?: (errorMessage: string) => void | Promise<void>
}

export interface UseProjectByIdReturn {
  /** Fetches a single project by ID */
  fetchProjectById: (targetId?: string) => Promise<ProjectResponseDTO | null>
  /** Alias for fetchProjectById using the current hook id */
  refetch: () => Promise<ProjectResponseDTO | null>
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
  /** Project returned by the server, or null */
  data: ProjectResponseDTO | null
  /** Resets the hook state back to initial values */
  reset: () => void
}

/**
 * Hook dedicated to querying a single project by UUID (`GET /projects/:id`).
 */
export function useProjectById(
  id?: string | null,
  options: UseProjectByIdOptions = {},
): UseProjectByIdReturn {
  const { enabled = true, onSuccess, onError } = options

  const [isLoading, setIsLoading] = useState<boolean>(Boolean(enabled && id))
  const [isSuccess, setIsSuccess] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<ProjectResponseDTO | null>(null)

  const requestIdRef = useRef(0)

  const reset = useCallback(() => {
    requestIdRef.current += 1
    setIsLoading(false)
    setIsSuccess(false)
    setError(null)
    setData(null)
  }, [])

  const fetchProjectById = useCallback(
    async (targetId?: string): Promise<ProjectResponseDTO | null> => {
      const resolvedId = targetId ?? id
      if (!resolvedId) {
        setError('Project ID is required.')
        return null
      }

      const currentRequestId = ++requestIdRef.current
      setIsLoading(true)
      setIsSuccess(false)
      setError(null)

      try {
        const result = await getProjectById(resolvedId)
        if (currentRequestId !== requestIdRef.current) {
          return null
        }

        setData(result)
        setIsSuccess(true)

        if (onSuccess) {
          await onSuccess(result)
        }

        return result
      } catch (err: unknown) {
        if (currentRequestId !== requestIdRef.current) {
          return null
        }

        const message = getApiErrorMessage(err, 'Failed to load project details.')
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
    [id, onSuccess, onError],
  )

  useEffect(() => {
    if (!enabled || !id) {
      return
    }
    void fetchProjectById(id)
  }, [enabled, id, fetchProjectById])

  const refetch = useCallback(() => fetchProjectById(), [fetchProjectById])

  return {
    fetchProjectById,
    refetch,
    isLoading,
    isPending: isLoading,
    isSuccess,
    isError: error !== null,
    error,
    data,
    reset,
  }
}
