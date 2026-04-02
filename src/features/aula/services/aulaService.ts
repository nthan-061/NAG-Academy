import { supabase } from '@/lib/supabase'
import type { Aula } from '@/types'
import type { AulaPageData } from '../types'

export async function getAulaPageData(aulaId: string, userId: string | null): Promise<AulaPageData | null> {
  const { data: aula } = await supabase
    .from('aulas')
    .select('*')
    .eq('id', aulaId)
    .single()

  if (!aula) return null

  const [{ data: modulo }, progressoResult] = await Promise.all([
    supabase.from('modulos').select('*').eq('id', aula.modulo_id).single(),
    userId
      ? supabase.from('user_progresso').select('*').eq('user_id', userId).eq('aula_id', aulaId).maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  const trilhaPromise = modulo
    ? supabase.from('trilhas').select('*').eq('id', modulo.trilha_id).single()
    : Promise.resolve({ data: null })

  const aulasDoModuloPromise = modulo
    ? supabase.from('aulas').select('*').eq('modulo_id', modulo.id).order('ordem')
    : Promise.resolve({ data: [] as Aula[] })

  const [{ data: trilha }, { data: aulasDoModulo }] = await Promise.all([trilhaPromise, aulasDoModuloPromise])

  const lessons = aulasDoModulo ?? []
  const lessonIndex = lessons.findIndex((item) => item.id === aulaId)

  return {
    aula,
    modulo: modulo ?? null,
    trilha: trilha ?? null,
    aulaAnterior: lessonIndex > 0 ? lessons[lessonIndex - 1] : null,
    proximaAula: lessonIndex >= 0 && lessonIndex < lessons.length - 1 ? lessons[lessonIndex + 1] : null,
    progresso: progressoResult.data ?? null,
  }
}
