import { useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { AuthState, UserRole } from '@/features/auth/types'

const AUTH_BOOTSTRAP_GUARD_MS = 1200

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
    let initialStateResolved = false
    let bootstrapGuard: number | null = null

    function finishLoading(force = false) {
      if (!active) return
      if (force || !initialStateResolved) {
        initialStateResolved = true
        setLoading(false)
      }

      if (bootstrapGuard !== null) {
        window.clearTimeout(bootstrapGuard)
        bootstrapGuard = null
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

    async function applyAuthState(nextSession: Session | null, options?: { isPasswordRecovery?: boolean }) {
      if (!active) return

      setSession(nextSession)
      setIsPasswordRecovery(options?.isPasswordRecovery ?? false)

      if (!nextSession) {
        setRole(null)
      }

      finishLoading()
      await syncRole(nextSession?.user ?? null)
    }

    async function bootstrapSession() {
      try {
        const { data } = await supabase.auth.getSession()
        await applyAuthState(data.session)
      } catch (error) {
        console.error('[useAuth] failed to bootstrap session:', error)

        if (!active) return

        setSession(null)
        setRole(null)
        setIsPasswordRecovery(false)
      } finally {
        finishLoading()
      }
    }

    bootstrapGuard = window.setTimeout(() => {
      console.warn('[useAuth] auth bootstrap guard released the splash screen')
      finishLoading(true)
    }, AUTH_BOOTSTRAP_GUARD_MS)

    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      void applyAuthState(nextSession, {
        isPasswordRecovery: event === 'PASSWORD_RECOVERY',
      })
    })

    void bootstrapSession()

    return () => {
      active = false
      if (bootstrapGuard !== null) {
        window.clearTimeout(bootstrapGuard)
      }
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
