import { useAuth } from '@/hooks/useAuth'

export function useIsAdmin() {
  const { role, loading } = useAuth()

  return {
    isAdmin: role === 'admin',
    loading,
  }
}
