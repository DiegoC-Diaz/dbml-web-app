import { useState, useMemo } from 'react'
import {
  FolderKanban,
  Plus,
  Sparkles,
  Layers,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { ProjectSearchBar } from './components/ProjectSearchBar'
import { ProjectList } from './components/ProjectList'
import { INITIAL_PROJECTS } from './data/mockProjects'
import { calculateSemanticSimilarity } from './utils/semanticSearch'
import type { Project, ProjectFilter } from './types'

/**
 * HomePage Component
 * 
 * Replaces previous generic dashboard with a full-fledged workspace homepage:
 * - Search bar with semantic similarity matching on project titles and metadata
 * - Advanced filters: Alphabetical (A-Z, Z-A) and Date (Newest/Oldest), plus `from_date`
 * - Clean, accessible list view of all projects the user is currently working on
 * - State managed according to specifications: `search_term` and `filter { ascending, from_date, sortBy }`
 */
export function HomePage() {
  const { user } = useAuth()

  // Project data state
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS)

  // 1. Search term state
  const [searchTerm, setSearchTerm] = useState<string>('')

  // 2. Filter state with required shape: { ascending: boolean, from_date: string | null }
  const [filter, setFilter] = useState<ProjectFilter>({
    ascending: false, // Default: most recent first (or Z-A)
    from_date: null,
    sortBy: 'date',
  })

  // Handlers for toggling stars and opening projects
  const handleToggleStar = (projectId: string) => {
    setProjects((prev) =>
      prev.map((proj) =>
        proj.id === projectId ? { ...proj, stars: proj.stars + 1 } : proj
      )
    )
  }

  const handleOpenProject = (project: Project) => {
    alert(`Abriendo espacio de trabajo para: ${project.title}`)
  }

  const handleResetFilters = () => {
    setSearchTerm('')
    setFilter({
      ascending: false,
      from_date: null,
      sortBy: 'date',
    })
  }

  /**
   * React 19 Best Practice:
   * Compute derived state during render with useMemo instead of synchronizing
   * via useEffect!
   */
  const filteredAndSortedProjects = useMemo(() => {
    // Step 1: Filter by from_date if specified
    let result = projects.filter((project) => {
      if (!filter.from_date) return true
      return (
        project.createdAt >= filter.from_date ||
        project.updatedAt >= filter.from_date
      )
    })

    // Step 2: Filter by semantic similarity if a search term exists
    const trimmedQuery = searchTerm.trim()
    if (trimmedQuery) {
      result = result
        .map((project) => ({
          project,
          similarityScore: calculateSemanticSimilarity(trimmedQuery, project),
        }))
        // Only keep projects that pass semantic threshold (or have similarity > 0.18)
        .filter((item) => item.similarityScore > 0.18)
        .map((item) => item.project)
    }

    // Step 3: Sort by alphabetical or date, ascending or descending
    return [...result].sort((a, b) => {
      if (filter.sortBy === 'alphabetical') {
        const comp = a.title.localeCompare(b.title, 'es', { sensitivity: 'base' })
        return filter.ascending ? comp : -comp
      } else {
        // Sort by updatedAt date
        const timeA = new Date(a.updatedAt).getTime()
        const timeB = new Date(b.updatedAt).getTime()
        return filter.ascending ? timeA - timeB : timeB - timeA
      }
    })
  }, [projects, searchTerm, filter])

  // Overview metrics
  const activeCount = useMemo(
    () => projects.filter((p) => p.status === 'in_progress').length,
    [projects]
  )
  const completedCount = useMemo(
    () => projects.filter((p) => p.status === 'completed').length,
    [projects]
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header Banner & Quick Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            <Sparkles className="h-3.5 w-3.5" />
            Panel de Proyectos DBML
          </div>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Bienvenido, {user?.name || 'Usuario'} 👋
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Gestiona y explora tus esquemas de bases de datos, APIs y proyectos activos.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert('Crear nuevo proyecto')}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Nuevo proyecto</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Proyectos</p>
            <p className="text-xl font-bold text-slate-900">{projects.length}</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">En Desarrollo</p>
            <p className="text-xl font-bold text-slate-900">{activeCount}</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Completados</p>
            <p className="text-xl font-bold text-slate-900">{completedCount}</p>
          </div>
        </div>
      </div>

      {/* Search and Advanced Filters Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <FolderKanban className="h-4 w-4 text-indigo-600" />
          <span>Explorar tus proyectos</span>
        </div>

        <ProjectSearchBar
          searchTerm={searchTerm}
          filter={filter}
          onSearchChange={setSearchTerm}
          onFilterChange={setFilter}
          onResetFilters={handleResetFilters}
          totalCount={projects.length}
          matchedCount={filteredAndSortedProjects.length}
        />
      </div>

      {/* Projects List View */}
      <section aria-label="Lista de proyectos">
        <ProjectList
          projects={filteredAndSortedProjects}
          onOpenProject={handleOpenProject}
          onToggleStar={handleToggleStar}
          onResetFilters={handleResetFilters}
        />
      </section>
    </div>
  )
}
