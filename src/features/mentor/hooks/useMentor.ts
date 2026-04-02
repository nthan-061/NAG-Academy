import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { analyzePerformance, buildUserProfile, generateInsights, getMentorData, recommendNextSteps, sendMentorMessage, upsertMentorContext } from '../services'
import type {
  MentorChatMessage,
  MentorDataSnapshot,
  MentorInsight,
  MentorPerformanceAnalysis,
  MentorRecommendation,
  MentorUserContext,
  UserLearningProfile,
} from '../types'

interface UseMentorState {
  profile: UserLearningProfile | null
  analysis: MentorPerformanceAnalysis | null
  insights: MentorInsight[]
  recommendations: MentorRecommendation[]
  messages: MentorChatMessage[]
  mentorContext: MentorUserContext | null
  loading: boolean
  sending: boolean
  error: string | null
  refreshMentor: () => Promise<void>
  sendMessage: (message: string) => Promise<void>
  acknowledgeInsight: (insightId: string) => void
  saveContext: (payload: Partial<MentorUserContext>) => Promise<void>
}

function mergeContext(
  current: MentorUserContext | null,
  next: Partial<MentorUserContext> | null,
  userId: string,
): MentorUserContext | null {
  if (!next && !current) return null

  return {
    user_id: current?.user_id ?? userId,
    goal: next?.goal ?? current?.goal ?? null,
    experience_level: next?.experience_level ?? current?.experience_level ?? null,
    use_case: next?.use_case ?? current?.use_case ?? null,
    ad_budget_range: next?.ad_budget_range ?? current?.ad_budget_range ?? null,
    prior_experience: next?.prior_experience ?? current?.prior_experience ?? null,
    declared_challenges: next?.declared_challenges ?? current?.declared_challenges ?? [],
    notes: next?.notes ?? current?.notes ?? null,
    created_at: current?.created_at ?? new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

export function useMentor(): UseMentorState {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserLearningProfile | null>(null)
  const [analysis, setAnalysis] = useState<MentorPerformanceAnalysis | null>(null)
  const [insights, setInsights] = useState<MentorInsight[]>([])
  const [recommendations, setRecommendations] = useState<MentorRecommendation[]>([])
  const [messages, setMessages] = useState<MentorChatMessage[]>([])
  const [mentorContext, setMentorContext] = useState<MentorUserContext | null>(null)
  const [dismissedInsightIds, setDismissedInsightIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const hasLoadedRef = useRef(false)

  const computeMentorState = useCallback(async (nextSnapshot: MentorDataSnapshot) => {
    const builtProfile = await buildUserProfile(nextSnapshot)
    const performance = analyzePerformance(builtProfile)
    const nextInsights = generateInsights(builtProfile, performance)
    const nextRecommendations = recommendNextSteps(builtProfile, performance)

    setProfile(builtProfile)
    setAnalysis(performance)
    setInsights(nextInsights)
    setRecommendations(nextRecommendations)
    setMessages(nextSnapshot.chatHistory)
    setMentorContext(nextSnapshot.mentorContext)
  }, [])

  const refreshMentor = useCallback(async () => {
    if (!user?.id) {
      setLoading(false)
      setError('Usuario nao autenticado.')
      return
    }

    const isFirstLoad = !hasLoadedRef.current
    if (isFirstLoad) {
      setLoading(true)
    }
    setError(null)

    try {
      const nextSnapshot = await getMentorData(user.id)
      if (!nextSnapshot) {
        throw new Error('Nao foi possivel montar o diagnostico do mentor.')
      }

      await computeMentorState(nextSnapshot)
      hasLoadedRef.current = true
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Falha ao carregar o mentor.')
    } finally {
      if (isFirstLoad) {
        setLoading(false)
      }
    }
  }, [computeMentorState, user?.id])

  useEffect(() => {
    void refreshMentor()
  }, [refreshMentor])

  const saveContext = useCallback(async (payload: Partial<MentorUserContext>) => {
    if (!user?.id) return

    await upsertMentorContext(user.id, payload)
    setMentorContext((current) => mergeContext(current, payload, user.id))
  }, [user?.id])

  const sendMessage = useCallback(async (message: string) => {
    if (!user?.id || !profile || !analysis) {
      throw new Error('O mentor ainda nao esta pronto para conversar.')
    }

    const trimmed = message.trim()
    if (!trimmed) return

    setSending(true)
    setError(null)

    const optimisticMessage: MentorChatMessage = {
      id: `local-${Date.now()}`,
      user_id: user.id,
      role: 'user',
      content: trimmed,
      metadata: {},
      created_at: new Date().toISOString(),
    }

    setMessages((current) => [...current, optimisticMessage])

    try {
      const history = [...messages, optimisticMessage]

      const response = await sendMentorMessage({
        message: trimmed,
        history,
        profile,
        analysis,
        insights,
        recommendations,
      })

      if (response.capturedContext) {
        setMentorContext((current) => mergeContext(current, response.capturedContext, user.id))
      }

      setMessages((current) => [...current, response.reply])
    } catch (nextError) {
      setMessages((current) => current.filter((item) => item.id !== optimisticMessage.id))
      setError(nextError instanceof Error ? nextError.message : 'Falha ao enviar a mensagem para o mentor.')
      throw nextError
    } finally {
      setSending(false)
    }
  }, [analysis, insights, messages, profile, recommendations, user?.id])

  const visibleInsights = useMemo(
    () => insights.filter((item) => !dismissedInsightIds.includes(item.id)),
    [dismissedInsightIds, insights],
  )

  const acknowledgeInsight = useCallback((insightId: string) => {
    setDismissedInsightIds((current) => (
      current.includes(insightId) ? current : [...current, insightId]
    ))
  }, [])

  return {
    profile,
    analysis,
    insights: visibleInsights,
    recommendations,
    messages,
    mentorContext,
    loading,
    sending,
    error,
    refreshMentor,
    sendMessage,
    acknowledgeInsight,
    saveContext,
  }
}
