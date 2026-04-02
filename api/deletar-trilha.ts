import type { VercelRequest, VercelResponse } from '@vercel/node'
import { logAdminAction, requireAdmin } from './_lib/auth.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const auth = await requireAdmin(req, res)
    if (!auth) return

    const { trilha_id } = req.body as { trilha_id?: string }
    if (!trilha_id) {
      return res.status(400).json({ error: 'trilha_id e obrigatorio.' })
    }

    const { data: modulos, error: modulosError } = await auth.serviceClient
      .from('modulos')
      .select('id')
      .eq('trilha_id', trilha_id)

    if (modulosError) {
      return res.status(500).json({ error: `Erro ao buscar modulos: ${modulosError.message}` })
    }

    const moduloIds = (modulos ?? []).map((modulo) => modulo.id)
    let aulaIds: string[] = []
    let perguntaIds: string[] = []

    if (moduloIds.length > 0) {
      const { data: aulas, error: aulasError } = await auth.serviceClient
        .from('aulas')
        .select('id')
        .in('modulo_id', moduloIds)

      if (aulasError) {
        return res.status(500).json({ error: `Erro ao buscar aulas: ${aulasError.message}` })
      }

      aulaIds = (aulas ?? []).map((aula) => aula.id)
    }

    if (aulaIds.length > 0) {
      const { data: perguntas, error: perguntasError } = await auth.serviceClient
        .from('quiz_perguntas')
        .select('id')
        .in('aula_id', aulaIds)

      if (perguntasError) {
        return res.status(500).json({ error: `Erro ao buscar perguntas: ${perguntasError.message}` })
      }

      perguntaIds = (perguntas ?? []).map((pergunta) => pergunta.id)
    }

    if (perguntaIds.length > 0) {
      const { error: flashcardsError } = await auth.serviceClient
        .from('flashcards')
        .delete()
        .in('pergunta_id', perguntaIds)

      if (flashcardsError) {
        return res.status(500).json({ error: `Erro ao remover flashcards: ${flashcardsError.message}` })
      }
    }

    const { error: trilhaError } = await auth.serviceClient
      .from('trilhas')
      .delete()
      .eq('id', trilha_id)

    if (trilhaError) {
      return res.status(500).json({ error: `Erro ao remover trilha: ${trilhaError.message}` })
    }

    await logAdminAction(auth.serviceClient, auth.user.id, 'trilha.delete', {
      trilha_id,
      modulo_ids: moduloIds,
      aula_ids: aulaIds,
      pergunta_ids: perguntaIds,
    })

    return res.status(200).json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return res.status(500).json({ error: `Erro interno: ${message}` })
  }
}
