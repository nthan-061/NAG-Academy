import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getAulaPageData } from '../services/aulaService'
import { askAulaMentor } from '../services/chatService'
import { toggleAulaAssistida } from '../services/progressoService'
import { appendChatMessage } from '../utils'
import type { AulaChatMessage, AulaPageData, AulaTab } from '../types'

export function useAula(aulaId?: string) {
  const [data, setData] = useState<AulaPageData | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<AulaTab>('resumo')
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState<AulaChatMessage[]>([])
  const [chatLoading, setChatLoading] = useState(false)
  const [togglingProgress, setTogglingProgress] = useState(false)

  useEffect(() => {
    if (!aulaId) return
    const resolvedAulaId = aulaId

    let active = true

    async function load() {
      setLoading(true)

      const { data: { user } } = await supabase.auth.getUser()
      const nextUserId = user?.id ?? null
      const aulaData = await getAulaPageData(resolvedAulaId, nextUserId)

      if (!active) return

      setUserId(nextUserId)
      setData(aulaData)
      setLoading(false)
    }

    void load()

    return () => {
      active = false
    }
  }, [aulaId])

  async function handleToggleAssistida() {
    if (!aulaId || !userId || !data || togglingProgress) return

    setTogglingProgress(true)

    try {
      const progresso = await toggleAulaAssistida(userId, aulaId, data.progresso)
      setData({ ...data, progresso })
    } finally {
      setTogglingProgress(false)
    }
  }

  async function handleSendChat() {
    if (!data?.aula || chatLoading) return

    const content = chatInput.trim()
    if (!content) return

    const nextHistory = appendChatMessage(chatMessages, { role: 'user', content })
    setChatInput('')
    setChatMessages(nextHistory)
    setChatLoading(true)

    try {
      const resposta = await askAulaMentor(data.aula.id, content, chatMessages)
      setChatMessages(appendChatMessage(nextHistory, { role: 'assistant', content: resposta }))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Nao foi possivel responder.'
      setChatMessages(appendChatMessage(nextHistory, { role: 'error', content: message }))
    } finally {
      setChatLoading(false)
    }
  }

  return {
    data,
    userId,
    loading,
    tab,
    setTab,
    chatInput,
    setChatInput,
    chatMessages,
    chatLoading,
    togglingProgress,
    handleSendChat,
    handleToggleAssistida,
  }
}
