import { Link } from 'react-router'
import { AlertTriangle, Home } from 'lucide-react'

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 mb-4">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">404 - Page Not Found</h1>
      <p className="mt-2 text-sm text-slate-500 max-w-sm">
        The route you are looking for does not exist or may have been moved.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition"
      >
        <Home className="h-4 w-4" />
        Return Home
      </Link>
    </div>
  )
}
