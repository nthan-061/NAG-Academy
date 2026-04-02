import { supabase } from '@/lib/supabase'
import type { QuizPergunta } from '@/types'
import type { QuizAnswerRecord, QuizFinalizeResult, QuizSetupData } from '../types'
import { calculateQuizXp } from '../utils'

export async function getQuizSetupData(aulaId: string): Promise<QuizSetupData | null> {
  const [{ data: aula }, { data: auth }] = await Promise.all([
    supabase.from('aulas').select('*').eq('id', aulaId).single(),
    supabase.auth.getUser(),
  ])

  if (!aula) return null

  const { data: perguntasData } = await supabase
    .from('quiz_perguntas')
    .select('*')
    .eq('aula_id', aulaId)

  const perguntas = [...(perguntasData ?? [])]
    .sort(() => Math.random() - 0.5)
    .slice(0, 10)

  return {
    aula,
    perguntas,
    userId: auth.user?.id ?? null,
  }
}

export async function finalizeQuizAttempt(
  userId: string,
  aulaId: string,
  respostas: QuizAnswerRecord[],
  perguntas: QuizPergunta[],
): Promise<QuizFinalizeResult> {
  const acertos = respostas.filter((resposta) => resposta.correta).length
  const total = respostas.length
  const percentual = total > 0 ? Math.round((acertos / total) * 100) : 0
  const xpGanho = calculateQuizXp(acertos, total)

  await supabase.from('user_respostas').insert(
    respostas.map((resposta) => ({
      user_id: userId,
      pergunta_id: resposta.perguntaId,
      resposta_escolhida: resposta.escolhida,
      correta: resposta.correta,
    })),
  )

  await supabase.from('user_progresso').upsert(
    {
      user_id: userId,
      aula_id: aulaId,
      assistida: true,
      quiz_completado: true,
      acertos,
      total_perguntas: total,
      percentual_acerto: percentual,
      xp_ganho: xpGanho,
      completed_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,aula_id' },
  )

  const { data: profile } = await supabase
    .from('profiles')
    .select('xp, streak_days, last_activity_date')
    .eq('id', userId)
    .single()

  const hoje = new Date().toISOString().split('T')[0]
  const ontem = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  const ultimaAtividade = profile?.last_activity_date
  const novoStreak =
    ultimaAtividade === hoje
      ? profile?.streak_days ?? 1
      : ultimaAtividade === ontem
        ? (profile?.streak_days ?? 0) + 1
        : 1

  await supabase
    .from('profiles')
    .update({
      xp: (profile?.xp ?? 0) + xpGanho,
      streak_days: novoStreak,
      last_activity_date: hoje,
    })
    .eq('id', userId)

  const topicosMap: Record<string, { acertos: number; total: number }> = {}
  respostas.forEach((resposta) => {
    if (!topicosMap[resposta.topico]) {
      topicosMap[resposta.topico] = { acertos: 0, total: 0 }
    }

    topicosMap[resposta.topico].total += 1
    if (resposta.correta) topicosMap[resposta.topico].acertos += 1
  })

  for (const [topico, valores] of Object.entries(topicosMap)) {
    const { data: existing } = await supabase
      .from('user_dominio')
      .select('*')
      .eq('user_id', userId)
      .eq('topico', topico)
      .maybeSingle()

    const novoTotal = (existing?.total ?? 0) + valores.total
    const novosAcertos = (existing?.acertos ?? 0) + valores.acertos
    const novoPercentual = novoTotal > 0 ? Math.round((novosAcertos / novoTotal) * 100) : 0

    await supabase.from('user_dominio').upsert(
      {
        user_id: userId,
        topico,
        acertos: novosAcertos,
        total: novoTotal,
        percentual: novoPercentual,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,topico' },
    )
  }

  const perguntasMap: Record<string, QuizPergunta> = {}
  perguntas.forEach((pergunta) => {
    perguntasMap[pergunta.id] = pergunta
  })

  const flashcards = respostas
    .filter((resposta) => !resposta.correta)
    .map((resposta) => {
      const pergunta = perguntasMap[resposta.perguntaId]
      if (!pergunta) return null

      return {
        user_id: userId,
        pergunta_id: pergunta.id,
        frente: pergunta.pergunta,
        verso: `${pergunta.opcoes[pergunta.resposta_correta]}\n\n${pergunta.explicacao}`,
        topico: pergunta.topico ?? 'Geral',
        proxima_revisao: new Date().toISOString().split('T')[0],
      }
    })
    .filter(Boolean)

  if (flashcards.length > 0) {
    await supabase.from('flashcards').insert(flashcards)
  }

  return {
    acertos,
    total,
    xpGanho,
    flashcardsCount: flashcards.length,
  }
}
