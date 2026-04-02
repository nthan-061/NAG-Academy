import { supabase } from '@/lib/supabase'
import { MENTOR_TOPIC_FALLBACK } from '../constants'
import type {
  MentorChatMessage,
  MentorDataSnapshot,
  MentorProgressEntry,
  MentorQuizAnswer,
  MentorResolvedLesson,
  MentorUserContext,
} from '../types'

interface RawTrilhaRelation {
  id: string
  titulo: string
  ordem: number | null
  publicada?: boolean
}

interface RawModuloRelation {
  id: string
  titulo: string
  ordem: number | null
  trilhas?: RawTrilhaRelation | RawTrilhaRelation[] | null
}

interface RawLessonRelation {
  id: string
  titulo: string
  topicos?: unknown
  ordem: number | null
  modulos?: RawModuloRelation | RawModuloRelation[] | null
}

interface RawProgressRow {
  id: string
  user_id: string
  aula_id: string
  assistida: boolean
  quiz_completado: boolean
  acertos: number
  total_perguntas: number
  percentual_acerto: number | null
  xp_ganho: number
  notas?: string | null
  completed_at: string | null
  aulas?: RawLessonRelation | null
}

interface RawQuestionRelation {
  id: string
  pergunta: string
  topico: string | null
  aula_id: string
  explicacao: string
  aulas?: RawLessonRelation | null
}

interface RawAnswerRow {
  id: string
  correta: boolean
  created_at: string
  quiz_perguntas?: RawQuestionRelation | RawQuestionRelation[] | null
}

function getFirstRelation<T>(value?: T | T[] | null): T | null {
  if (Array.isArray(value)) return value[0] ?? null
  return value ?? null
}

function resolveLesson(value: RawLessonRelation | null | undefined): MentorResolvedLesson | null {
  if (!value?.id) return null

  const modulo = getFirstRelation(value.modulos)
  const trilha = getFirstRelation(modulo?.trilhas)

  return {
    id: value.id,
    titulo: value.titulo,
    topicos: Array.isArray(value.topicos) ? value.topicos.filter((item): item is string => typeof item === 'string') : [],
    ordem: value.ordem ?? 0,
    modulo: modulo
      ? {
          id: modulo.id,
          titulo: modulo.titulo,
          ordem: modulo.ordem ?? 0,
        }
      : null,
    trilha: trilha
      ? {
          id: trilha.id,
          titulo: trilha.titulo,
          ordem: trilha.ordem ?? 0,
        }
      : null,
  }
}

function normalizeProgress(rows: RawProgressRow[]): MentorProgressEntry[] {
  return rows.map((row) => ({
    ...row,
    aula: resolveLesson(row.aulas),
  }))
}

function normalizeAnswers(rows: RawAnswerRow[]): MentorQuizAnswer[] {
  return rows.map((row) => {
    const pergunta = getFirstRelation(row.quiz_perguntas)
    const aula = resolveLesson(pergunta?.aulas)

    return {
      id: row.id,
      correta: row.correta,
      created_at: row.created_at,
      pergunta: {
        id: pergunta?.id ?? row.id,
        pergunta: pergunta?.pergunta ?? '',
        topico: pergunta?.topico ?? MENTOR_TOPIC_FALLBACK,
        aula_id: pergunta?.aula_id ?? '',
        explicacao: pergunta?.explicacao ?? '',
      },
      aula,
    }
  })
}

export async function getMentorContext(userId: string): Promise<MentorUserContext | null> {
  const { data, error } = await supabase
    .from('mentor_user_context')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    console.error('[mentor] failed to load mentor context:', error.message)
    return null
  }

  return data
}

export async function getMentorChatHistory(userId: string, limit = 20): Promise<MentorChatMessage[]> {
  const { data, error } = await supabase
    .from('mentor_chat_messages')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(limit)

  if (error) {
    console.error('[mentor] failed to load chat history:', error.message)
    return []
  }

  return data ?? []
}

