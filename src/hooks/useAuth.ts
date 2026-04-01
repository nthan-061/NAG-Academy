import { useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthState {
  session: Session | null
  user: User | null
  loading: boolean
  isPasswordRecovery: boolean
  signOut: () => Promise<{ error: Error | null }>
}

export function useAuth(): AuthState {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false)

  useEffect(() => {
    // Carrega sessão inicial
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    // Escuta mudanças de auth
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      setLoading(false)

      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true)
      } else if (event === 'SIGNED_IN' && isPasswordRecovery) {
        // Mantém o estado de recovery até o usuário salvar a nova senha
      } else if (event === 'SIGNED_OUT') {
        setIsPasswordRecovery(false)
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [isPasswordRecovery])

  return {
    session,
    user: session?.user ?? null,
    loading,
    isPasswordRecovery,
    signOut: () => supabase.auth.signOut(),
  }
}
