import {
  FolderGit2,
  Calendar,
  Clock,
  Star,
  ExternalLink,
  Tag,
  AlertCircle,
} from 'lucide-react'
import type { Project, ProjectStatus } from '../types'

export interface ProjectListProps {
  projects: Project[]
  onOpenProject?: (project: Project) => void
  onToggleStar?: (projectId: string) => void
  onResetFilters?: () => void
}

const STATUS_CONFIG: Record<
  ProjectStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  in_progress: {
    label: 'En progreso',
    bg: 'bg-blue-50 border-blue-200',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
  },
  review: {
    label: 'En revisión',
    bg: 'bg-amber-50 border-amber-200',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
  },
  completed: {
    label: 'Completado',
    bg: 'bg-emerald-50 border-emerald-200',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
  },
  planning: {
    label: 'Planificación',
    bg: 'bg-purple-50 border-purple-200',
    text: 'text-purple-700',
    dot: 'bg-purple-500',
  },
}

/**
 * ProjectList Component
 * Displays user projects in a clean, informative list view format.
 */
export function ProjectList({
  projects,
  onOpenProject,
  onToggleStar,
  onResetFilters,
}: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-slate-800">
          No se encontraron proyectos coincidentes
        </h3>
        <p className="mt-1 text-sm text-slate-500 max-w-sm">
          Intenta ajustar los términos de búsqueda o cambiar los filtros de fecha y ordenamiento.
        </p>
        {onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="mt-5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition"
          >
            Restablecer filtros
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
      {projects.map((project) => {
        const statusMeta = STATUS_CONFIG[project.status]

        return (
          <article
            key={project.id}
            className="group flex flex-col gap-4 p-5 transition hover:bg-slate-50/70 md:flex-row md:items-center md:justify-between"
          >
            {/* Left: Icon, Title, Description, and Tags */}
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition">
                <FolderGit2 className="h-5 w-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition truncate">
                    {project.title}
                  </h3>

                  {/* Status Badge */}
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusMeta.bg} ${statusMeta.text}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${statusMeta.dot}`} />
                    {statusMeta.label}
                  </span>

                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs font-medium text-slate-500">
                    {project.category}
                  </span>
                </div>

                <p className="mt-1 text-sm text-slate-600 line-clamp-2">
                  {project.description}
                </p>

                {/* Metadata tags and dates */}
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span>Creado: {project.createdAt}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span className="font-medium text-slate-600">
                      Actualizado: {project.updatedAt}
                    </span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap items-center gap-1.5 ml-1">
                    <Tag className="h-3 w-3 text-slate-400" />
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Collaborators, Stars, Action */}
            <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-3 md:border-t-0 md:pt-0 shrink-0">
              {/* Collaborators Avatars */}
              <div className="flex -space-x-1.5 overflow-hidden">
                {project.collaborators.map((c) => (
                  <div
                    key={c.name}
                    title={c.name}
                    className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-indigo-100 text-2xs font-bold text-indigo-700 shadow-xs"
                  >
                    {c.avatar}
                  </div>
                ))}
              </div>

              {/* Star Button */}
              <button
                type="button"
                onClick={() => onToggleStar?.(project.id)}
                className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
                title="Favorito"
              >
                <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-400" />
                <span>{project.stars}</span>
              </button>

              {/* Open Project CTA */}
              <button
                type="button"
                onClick={() => onOpenProject?.(project)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-600 transition"
              >
                <span>Abrir</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </div>
          </article>
        )
      })}
    </div>
  )
}
