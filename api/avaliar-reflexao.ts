import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAuthenticatedUser } from './_lib/auth.js'

interface AvaliarReflexaoRequest {
  aula_id?: string
  texto?: string
  quiz_acertos?: number
  quiz_total?: number
}

interface ReflexaoEvaluationResult {
  approved: boolean
  score: number
  summary: string
  strengths: string[]
  gaps: string[]
  recommended_action: string
  topic_match: 'baixo' | 'medio' | 'alto'
  specificity_assessment: string
  extracted_learning_signals: string[]
  extracted_risk_signals: string[]
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function buildEvaluationPrompt(payload: {
  titulo: string
  transcricao: string
  topicos: string[]
  resumo: string | null
  texto: string
  wordCount: number
  quizAcertos?: number
  quizTotal?: number
}): string {
  const { titulo, transcricao, topicos, resumo, texto, wordCount, quizAcertos, quizTotal } = payload

  const quizContext = quizAcertos !== undefined && quizTotal !== undefined
    ? `Resultado do quiz: ${quizAcertos} de ${quizTotal} questoes corretas (${Math.round((quizAcertos / quizTotal) * 100)}%).`
    : 'Resultado do quiz: nao informado.'

  const lessonContent = transcricao
    ? `TRANSCRICAO DA AULA (primeiros 8000 chars):\n${transcricao.slice(0, 8000)}`
    : resumo
      ? `RESUMO DA AULA:\n${resumo}`
      : 'CONTEUDO: nao disponivel para esta aula.'

  return `Voce e um avaliador rigoroso de aprendizagem para cursos de marketing digital.

MISSAO: Avaliar se o texto de reflexao abaixo demonstra compreensao ESPECIFICA E REAL do conteudo desta aula especifica — nao do tema geral.

CRITERIOS DE APROVACAO (TODOS devem ser verificados):
1. O texto aborda pontos ESPECIFICOS desta aula, nao genericos sobre o tema
2. Ha evidencia de entendimento conceitual real, nao apenas parafrase superficial
3. O aluno conecta o conteudo a uma aplicacao pratica ou contexto pessoal especifico
4. A profundidade e compativel com o nivel do conteudo ensinado
5. Ausencia de "encher linguica" — texto bonito mas sem substancia concreta

PONTUACAO (0-100):
- 0-49: REPROVADO — sem compreensao demonstravel do conteudo especifico desta aula
- 50-69: REPROVADO — compreensao superficial, generica ou parcial demais
- 70-100: APROVADO — demonstra compreensao real e especifica desta aula

IMPORTANTE: Errar por permissividade e pior que errar por rigor. Aprove apenas quando houver evidencia clara de compreensao especifica.

=== DADOS DA AULA ===
TITULO: ${titulo}
TOPICOS COBERTOS: ${topicos.length > 0 ? topicos.join(', ') : 'nao especificados'}
${lessonContent}

=== CONTEXTO ADICIONAL ===
${quizContext}

=== TEXTO DE REFLEXAO DO ALUNO (${wordCount} palavras) ===
${texto}

=== RESPOSTA ===
Responda APENAS com JSON valido, sem markdown, sem texto extra, no seguinte formato exato:
{
  "approved": true ou false,
  "score": numero de 0 a 100,
  "summary": "avaliacao objetiva em 2-3 frases explicando a decisao",
  "strengths": ["ponto forte 1", "ponto forte 2"],
  "gaps": ["lacuna 1", "lacuna 2"],
  "recommended_action": "o que o aluno deve fazer agora para consolidar ou corrigir o aprendizado",
  "topic_match": "baixo" ou "medio" ou "alto",
  "specificity_assessment": "avaliacao da especificidade em 1-2 frases — menciona conceitos especificos da aula ou fica no generico?",
  "extracted_learning_signals": ["sinal de dominio real detectado 1", "..."],
  "extracted_risk_signals": ["sinal de lacuna ou equivoco detectado 1", "..."]
}`
}

async function callGroq(apiKey: string, prompt: string): Promise<string> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'Voce e um avaliador de aprendizagem especializado. Responda APENAS com JSON valido, sem markdown, sem explicacoes adicionais.',
        },
        { role: 'user', content: prompt },
      ],
      max_tokens: 1200,
      temperature: 0.2,
    }),
  })

  if (!response.ok) {
    throw new Error(`Groq ${response.status}: ${await response.text()}`)
  }

  const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> }
  return data.choices?.[0]?.message?.content ?? ''
}

async function callGemini(apiKey: string, prompt: string): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: 'Voce e um avaliador de aprendizagem especializado. Responda APENAS com JSON valido, sem markdown, sem explicacoes adicionais.' }],
        },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 1200 },
      }),
    },
  )

  if (!response.ok) {
    throw new Error(`Gemini ${response.status}: ${await response.text()}`)
  }

  const data = await response.json() as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
  }
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
}

