import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types'

export function useProfile(user?: User | null) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  // When user is explicitly provided, use its id; otherwise resolve from auth
  const explicitId = user !== undefined ? (user?.id ?? null) : undefined

  useEffect(() => {
    let active = true

    async function load() {
      let uid: string | null

      if (explicitId !== undefined) {
        uid = explicitId
      } else {
        const { data } = await supabase.auth.getUser()
        uid = data.user?.id ?? null
      }

      if (!uid) {
        if (active) { setProfile(null); setLoading(false) }
        return
      }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .single()

      if (active) {
        setProfile(data)
        setLoading(false)
      }
    }

    load()
    return () => { active = false }
  }, [explicitId])

  return { profile, loading }
}
