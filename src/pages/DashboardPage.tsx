import { HomePage } from '../modules/HomePage/HomePage'

/**
 * DashboardPage acts as the main authenticated dashboard route ('/'),
 * rendering the HomePage module with project list and advanced semantic search.
 */
export function DashboardPage() {
  return <HomePage />
}
