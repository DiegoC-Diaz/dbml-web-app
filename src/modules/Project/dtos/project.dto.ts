import { z } from 'zod'

export const createProjectSchema = z.object({
  title: z.string().min(1).max(150),
  description: z.string().max(500).nullable().optional(),
  currentDbml: z.string().optional(),
  layoutMetadata: z.record(z.string(), z.unknown()).nullable().optional(),
})

export const cloneProjectSchema = z.object({
  title: z.string().min(1).max(150).optional(),
  description: z.string().max(500).nullable().optional(),
})

export const updateProjectDetailsSchema = z.object({
  title: z.string().min(1).max(150).optional(),
  description: z.string().max(500).nullable().optional(),
})

export const updateProjectDbmlSchema = z.object({
  currentDbml: z.string(),
  layoutMetadata: z.record(z.string(), z.unknown()).nullable().optional(),
})

export const updateProjectLayoutSchema = z.object({
  layoutMetadata: z.record(z.string(), z.unknown()).nullable(),
})

export type CreateProjectDTO = z.infer<typeof createProjectSchema>
export type CloneProjectDTO = z.infer<typeof cloneProjectSchema>
export type UpdateProjectDetailsDTO = z.infer<typeof updateProjectDetailsSchema>
export type UpdateProjectDbmlDTO = z.infer<typeof updateProjectDbmlSchema>
export type UpdateProjectLayoutDTO = z.infer<typeof updateProjectLayoutSchema>
