import { useState } from 'react'
import {
  Search,
  X,
  SlidersHorizontal,
  ArrowDownAZ,
  ArrowUpAZ,
  Calendar,
  Sparkles,
  RotateCcw,
} from 'lucide-react'
import type { ProjectFilter } from '../types'

export interface ProjectSearchBarProps {
  searchTerm: string
  filter: ProjectFilter
  onSearchChange: (value: string) => void
  onFilterChange: (newFilter: ProjectFilter) => void
  onResetFilters: () => void
  totalCount: number
  matchedCount: number
}

/**
 * ProjectSearchBar Component
 * Handles search input with semantic similarity detection and advanced sorting/date filters.
 */
export function ProjectSearchBar({
  searchTerm,
  filter,
  onSearchChange,
  onFilterChange,
  onResetFilters,
  totalCount,
  matchedCount,
}: ProjectSearchBarProps) {
  const [showFiltersPanel, setShowFiltersPanel] = useState(false)

  // Quick helper to update a single key of the filter state
  const handleUpdateFilter = <K extends keyof ProjectFilter>(
    key: K,
    value: ProjectFilter[K]
  ) => {
    onFilterChange({
      ...filter,
      [key]: value,
    })
  }

  const hasActiveFilters =
    searchTerm.trim() !== '' ||
    filter.from_date !== null ||
    filter.sortBy !== 'date' ||
    filter.ascending !== false

  return (
    <div className="space-y-3">
      {/* Search Input Bar */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por título o concepto semántico (ej: auth, database, pagos, api)..."
            className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 shadow-sm"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
              title="Borrar búsqueda"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Toggle Advanced Filters Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowFiltersPanel(!showFiltersPanel)}
            className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-medium transition shadow-sm ${
              showFiltersPanel || filter.from_date !== null
                ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filtros avanzados</span>
            {filter.from_date && (
              <span className="flex h-2 w-2 rounded-full bg-indigo-600" />
            )}
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition shadow-sm"
              title="Restablecer todos los filtros"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Limpiar</span>
            </button>
          )}
        </div>
      </div>

      {/* Semantic Indicator & Counts */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-slate-500">
        <div className="flex items-center gap-1.5 font-medium text-slate-600">
          <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
          <span>Búsqueda semántica inteligente activa</span>
          {searchTerm && (
            <span className="text-slate-400">
              — {matchedCount} de {totalCount} proyectos encontrados
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span>Orden:</span>
          <span className="font-semibold text-slate-700">
            {filter.sortBy === 'alphabetical' ? 'Alfabético' : 'Fecha de actualización'} (
            {filter.ascending ? 'Ascendente' : 'Descendente'})
          </span>
        </div>
      </div>

      {/* Advanced Filters Drawer / Card */}
      {showFiltersPanel && (
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 shadow-sm animate-in fade-in duration-150">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* 1. Sort By: Alphabetical vs Date */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Ordenar por
              </label>
              <div className="mt-1.5 grid grid-cols-2 gap-1 rounded-lg border border-slate-200 bg-white p-1">
                <button
                  type="button"
                  onClick={() => handleUpdateFilter('sortBy', 'alphabetical')}
                  className={`flex items-center justify-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
                    filter.sortBy === 'alphabetical'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <ArrowDownAZ className="h-3.5 w-3.5" />
                  Alfabético
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateFilter('sortBy', 'date')}
                  className={`flex items-center justify-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
                    filter.sortBy === 'date'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Calendar className="h-3.5 w-3.5" />
                  Fecha
                </button>
              </div>
            </div>

            {/* 2. Order Direction: Ascending vs Descending */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Dirección
              </label>
              <div className="mt-1.5 grid grid-cols-2 gap-1 rounded-lg border border-slate-200 bg-white p-1">
                <button
                  type="button"
                  onClick={() => handleUpdateFilter('ascending', true)}
                  className={`flex items-center justify-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
                    filter.ascending === true
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <ArrowUpAZ className="h-3.5 w-3.5" />
                  {filter.sortBy === 'alphabetical' ? 'A → Z' : 'Más antiguo'}
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateFilter('ascending', false)}
                  className={`flex items-center justify-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
                    filter.ascending === false
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <ArrowDownAZ className="h-3.5 w-3.5" />
                  {filter.sortBy === 'alphabetical' ? 'Z → A' : 'Más reciente'}
                </button>
              </div>
            </div>

            {/* 3. From Date Filter */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Desde la fecha (from_date)
              </label>
              <div className="relative mt-1.5">
                <input
                  type="date"
                  value={filter.from_date || ''}
                  onChange={(e) =>
                    handleUpdateFilter('from_date', e.target.value || null)
                  }
                  className="w-full rounded-lg border border-slate-200 bg-white py-1.5 px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                {filter.from_date && (
                  <button
                    type="button"
                    onClick={() => handleUpdateFilter('from_date', null)}
                    className="absolute inset-y-0 right-2 flex items-center text-slate-400 hover:text-slate-600"
                    title="Quitar filtro de fecha"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
