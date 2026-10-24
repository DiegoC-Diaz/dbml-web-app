import { api } from '../../../lib/http/client'
import type {
  UpdateProjectDetailsDTO,
  UpdateProjectDbmlDTO,
  UpdateProjectLayoutDTO,
} from '../dtos/project.dto'
import type { ProjectResponseDTO } from '../dtos/project.response.dto'

export type {
  UpdateProjectDetailsDTO,
  UpdateProjectDbmlDTO,
  UpdateProjectLayoutDTO,
  ProjectResponseDTO,
}

/**
 * Actualiza los datos generales del proyecto: título y descripción (`PATCH /projects/:id/details`).
 */
export async function updateProjectDetails(
  id: string,
  updateDetailsDTO: UpdateProjectDetailsDTO,
): Promise<ProjectResponseDTO> {
  const response = await api.patch<ProjectResponseDTO>(
    `/projects/${id}/details`,
    updateDetailsDTO,
  )
  return response.data
}

/**
 * Actualiza el código DBML y opcionalmente el layout del proyecto (`PATCH /projects/:id/dbml`).
 */
export async function updateProjectDbml(
  id: string,
  updateDbmlDTO: UpdateProjectDbmlDTO,
): Promise<ProjectResponseDTO> {
  const response = await api.patch<ProjectResponseDTO>(
    `/projects/${id}/dbml`,
    updateDbmlDTO,
  )
  return response.data
}

/**
 * Actualiza únicamente el layout visual del diagrama ER (`PATCH /projects/:id/layout`).
 */
export async function updateProjectLayout(
  id: string,
  updateLayoutDTO: UpdateProjectLayoutDTO,
): Promise<ProjectResponseDTO> {
  const response = await api.patch<ProjectResponseDTO>(
    `/projects/${id}/layout`,
    updateLayoutDTO,
  )
  return response.data
}