export async function upsertMentorContext(
  userId: string,
  payload: Partial<MentorUserContext>,
) {
  const contextPayload = {
    user_id: userId,
    goal: payload.goal ?? null,
    experience_level: payload.experience_level ?? null,
    use_case: payload.use_case ?? null,
    ad_budget_range: payload.ad_budget_range ?? null,
    prior_experience: payload.prior_experience ?? null,
    declared_challenges: payload.declared_challenges ?? [],
    notes: payload.notes ?? null,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from('mentor_user_context')
    .upsert(contextPayload, { onConflict: 'user_id' })

  if (error) {
    console.error('[mentor] failed to save mentor context:', error.message)
  }
}

export async function getMentorData(userId: string): Promise<MentorDataSnapshot | null> {
  const [
    profileResult,
    progressResult,
    answersResult,
    dominioResult,
    flashcardsResult,
    contextResult,
    chatHistoryResult,
    trilhasResult,
    aulasResult,
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase
      .from('user_progresso')
      .select(`
        *,
        aulas (
          id,
          titulo,
          topicos,
          ordem,
          modulos (
            id,
            titulo,
            ordem,
            trilhas (
              id,
              titulo,
              ordem,
              publicada
            )
          )
        )
      `)
      .eq('user_id', userId)
      .order('completed_at', { ascending: false }),
    supabase
      .from('user_respostas')
      .select(`
        id,
        correta,
        created_at,
        quiz_perguntas (
          id,
          pergunta,
          topico,
          aula_id,
          explicacao,
          aulas (
            id,
            titulo,
            topicos,
            ordem,
            modulos (
              id,
              titulo,
              ordem,
              trilhas (
                id,
                titulo,
                ordem,
                publicada
              )
            )
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    supabase.from('user_dominio').select('*').eq('user_id', userId).order('percentual', { ascending: false }),
    supabase.from('flashcards').select('*').eq('user_id', userId),
    supabase.from('mentor_user_context').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('mentor_chat_messages').select('*').eq('user_id', userId).order('created_at', { ascending: true }).limit(20),
    supabase.from('trilhas').select('*').eq('publicada', true).order('ordem'),
    supabase
      .from('aulas')
      .select(`
        id,
        titulo,
        topicos,
        ordem,
        modulos (
          id,
          titulo,
          ordem,
          trilhas (
            id,
            titulo,
            ordem,
            publicada
          )
        )
      `),
  ])

  if (profileResult.error || !profileResult.data) {
    console.error('[mentor] failed to load profile:', profileResult.error?.message)
    return null
  }

  const rawLessons = (aulasResult.data ?? []) as RawLessonRelation[]
  const publishedLessons = rawLessons
    .map(resolveLesson)
    .filter((lesson): lesson is MentorResolvedLesson => Boolean(lesson?.id && lesson.trilha))
    .filter((lesson) => {
      const rawLesson = rawLessons.find((item) => item.id === lesson.id)
      const rawModulo = getFirstRelation(rawLesson?.modulos)
      const rawTrilha = getFirstRelation(rawModulo?.trilhas)
      return Boolean(rawTrilha?.publicada)
    })
    .sort((left, right) => {
      const trilhaDiff = (left.trilha?.ordem ?? 0) - (right.trilha?.ordem ?? 0)
      if (trilhaDiff !== 0) return trilhaDiff
      const moduloDiff = (left.modulo?.ordem ?? 0) - (right.modulo?.ordem ?? 0)
      if (moduloDiff !== 0) return moduloDiff
      return left.ordem - right.ordem
    })

  return {
    profile: profileResult.data,
    mentorContext: contextResult.data ?? null,
    progress: normalizeProgress((progressResult.data ?? []) as RawProgressRow[]),
    answers: normalizeAnswers((answersResult.data ?? []) as unknown as RawAnswerRow[]),
    dominio: dominioResult.data ?? [],
    flashcards: flashcardsResult.data ?? [],
    chatHistory: (chatHistoryResult.data ?? []) as MentorChatMessage[],
    publishedLessons,
    publishedTrilhas: trilhasResult.data ?? [],
  }
}
