import { useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { AuthState, UserRole } from '@/features/auth/types'

function normalizeRole(value: unknown): UserRole | null {
  return value === 'admin' || value === 'user' ? value : null
}

function getRoleFromClaims(user: User | null): UserRole | null {
  if (!user) return null

  return normalizeRole(user.app_metadata?.role) ?? normalizeRole(user.user_metadata?.role)
}

async function fetchProfileRole(userId: string): Promise<UserRole | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    console.error('[useAuth] failed to fetch profile role:', error.message)
    return null
  }

  return normalizeRole(data?.role) ?? 'user'
}

export function useAuth(): AuthState {
  const [session, setSession] = useState<Session | null>(null)
  const [role, setRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false)

  useEffect(() => {
    let active = true

    async function syncRole(user: User | null) {
      if (!user) {
        if (active) setRole(null)
        return
      }

      const claimedRole = getRoleFromClaims(user)
      if (active && claimedRole) {
        setRole(claimedRole)
      }

      const profileRole = await fetchProfileRole(user.id)
      if (!active) return

      setRole(profileRole ?? claimedRole ?? 'user')
    }

    async function loadInitialState() {
      const { data } = await supabase.auth.getSession()
      if (!active) return

      setSession(data.session)
      setIsPasswordRecovery(false)
      await syncRole(data.session?.user ?? null)

      if (active) {
        setLoading(false)
      }
    }

    void loadInitialState()

    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession)

      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true)
      }

      if (event === 'SIGNED_OUT') {
        setIsPasswordRecovery(false)
        setRole(null)
      }

      setLoading(false)
      void syncRole(nextSession?.user ?? null)
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  return {
    session,
    user: session?.user ?? null,
    role,
    loading,
    isPasswordRecovery,
    signOut: () => supabase.auth.signOut(),
  }
}
