import { api } from '../../../lib/http/client'
import type { ProjectQueryDTO } from '../dtos/project.query.dto'
import type { ProjectResponseDTO, ProjectsResponseDTO } from '../dtos/project.response.dto'

/**
 * Obtiene todos los proyectos activos del usuario autenticado (`GET /projects`).
 */
export async function getProjects(
  projectQueryDTO?: ProjectQueryDTO,
): Promise<ProjectsResponseDTO> {
  const response = await api.get<ProjectsResponseDTO>('/projects', {
    params: projectQueryDTO,
  })
  return response.data
}

/**
 * Obtiene un proyecto por su ID (`GET /projects/:id`).
 */
export async function getProjectById(id: string): Promise<ProjectResponseDTO> {
  const response = await api.get<ProjectResponseDTO>(`/projects/${id}`)
  return response.data
}
