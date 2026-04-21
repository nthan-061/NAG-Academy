import { useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { AuthState, UserRole } from '@/features/auth/types'

const AUTH_BOOTSTRAP_TIMEOUT_MS = 10000

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

    function finishLoading() {
      if (active) {
        setLoading(false)
      }
    }

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

    async function getSessionWithTimeout() {
      return await Promise.race([
        supabase.auth.getSession(),
        new Promise<never>((_, reject) => {
          window.setTimeout(() => {
            reject(new Error('Timed out while restoring the auth session.'))
          }, AUTH_BOOTSTRAP_TIMEOUT_MS)
        }),
      ])
    }

    async function loadInitialState() {
      try {
        const { data } = await getSessionWithTimeout()
        if (!active) return

        setSession(data.session)
        setIsPasswordRecovery(false)
        await syncRole(data.session?.user ?? null)
      } catch (error) {
        console.error('[useAuth] failed to restore session:', error)

        if (!active) return

        setSession(null)
        setRole(null)
        setIsPasswordRecovery(false)
      } finally {
        finishLoading()
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

      finishLoading()
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
