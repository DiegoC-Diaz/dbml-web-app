export default interface ProjectResponseDTO {
  id: string
  ownerUserId: string
  title: string
  description: string | null
  createdBy: string
  createdAt: string
  updatedAt: string | null
  isActive: boolean
  currentDbml: string
  layoutMetadata: Record<string, unknown> | null
}

export type ProjectsResponseDTO = ProjectResponseDTO[]

export type { ProjectResponseDTO }
