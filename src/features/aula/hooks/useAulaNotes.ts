import { useEffect, useRef, useState } from 'react'
import { getAulaNotes, saveAulaNotes } from '../services/progressoService'

export function useAulaNotes(aulaId: string, userId: string | null) {
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!userId) return

    let active = true

    void getAulaNotes(userId, aulaId).then((value) => {
      if (active) setNotes(value)
    })

    return () => {
      active = false
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [aulaId, userId])

  function handleChange(value: string) {
    setNotes(value)

    if (!userId) return
    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(async () => {
      setSaving(true)
      await saveAulaNotes(userId, aulaId, value)
      setSaving(false)
    }, 800)
  }

  return {
    notes,
    saving,
    handleChange,
  }
}
