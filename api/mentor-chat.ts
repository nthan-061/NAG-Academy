import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAuthenticatedUser } from './_lib/auth.js'

type ExperienceLevel = 'nenhuma' | 'iniciante' | 'intermediaria' | 'avancada'
type UseCase = 'uso-proprio' | 'profissional' | 'cliente' | 'equipe'

interface MentorChatMessageInput {
  role: 'user' | 'assistant'
  content: string
}

interface MentorChatContextRecord {
  goal?: string | null
  experience_level?: ExperienceLevel | null
  use_case?: UseCase | null
  ad_budget_range?: string | null
  prior_experience?: string | null
  declared_challenges?: string[]
  notes?: string | null
}

interface MentorChatApiRequest {
  message?: string
  history?: MentorChatMessageInput[]
  profile?: Record<string, unknown> | null
  analysis?: Record<string, unknown> | null
  insights?: Array<Record<string, unknown>>
  recommendations?: Array<Record<string, unknown>>
}

interface SystemPromptPayload {
  userName?: string
  profile: Record<string, unknown> | null
  analysis: Record<string, unknown> | null
  insights: Array<Record<string, unknown>>
  recommendations: Array<Record<string, unknown>>
  mentorContext: MentorChatContextRecord
  missingContext: string[]
}

function normalizeString(value: unknown) {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed || null
}

function detectExperienceLevel(content: string): ExperienceLevel | null {
  const value = content.toLowerCase()
  if (value.includes('nunca anunciei') || value.includes('nao anunciei') || value.includes('nenhuma experiencia')) return 'nenhuma'
  if (value.includes('iniciante') || value.includes('comecando')) return 'iniciante'
  if (value.includes('intermedi')) return 'intermediaria'
  if (value.includes('avancad')) return 'avancada'
  return null
}

function detectUseCase(content: string): UseCase | null {
  const value = content.toLowerCase()
  if (value.includes('cliente')) return 'cliente'
  if (value.includes('equipe')) return 'equipe'
  if (value.includes('empresa') || value.includes('trabalho') || value.includes('profissional')) return 'profissional'
  if (value.includes('meu negocio') || value.includes('uso proprio') || value.includes('minha empresa')) return 'uso-proprio'
  return null
}

function extractBudgetRange(content: string) {
  const match = content.match(/r\$\s?\d+[.,]?\d*\s*(?:por|\/)?\s*(dia|mes|mês)?/i)
  return match?.[0] ?? null
}

function extractGoal(content: string) {
  const lowered = content.toLowerCase()
  if (lowered.includes('meu objetivo')) return normalizeString(content)
  if (lowered.includes('quero') || lowered.includes('preciso')) return normalizeString(content)
  return null
}

function extractChallenges(content: string) {
  const lowered = content.toLowerCase()
  return [
    'segmentacao',
    'criativo',
    'conversao',
    'publico',
    'orcamento',
    'leads',
    'campanha',
  ].filter((item) => lowered.includes(item))
}

function captureContext(content: string): Partial<MentorChatContextRecord> {
  const challenges = extractChallenges(content)

  return {
    goal: extractGoal(content),
    experience_level: detectExperienceLevel(content),
    use_case: detectUseCase(content),
    ad_budget_range: extractBudgetRange(content),
    prior_experience: normalizeString(content),
    declared_challenges: challenges.length > 0 ? challenges : undefined,
  }
}

function getMissingContext(context: MentorChatContextRecord) {
  const missing: string[] = []
  if (!context.goal) missing.push('objetivo')
  if (!context.experience_level) missing.push('experiencia')
  if (!context.use_case) missing.push('contexto_de_uso')
  return missing
}

function buildSystemPrompt(payload: SystemPromptPayload) {
  const { userName, profile, analysis, insights, recommendations, mentorContext, missingContext } = payload

  return `Voce e o Mentor IA da Nathan Academy, um mentor pessoal de aprendizagem para Google Ads.

MISSAO:
- agir como um mentor contextual, nao como um chatbot generico
- interpretar comportamento, erros, consistencia, progresso e contexto declarado do aluno
- orientar com clareza, foco pedagogico e proximos passos praticos

REGRAS:
- responda em portugues do Brasil
- seja especifico, concreto e conectado aos dados abaixo
- evite frases vazias como "otima pergunta"
- quando houver risco claro, diga isso com objetividade
- quando faltarem dados de personalizacao, faca no maximo 1 pergunta estrategica por resposta
- prefira orientar decisao e estudo, nao apenas explicar conteudo genericamente
- use no maximo 4 blocos curtos ou uma lista curta quando ajudar

ALUNO:
- nome: ${userName ?? 'aluno'}
- objetivo declarado: ${mentorContext.goal ?? 'nao informado'}
- experiencia declarada: ${mentorContext.experience_level ?? 'nao informada'}
- contexto de uso: ${mentorContext.use_case ?? 'nao informado'}
- desafios declarados: ${(mentorContext.declared_challenges ?? []).join(', ') || 'nenhum'}

PERFIL ATUAL:
${JSON.stringify(profile, null, 2)}

ANALISE:
${JSON.stringify(analysis, null, 2)}

INSIGHTS:
${JSON.stringify(insights, null, 2)}

RECOMENDACOES:
${JSON.stringify(recommendations, null, 2)}

LACUNAS DE CONTEXTO:
${missingContext.join(', ') || 'nenhuma'}
`
}

