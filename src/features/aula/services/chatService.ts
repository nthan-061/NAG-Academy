import { supabase } from '@/lib/supabase'
import type { AulaChatMessage } from '../types'

export async function askAulaMentor(aulaId: string, mensagem: string, historico: AulaChatMessage[]) {
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.access_token) {
    throw new Error('Sua sessao expirou. Faca login novamente.')
  }

  const response = await fetch('/api/chat-aula', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      aula_id: aulaId,
      mensagem,
      historico: historico.filter((message) => message.role !== 'error'),
    }),
  })

  const payload = await response.json().catch(() => null) as { resposta?: string; error?: string } | null

  if (!response.ok || !payload?.resposta) {
    throw new Error(payload?.error ?? 'Nao foi possivel responder. Tente novamente.')
  }

  return payload.resposta
}
