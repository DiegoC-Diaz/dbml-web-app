/**
 * Types and interfaces for the Projects module and Advanced Search
 */

export type ProjectStatus = 'in_progress' | 'review' | 'completed' | 'planning'

export interface Project {
  id: string
  title: string
  description: string
  category: string
  status: ProjectStatus
  createdAt: string // ISO date string YYYY-MM-DD
  updatedAt: string // ISO date string YYYY-MM-DD
  stars: number
  collaborators: {
    name: string
    avatar: string
  }[]
  tags: string[]
  semanticKeywords: string[]
}

export type SortByField = 'alphabetical' | 'date'

export interface ProjectFilter {
  ascending: boolean
  from_date: string | null
  sortBy: SortByField
}