async function generateWithGroq(apiKey: string, messages: Array<{ role: string; content: string }>) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages,
      max_tokens: 700,
      temperature: 0.45,
    }),
  })

  if (!response.ok) {
    throw new Error(`Groq ${response.status}: ${await response.text()}`)
  }

  const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> }
  return data.choices?.[0]?.message?.content ?? ''
}

async function generateWithGemini(apiKey: string, systemPrompt: string, history: MentorChatMessageInput[], message: string) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [
          ...history.map((item) => ({
            role: item.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: item.content }],
          })),
          { role: 'user', parts: [{ text: message }] },
        ],
        generationConfig: {
          temperature: 0.45,
          maxOutputTokens: 700,
        },
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const auth = await requireAuthenticatedUser(req, res)
  if (!auth) return

  try {
    const {
      message,
      history = [],
      profile = null,
      analysis = null,
      insights = [],
      recommendations = [],
    } = req.body as MentorChatApiRequest

    const normalizedMessage = normalizeString(message)
    if (!normalizedMessage) {
      return res.status(400).json({ error: 'Mensagem obrigatoria.' })
    }

    const GROQ_KEY = process.env.GROQ_API_KEY ?? process.env.VITE_GROQ_API_KEY
    const GEMINI_KEY = process.env.GEMINI_API_KEY ?? process.env.VITE_GEMINI_API_KEY
    if (!GROQ_KEY && !GEMINI_KEY) {
      return res.status(500).json({ error: 'Nenhuma chave de IA configurada no servidor.' })
    }

    const { data: existingContext } = await auth.serviceClient
      .from('mentor_user_context')
      .select('*')
      .eq('user_id', auth.user.id)
      .maybeSingle()

    const capturedContext = captureContext(normalizedMessage)
    const mergedContext: MentorChatContextRecord = {
      goal: capturedContext.goal ?? existingContext?.goal ?? null,
      experience_level: capturedContext.experience_level ?? existingContext?.experience_level ?? null,
      use_case: capturedContext.use_case ?? existingContext?.use_case ?? null,
      ad_budget_range: capturedContext.ad_budget_range ?? existingContext?.ad_budget_range ?? null,
      prior_experience: capturedContext.prior_experience ?? existingContext?.prior_experience ?? null,
      declared_challenges: capturedContext.declared_challenges ?? existingContext?.declared_challenges ?? [],
      notes: existingContext?.notes ?? null,
    }

    await auth.serviceClient
      .from('mentor_user_context')
      .upsert({
        user_id: auth.user.id,
        ...mergedContext,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })

    await auth.serviceClient.from('mentor_chat_messages').insert({
      user_id: auth.user.id,
      role: 'user',
      content: normalizedMessage,
      metadata: {
        source: 'mentor-ui',
        captured_context: capturedContext,
      },
    })

    const missingContext = getMissingContext(mergedContext)
    const systemPrompt = buildSystemPrompt({
      userName: typeof profile?.userName === 'string' ? profile.userName : undefined,
      profile,
      analysis,
      insights,
      recommendations,
      mentorContext: mergedContext,
      missingContext,
    })

    const groqMessages = [
      { role: 'system', content: systemPrompt },
      ...history.map((item) => ({ role: item.role, content: item.content })),
      { role: 'user', content: normalizedMessage },
    ]

    let replyContent = ''
    let lastError = ''

    if (GROQ_KEY) {
      try {
        replyContent = await generateWithGroq(GROQ_KEY, groqMessages)
      } catch (error) {
        lastError = error instanceof Error ? error.message : String(error)
      }
    }

    if (!replyContent && GEMINI_KEY) {
      try {
        replyContent = await generateWithGemini(GEMINI_KEY, systemPrompt, history, normalizedMessage)
      } catch (error) {
        lastError = `${lastError} ${error instanceof Error ? error.message : String(error)}`.trim()
      }
    }

    if (!replyContent) {
      return res.status(500).json({ error: `Falha ao gerar resposta do mentor. ${lastError}`.trim() })
    }

    const profileLevel = profile && typeof profile.estimatedLevel === 'object' && profile.estimatedLevel
      && 'label' in profile.estimatedLevel && typeof profile.estimatedLevel.label === 'string'
      ? profile.estimatedLevel.label
      : null

    const analysisStatus = analysis && typeof analysis.status === 'string' ? analysis.status : null

    const { data: insertedReply, error: insertReplyError } = await auth.serviceClient
      .from('mentor_chat_messages')
      .insert({
        user_id: auth.user.id,
        role: 'assistant',
        content: replyContent,
        metadata: {
          missing_context: missingContext,
          profile_level: profileLevel,
          analysis_status: analysisStatus,
        },
      })
      .select('*')
      .single()

    if (insertReplyError || !insertedReply) {
      return res.status(500).json({ error: 'Nao foi possivel persistir a resposta do mentor.' })
    }

    return res.status(200).json({
      reply: insertedReply,
      capturedContext,
      missingContext,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno'
    return res.status(500).json({ error: message })
  }
}
