import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? process.env.VITE_ADMIN_EMAIL

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_KEY) {
      return res.status(500).json({ error: 'Configuracao Supabase ausente.' })
    }

    const authHeader = req.headers.authorization
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
    if (!token) {
      return res.status(401).json({ error: 'Autenticacao obrigatoria.' })
    }

    const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    })

    const { data: authData, error: authError } = await authClient.auth.getUser()
    if (authError || !authData.user) {
      return res.status(401).json({ error: 'Sessao invalida ou expirada.' })
    }

    if (!ADMIN_EMAIL || authData.user.email !== ADMIN_EMAIL) {
      return res.status(403).json({ error: 'Acesso restrito.' })
    }

    const { trilha_id } = req.body as { trilha_id?: string }
    if (!trilha_id) {
      return res.status(400).json({ error: 'trilha_id e obrigatorio.' })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    const { data: modulos, error: modulosError } = await supabase
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
      const { data: aulas, error: aulasError } = await supabase
        .from('aulas')
        .select('id')
        .in('modulo_id', moduloIds)

      if (aulasError) {
        return res.status(500).json({ error: `Erro ao buscar aulas: ${aulasError.message}` })
      }

      aulaIds = (aulas ?? []).map((aula) => aula.id)
    }

    if (aulaIds.length > 0) {
      const { data: perguntas, error: perguntasError } = await supabase
        .from('quiz_perguntas')
        .select('id')
        .in('aula_id', aulaIds)

      if (perguntasError) {
        return res.status(500).json({ error: `Erro ao buscar perguntas: ${perguntasError.message}` })
      }

      perguntaIds = (perguntas ?? []).map((pergunta) => pergunta.id)
    }

    if (perguntaIds.length > 0) {
      const { error: flashcardsError } = await supabase
        .from('flashcards')
        .delete()
        .in('pergunta_id', perguntaIds)

      if (flashcardsError) {
        return res.status(500).json({ error: `Erro ao remover flashcards: ${flashcardsError.message}` })
      }
    }

    const { error: trilhaError } = await supabase
      .from('trilhas')
      .delete()
      .eq('id', trilha_id)

    if (trilhaError) {
      return res.status(500).json({ error: `Erro ao remover trilha: ${trilhaError.message}` })
    }

    return res.status(200).json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return res.status(500).json({ error: `Erro interno: ${message}` })
  }
}
