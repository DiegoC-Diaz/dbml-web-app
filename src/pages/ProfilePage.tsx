import { useAuth } from '../context/AuthContext'
import { User, Mail, Shield, CheckCircle } from 'lucide-react'

export function ProfilePage() {
  const { user } = useAuth()

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">User Profile</h1>
        <p className="text-sm text-slate-500">
          Manage your personal details and account settings
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-slate-100">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700 text-2xl font-bold">
            {user?.name?.slice(0, 2).toUpperCase() || 'JD'}
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200">
              <CheckCircle className="h-3 w-3" />
              Verified Account
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase">
              <User className="h-4 w-4" /> Full Name
            </div>
            <p className="mt-1 text-sm font-medium text-slate-900">{user?.name}</p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase">
              <Mail className="h-4 w-4" /> Email Address
            </div>
            <p className="mt-1 text-sm font-medium text-slate-900">{user?.email}</p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase">
              <Shield className="h-4 w-4" /> Role
            </div>
            <p className="mt-1 text-sm font-medium text-slate-900 capitalize">{user?.role}</p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase">
              Account ID
            </div>
            <p className="mt-1 text-sm font-mono text-slate-900">{user?.id}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