function parseEvaluation(raw: string): ReflexaoEvaluationResult | null {
  // Strip markdown code fences if present
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()

  try {
    const parsed = JSON.parse(cleaned) as Record<string, unknown>

    const approved = Boolean(parsed.approved)
    const score = typeof parsed.score === 'number'
      ? Math.max(0, Math.min(100, Math.round(parsed.score)))
      : approved ? 70 : 45

    return {
      approved,
      score,
      summary: typeof parsed.summary === 'string' ? parsed.summary : '',
      strengths: Array.isArray(parsed.strengths) ? (parsed.strengths as string[]).filter(s => typeof s === 'string') : [],
      gaps: Array.isArray(parsed.gaps) ? (parsed.gaps as string[]).filter(s => typeof s === 'string') : [],
      recommended_action: typeof parsed.recommended_action === 'string' ? parsed.recommended_action : '',
      topic_match: (['baixo', 'medio', 'alto'] as const).includes(parsed.topic_match as 'baixo' | 'medio' | 'alto')
        ? (parsed.topic_match as 'baixo' | 'medio' | 'alto')
        : 'baixo',
      specificity_assessment: typeof parsed.specificity_assessment === 'string' ? parsed.specificity_assessment : '',
      extracted_learning_signals: Array.isArray(parsed.extracted_learning_signals)
        ? (parsed.extracted_learning_signals as string[]).filter(s => typeof s === 'string')
        : [],
      extracted_risk_signals: Array.isArray(parsed.extracted_risk_signals)
        ? (parsed.extracted_risk_signals as string[]).filter(s => typeof s === 'string')
        : [],
    }
  } catch {
    return null
  }
}

const XP_REFLEXAO_APROVADA = 25

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const auth = await requireAuthenticatedUser(req, res)
  if (!auth) return

  const { aula_id, texto, quiz_acertos, quiz_total } = req.body as AvaliarReflexaoRequest

  if (!aula_id || typeof aula_id !== 'string') {
    return res.status(400).json({ error: 'aula_id obrigatorio.' })
  }

  if (!texto || typeof texto !== 'string' || texto.trim().length === 0) {
    return res.status(400).json({ error: 'texto obrigatorio.' })
  }

  const wordCount = countWords(texto)
  if (wordCount < 100) {
    return res.status(400).json({ error: `Minimo de 100 palavras. Seu texto tem ${wordCount}.` })
  }

  // Fetch aula data (title, transcript, topics, summary)
  const { data: aula, error: aulaError } = await auth.serviceClient
    .from('aulas')
    .select('id, titulo, transcricao, resumo, topicos')
    .eq('id', aula_id)
    .single()

  if (aulaError || !aula) {
    return res.status(404).json({ error: 'Aula nao encontrada.' })
  }

  const GROQ_KEY = process.env.GROQ_API_KEY ?? process.env.VITE_GROQ_API_KEY
  const GEMINI_KEY = process.env.GEMINI_API_KEY ?? process.env.VITE_GEMINI_API_KEY

  if (!GROQ_KEY && !GEMINI_KEY) {
    return res.status(500).json({ error: 'Nenhuma chave de IA configurada.' })
  }

  const prompt = buildEvaluationPrompt({
    titulo: aula.titulo,
    transcricao: aula.transcricao ?? '',
    topicos: Array.isArray(aula.topicos) ? (aula.topicos as string[]) : [],
    resumo: aula.resumo ?? null,
    texto,
    wordCount,
    quizAcertos: typeof quiz_acertos === 'number' ? quiz_acertos : undefined,
    quizTotal: typeof quiz_total === 'number' ? quiz_total : undefined,
  })

  let rawResponse = ''
  let lastError = ''

  if (GROQ_KEY) {
    try {
      rawResponse = await callGroq(GROQ_KEY, prompt)
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err)
    }
  }

  if (!rawResponse && GEMINI_KEY) {
    try {
      rawResponse = await callGemini(GEMINI_KEY, prompt)
    } catch (err) {
      lastError = `${lastError} ${err instanceof Error ? err.message : String(err)}`.trim()
    }
  }

  if (!rawResponse) {
    return res.status(500).json({ error: `Falha ao avaliar reflexao. ${lastError}`.trim() })
  }

  const evaluation = parseEvaluation(rawResponse)
  if (!evaluation) {
    console.error('[avaliar-reflexao] failed to parse AI response:', rawResponse.slice(0, 500))
    return res.status(500).json({ error: 'Resposta da IA em formato invalido. Tente novamente.' })
  }

  const xpGanho = evaluation.approved ? XP_REFLEXAO_APROVADA : 0

  // Persist the reflection and evaluation result
  const { data: reflexao, error: insertError } = await auth.serviceClient
    .from('user_reflexoes')
    .insert({
      user_id: auth.user.id,
      aula_id,
      texto,
      word_count: wordCount,
      approved: evaluation.approved,
      score: evaluation.score,
      summary: evaluation.summary,
      strengths: evaluation.strengths,
      gaps: evaluation.gaps,
      recommended_action: evaluation.recommended_action,
      topic_match: evaluation.topic_match,
      specificity_assessment: evaluation.specificity_assessment,
      extracted_learning_signals: evaluation.extracted_learning_signals,
      extracted_risk_signals: evaluation.extracted_risk_signals,
      xp_ganho: xpGanho,
      metadata: {
        quiz_acertos: quiz_acertos ?? null,
        quiz_total: quiz_total ?? null,
        model_used: GROQ_KEY ? 'groq/llama-3.3-70b-versatile' : 'gemini/gemini-2.0-flash',
      },
    })
    .select('id')
    .single()

  if (insertError || !reflexao) {
    console.error('[avaliar-reflexao] failed to save reflexao:', insertError?.message)
    return res.status(500).json({ error: 'Nao foi possivel salvar a reflexao.' })
  }

  // Award XP if approved
  if (evaluation.approved && xpGanho > 0) {
    const { data: profile } = await auth.serviceClient
      .from('profiles')
      .select('xp')
      .eq('id', auth.user.id)
      .single()

    if (profile) {
      await auth.serviceClient
        .from('profiles')
        .update({ xp: (profile.xp ?? 0) + xpGanho })
        .eq('id', auth.user.id)
    }
  }

  return res.status(200).json({
    ...evaluation,
    reflexao_id: reflexao.id,
    xp_ganho: xpGanho,
  })
}
