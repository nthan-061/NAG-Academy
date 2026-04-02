import { supabase } from '@/lib/supabase'
import type { UserProgresso } from '@/types'

export async function toggleAulaAssistida(userId: string, aulaId: string, progresso: UserProgresso | null) {
  const assistida = !(progresso?.assistida ?? false)

  await supabase.from('user_progresso').upsert(
    {
      user_id: userId,
      aula_id: aulaId,
      assistida,
      ...(assistida
        ? {}
        : {
            quiz_completado: false,
            acertos: 0,
            total_perguntas: 0,
            percentual_acerto: 0,
          }),
    },
    { onConflict: 'user_id,aula_id' },
  )

  return {
    ...(progresso ?? {
      id: '',
      user_id: userId,
      aula_id: aulaId,
      quiz_completado: false,
      acertos: 0,
      total_perguntas: 0,
      percentual_acerto: null,
      xp_ganho: 0,
      completed_at: null,
    }),
    assistida,
    ...(assistida
      ? {}
      : {
          quiz_completado: false,
          acertos: 0,
          total_perguntas: 0,
          percentual_acerto: null,
        }),
  }
}

export async function getAulaNotes(userId: string, aulaId: string) {
  const { data } = await supabase
    .from('user_progresso')
    .select('notas')
    .eq('user_id', userId)
    .eq('aula_id', aulaId)
    .maybeSingle()

  return data?.notas ?? ''
}

export async function saveAulaNotes(userId: string, aulaId: string, notas: string) {
  await supabase
    .from('user_progresso')
    .upsert({ user_id: userId, aula_id: aulaId, notas }, { onConflict: 'user_id,aula_id' })
}
