import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import type { UserRole } from '@/features/auth/types'

interface RequireAdminRouteProps {
  role: UserRole | null
  loading: boolean
  children: ReactNode
}

export function RequireAdminRoute({ role, loading, children }: RequireAdminRouteProps) {
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-text-secondary">
        Validando permissoes...
      </div>
    )
  }

  if (role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
