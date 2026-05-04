import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import { logAdminAction, requireAdmin } from './_lib/auth.js'
import { gerarQuizComFallback, prepararQuizPromptPayload } from './_lib/quiz-generation.js'

interface RegenerarPerguntasRequest {
  aula_id?: string
}

interface AulaParaRegenerar {
  id: string
  titulo: string
  transcricao: string | null
  resumo: string | null
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const GROQ_KEY = process.env.GROQ_API_KEY ?? process.env.VITE_GROQ_API_KEY
  const GEMINI_KEY = process.env.GEMINI_API_KEY ?? process.env.VITE_GEMINI_API_KEY

  if (!GROQ_KEY && !GEMINI_KEY) {
    return res.status(500).json({ error: 'Chave de API de IA nao configurada.' })
  }

  const auth = await requireAdmin(req, res)
  if (!auth) return

  const { aula_id } = req.body as RegenerarPerguntasRequest
  if (!aula_id) {
    return res.status(400).json({ error: 'aula_id e obrigatorio.' })
  }

  const supabase = createClient(auth.env.supabaseUrl, auth.env.supabaseServiceKey)

  try {
    const { data: aula, error: aulaError } = await supabase
      .from('aulas')
      .select('id,titulo,transcricao,resumo')
      .eq('id', aula_id)
      .single<AulaParaRegenerar>()

    if (aulaError || !aula) {
      return res.status(404).json({ error: aulaError?.message ?? 'Aula nao encontrada.' })
    }

    const promptPayload = prepararQuizPromptPayload({
      titulo: aula.titulo,
      descricao: aula.resumo,
      transcricao: aula.transcricao,
    })

    let quiz
    try {
      quiz = await gerarQuizComFallback({
        promptPayload,
        groqKey: GROQ_KEY,
        geminiKey: GEMINI_KEY,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return res.status(422).json({
        error: `Falha ao gerar quiz com qualidade suficiente. ${message}`,
        usou_transcricao: promptPayload.origemConteudo === 'transcricao',
      })
    }

    const { count: perguntasAntigasCount, error: countError } = await supabase
      .from('quiz_perguntas')
      .select('id', { count: 'exact', head: true })
      .eq('aula_id', aula.id)
      .neq('ativa', false)

    if (countError) {
      return res.status(500).json({ error: `Erro ao contar perguntas antigas: ${countError.message}` })
    }

    const novasPerguntas = quiz.perguntas.map((pergunta) => ({
      aula_id: aula.id,
      pergunta: pergunta.pergunta,
      opcoes: pergunta.opcoes,
      resposta_correta: pergunta.resposta_correta,
      explicacao: pergunta.explicacao,
      topico: pergunta.topico,
      dificuldade: pergunta.dificuldade,
      ativa: true,
    }))

    const { data: perguntasCriadas, error: insertError } = await supabase
      .from('quiz_perguntas')
      .insert(novasPerguntas)
      .select('id')

    if (insertError) {
      return res.status(500).json({ error: `Erro ao salvar novas perguntas: ${insertError.message}` })
    }

    const perguntasCriadasIds = (perguntasCriadas ?? []).map((pergunta) => pergunta.id)
    if (perguntasCriadasIds.length === 0) {
      return res.status(500).json({ error: 'Nenhuma pergunta nova foi criada.' })
    }

    const { error: disableError } = await supabase
      .from('quiz_perguntas')
      .update({ ativa: false })
      .eq('aula_id', aula.id)
      .neq('ativa', false)
      .not('id', 'in', `(${perguntasCriadasIds.join(',')})`)

    if (disableError) {
      await supabase
        .from('quiz_perguntas')
        .delete()
        .in('id', perguntasCriadasIds)

      return res.status(500).json({
        error: `Novas perguntas criadas, mas falhou ao desativar antigas: ${disableError.message}`,
      })
    }

    const perguntasAntigasDesativadas = perguntasAntigasCount ?? 0

    await supabase
      .from('aulas')
      .update({
        resumo: quiz.resumo,
        topicos: quiz.topicos_cobertos,
      })
      .eq('id', aula.id)

    await logAdminAction(auth.serviceClient, auth.user.id, 'aula.regenerar_perguntas', {
      aula_id: aula.id,
      perguntas_antigas_desativadas: perguntasAntigasDesativadas,
      perguntas_novas_criadas: novasPerguntas.length,
      usou_transcricao: promptPayload.origemConteudo === 'transcricao',
    })

    return res.status(200).json({
      success: true,
      aula_id: aula.id,
      perguntas_antigas_desativadas: perguntasAntigasDesativadas,
      perguntas_novas_criadas: novasPerguntas.length,
      usou_transcricao: promptPayload.origemConteudo === 'transcricao',
      qualidade_base: promptPayload.origemConteudo,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[regenerar-perguntas] erro geral:', message)
    return res.status(500).json({ error: `Erro interno: ${message}` })
  }
}
