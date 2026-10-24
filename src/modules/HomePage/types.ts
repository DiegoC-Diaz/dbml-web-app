/**
 * Types and interfaces for the Projects module and Advanced Search
 */

export type ProjectStatus = 'in_progress' | 'review' | 'completed' | 'planning'

export interface Project {
  id: string
  title: string
  description: string | null
  createdAt: string
  updatedAt: string | null
  ownerUserId?: string
  createdBy?: string
  isActive?: boolean
  currentDbml?: string
  layoutMetadata?: Record<string, unknown> | null
  category?: string
  status?: ProjectStatus
  stars?: number
  collaborators?: {
    name: string
    avatar: string
  }[]
  tags?: string[]
  semanticKeywords?: string[]
}

export type SortByField = 'alphabetical' | 'date'

export interface ProjectFilter {
  ascending: boolean
  from_date: string | null
  sortBy: SortByField
}
