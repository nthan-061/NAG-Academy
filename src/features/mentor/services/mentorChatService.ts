import { supabase } from '@/lib/supabase'
import type {
  MentorChatMessage,
  MentorChatResponse,
  MentorInsight,
  MentorPerformanceAnalysis,
  MentorRecommendation,
  UserLearningProfile,
} from '../types'

interface SendMentorMessagePayload {
  message: string
  history: MentorChatMessage[]
  profile: UserLearningProfile
  analysis: MentorPerformanceAnalysis
  insights: MentorInsight[]
  recommendations: MentorRecommendation[]
}

export async function sendMentorMessage({
  message,
  history,
  profile,
  analysis,
  insights,
  recommendations,
}: SendMentorMessagePayload): Promise<MentorChatResponse> {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.access_token) {
    throw new Error('Sessao invalida. Faca login novamente para conversar com o mentor.')
  }

  const response = await fetch('/api/mentor-chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      message,
      history: history.slice(-12).map((item) => ({
        role: item.role,
        content: item.content,
      })),
      profile,
      analysis,
      insights,
      recommendations,
    }),
  })

  const json = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(json?.error ?? 'Nao foi possivel obter uma resposta do mentor.')
  }

  return json as MentorChatResponse
}
