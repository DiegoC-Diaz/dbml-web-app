import { api } from '../../../lib/http/client'
import type { CreateProjectDTO, CloneProjectDTO } from '../dtos/project.dto'
import type { ProjectResponseDTO } from '../dtos/project.response.dto'

export type { CreateProjectDTO, CloneProjectDTO, ProjectResponseDTO }

/**
 * Crea un nuevo proyecto DBML (`POST /projects`).
 */
export async function createProject(
  createProjectDTO: CreateProjectDTO,
): Promise<ProjectResponseDTO> {
  const response = await api.post<ProjectResponseDTO>('/projects', createProjectDTO)
  return response.data
}

/**
 * Clona / copia un proyecto existente (`POST /projects/:id/clone`).
 */
export async function cloneProject(
  id: string,
  cloneProjectDTO?: CloneProjectDTO,
): Promise<ProjectResponseDTO> {
  const response = await api.post<ProjectResponseDTO>(
    `/projects/${id}/clone`,
    cloneProjectDTO ?? {},
  )
  return response.data
}
