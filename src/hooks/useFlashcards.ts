import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const MAX_FLASHCARD_REVIEWS = 3

export function useFlashcards() {
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const hoje = new Date().toISOString().split('T')[0]
      const { count } = await supabase
        .from('flashcards')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .lt('repeticoes', MAX_FLASHCARD_REVIEWS)
        .lte('proxima_revisao', hoje)
      setPendingCount(count ?? 0)
    }
    load()
  }, [])

  return { pendingCount }
}
