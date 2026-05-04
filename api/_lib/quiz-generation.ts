import Groq from 'groq-sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'

export type ConteudoBase = 'transcricao' | 'metadados'

export interface QuizPromptPayload {
  conteudo: string
  titulo: string
  descricao: string
  origemConteudo: ConteudoBase
}

export interface QuizResult {
  resumo: string
  topicos_cobertos: string[]
  perguntas: Array<{
    pergunta: string
    opcoes: string[]
    resposta_correta: number
    explicacao: string
    topico: string
    dificuldade: 'facil' | 'medio' | 'dificil'
  }>
}

type ValidatedQuizPergunta = QuizResult['perguntas'][number]

export type PublicAiErrorCode = 'AI_RATE_LIMIT' | 'AI_QUALITY_FAILED' | 'AI_NOT_CONFIGURED' | 'UNKNOWN'

export interface PublicAiError {
  code: PublicAiErrorCode
  message: string
  status: number
}

class QuizGenerationError extends Error {
  code: PublicAiErrorCode
  status: number
  internalMessage: string

  constructor(code: PublicAiErrorCode, message: string, status = 500, internalMessage?: string) {
    super(message)
    this.name = 'QuizGenerationError'
    this.code = code
    this.status = status
    this.internalMessage = internalMessage ?? message
  }
}

const QUIZ_PROMPT_SYSTEM = `Voce e um designer instrucional senior especializado em avaliacoes praticas de marketing digital.
Sua tarefa e criar quizzes especificos da aula, com perguntas que comprovem compreensao real do conteudo apresentado.
Responda apenas com JSON valido, sem markdown, sem comentarios e sem texto extra.`

export function criarRecorteTranscricao(transcricao: string) {
  const texto = transcricao.replace(/\s+/g, ' ').trim()
  if (texto.length <= 18000) return texto

  const inicio = texto.slice(0, 6500)
  const meioStart = Math.max(0, Math.floor(texto.length / 2) - 3000)
  const meio = texto.slice(meioStart, meioStart + 6000)
  const fim = texto.slice(-5500)

  return [
    '[INICIO DA AULA]',
    inicio,
    '[TRECHO CENTRAL DA AULA]',
    meio,
    '[FINAL DA AULA]',
    fim,
  ].join('\n\n')
}

export function prepararQuizPromptPayload(payload: {
  titulo: string
  descricao?: string | null
  transcricao?: string | null
}): QuizPromptPayload {
  const transcricao = payload.transcricao?.trim() ?? ''
  const usouTranscricao = transcricao.length > 100

  return {
    conteudo: usouTranscricao
      ? criarRecorteTranscricao(transcricao)
      : `Titulo: ${payload.titulo}\n\nDescricao: ${payload.descricao || 'Sem descricao disponivel.'}`,
    titulo: payload.titulo,
    descricao: payload.descricao ?? '',
    origemConteudo: usouTranscricao ? 'transcricao' : 'metadados',
  }
}

function buildQuizUserPrompt(payload: QuizPromptPayload, repairMode = false) {
  const { conteudo, titulo, descricao, origemConteudo } = payload
  const avisoContextoLimitado = origemConteudo === 'metadados'
    ? `
ATENCAO: nao foi possivel obter transcricao. O conteudo abaixo veio apenas do titulo e da descricao do YouTube.
Nesse caso, evite inventar detalhes. Gere perguntas somente sobre informacoes sustentadas pelo titulo/descricao e seja conservador no resumo.`
    : `
O conteudo abaixo foi recortado da transcricao da aula, cobrindo inicio, meio e fim quando a transcricao e longa.`

  return `TITULO DA AULA: ${titulo}

DESCRICAO DO VIDEO:
${descricao || 'Sem descricao disponivel.'}

ORIGEM DO CONTEUDO: ${origemConteudo}
${avisoContextoLimitado}

CONTEUDO DA AULA:
${conteudo}

Crie um quiz com EXATAMENTE 15 perguntas de multipla escolha.

Regras obrigatorias de qualidade:
- Cada pergunta deve depender de um detalhe, conceito, exemplo, decisao ou situacao mencionada nesta aula.
- Proibido criar perguntas genericas que serviriam para qualquer aula de marketing.
- Proibido repetir a mesma ideia com outras palavras.
- Proibido usar enunciados vagos como "Qual e a importancia de...", "O que e marketing digital?", "Por que e importante..." ou "Qual alternativa define melhor..." sem contexto especifico da aula.
- Varie os formatos: cenario pratico, diagnostico de erro, aplicacao de conceito, causa/consequencia, tomada de decisao e erro comum.
- Use 4 opcoes plausiveis por pergunta. As alternativas incorretas devem representar confusoes reais, nao absurdos obvios.
- A resposta correta deve ser inequivoca.
- A explicacao deve citar por que a alternativa correta faz sentido para a aula e por que uma confusao comum estaria errada.
- Distribuicao desejada: 6 facil, 6 medio, 3 dificil.
- Use topicos curtos e especificos, nao "Geral".

Antes de responder, faca uma revisao silenciosa:
- Remova perguntas parecidas.
- Substitua perguntas genericas por situacoes concretas.
- Confira se todas as perguntas podem ser respondidas a partir do conteudo fornecido.
${repairMode ? `
MODO REPARO: a tentativa anterior gerou perguntas curtas, genericas ou parecidas demais.
Agora priorize perguntas com contexto especifico da aula, usando cenario pratico no enunciado e alternativas mais distintas.
Evite com rigor perguntas sobre "publico-alvo da aula", "objetivo da aula", "ano da atualizacao" ou relacoes obvias com o titulo.` : ''}

Formato JSON obrigatorio:
{
  "resumo": "3-5 frases resumindo pontos especificos da aula",
  "topicos_cobertos": ["topico especifico 1", "topico especifico 2"],
  "perguntas": [
    {
      "pergunta": "pergunta especifica, preferencialmente com contexto ou cenario",
      "opcoes": ["opcao plausivel A", "opcao plausivel B", "opcao plausivel C", "opcao plausivel D"],
      "resposta_correta": 0,
      "explicacao": "2-3 frases especificas da aula.",
      "topico": "topico especifico",
      "dificuldade": "facil"
    }
  ]
}`
}

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeDifficulty(value: unknown): 'facil' | 'medio' | 'dificil' {
  const normalized = normalizeText(String(value ?? 'medio'))
  if (normalized === 'facil' || normalized === 'medio' || normalized === 'dificil') return normalized
  return 'medio'
}

function isGenericQuestion(pergunta: string) {
  const normalized = normalizeText(pergunta)
  const genericPatterns = [
    /^qual e a importancia de\b/,
    /^por que e importante\b/,
    /^o que e marketing digital\b/,
    /^o que e\b.{0,45}\?$/,
    /^qual alternativa define melhor\b/,
    /^qual das alternativas abaixo\b/,
    /^qual e o principal objetivo de\b/,
    /^como o marketing digital pode ajudar\b/,
  ]

  return genericPatterns.some((pattern) => pattern.test(normalized))
}

function similarityScore(a: string, b: string) {
  const tokensA = new Set(normalizeText(a).split(' ').filter((token) => token.length > 3))
  const tokensB = new Set(normalizeText(b).split(' ').filter((token) => token.length > 3))
  if (tokensA.size === 0 || tokensB.size === 0) return 0

  let intersection = 0
  tokensA.forEach((token) => {
    if (tokensB.has(token)) intersection += 1
  })

  return intersection / Math.min(tokensA.size, tokensB.size)
}

function sanitizeOptions(opcoes: unknown) {
  if (!Array.isArray(opcoes)) return null

  const cleaned = opcoes
    .map((opcao) => String(opcao ?? '').replace(/\s+/g, ' ').trim())
    .filter(Boolean)

  const unique = new Set(cleaned.map(normalizeText))
  if (cleaned.length !== 4 || unique.size !== 4) return null
  return cleaned
}

export function validarQuizGerado(quiz: QuizResult, options?: { minQuestions?: number }): QuizResult {
  const perguntasValidas: ValidatedQuizPergunta[] = []
  const rejeicoes: string[] = []
  const minQuestions = options?.minQuestions ?? 10

  for (const pergunta of quiz.perguntas ?? []) {
    const textoPergunta = String(pergunta.pergunta ?? '').replace(/\s+/g, ' ').trim()
    const opcoes = sanitizeOptions(pergunta.opcoes)
    const respostaCorreta = Number(pergunta.resposta_correta)
    const explicacao = String(pergunta.explicacao ?? '').replace(/\s+/g, ' ').trim()
    const topico = String(pergunta.topico ?? '').replace(/\s+/g, ' ').trim()
    const dificuldade = normalizeDifficulty(pergunta.dificuldade)

    if (textoPergunta.length < 35) {
      rejeicoes.push(`pergunta curta: ${textoPergunta}`)
      continue
    }

    if (isGenericQuestion(textoPergunta)) {
      rejeicoes.push(`pergunta generica: ${textoPergunta}`)
      continue
    }

    if (!opcoes) {
      rejeicoes.push(`opcoes invalidas: ${textoPergunta}`)
      continue
    }

    if (!Number.isInteger(respostaCorreta) || respostaCorreta < 0 || respostaCorreta > 3) {
      rejeicoes.push(`resposta invalida: ${textoPergunta}`)
      continue
    }

    if (explicacao.length < 30) {
      rejeicoes.push(`explicacao curta: ${textoPergunta}`)
      continue
    }

    const perguntaDuplicada = perguntasValidas.some((existente) =>
      normalizeText(existente.pergunta) === normalizeText(textoPergunta)
      || similarityScore(existente.pergunta, textoPergunta) >= 0.72
    )

    if (perguntaDuplicada) {
      rejeicoes.push(`pergunta duplicada/parecida: ${textoPergunta}`)
      continue
    }

    perguntasValidas.push({
      pergunta: textoPergunta,
      opcoes,
      resposta_correta: respostaCorreta,
      explicacao,
      topico: topico && normalizeText(topico) !== 'geral' ? topico : 'Aplicacao da aula',
      dificuldade,
    })
  }

  if (perguntasValidas.length < minQuestions) {
    const details = rejeicoes.slice(0, 5).join(' | ')
    throw new QuizGenerationError(
      'AI_QUALITY_FAILED',
      'A IA nao conseguiu gerar perguntas especificas o suficiente para esta aula. Tente novamente ou use uma aula com transcricao melhor.',
      422,
      `Quiz gerado com poucas perguntas validas (${perguntasValidas.length}/${minQuestions}). ${details}`,
    )
  }

  return {
    resumo: String(quiz.resumo ?? '').trim(),
    topicos_cobertos: Array.isArray(quiz.topicos_cobertos)
      ? quiz.topicos_cobertos.map((topico) => String(topico).trim()).filter(Boolean).slice(0, 8)
      : [],
    perguntas: perguntasValidas.slice(0, 15),
  }
}

async function gerarQuizGroq(promptPayload: QuizPromptPayload, apiKey: string, repairMode = false): Promise<QuizResult> {
  const groq = new Groq({ apiKey })
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: QUIZ_PROMPT_SYSTEM },
      { role: 'user', content: buildQuizUserPrompt(promptPayload, repairMode) },
    ],
    temperature: 0.55,
    max_tokens: 8192,
  })

  const raw = (completion.choices[0]?.message?.content ?? '').replace(/```json\n?|```/g, '').trim()
  return JSON.parse(raw) as QuizResult
}

async function gerarQuizGemini(promptPayload: QuizPromptPayload, apiKey: string, repairMode = false): Promise<QuizResult> {
  const genai = new GoogleGenerativeAI(apiKey)
  const model = genai.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      temperature: 0.55,
      maxOutputTokens: 8192,
    },
  })
  const prompt = `${QUIZ_PROMPT_SYSTEM}\n\n${buildQuizUserPrompt(promptPayload, repairMode)}`
  const result = await model.generateContent(prompt)
  const raw = result.response.text().replace(/```json\n?|```/g, '').trim()
  return JSON.parse(raw) as QuizResult
}

export async function gerarQuizComFallback(payload: {
  promptPayload: QuizPromptPayload
  groqKey?: string
  geminiKey?: string
}) {
  const minQuestions = payload.promptPayload.origemConteudo === 'metadados' ? 8 : 10

  if (!payload.groqKey && !payload.geminiKey) {
    throw new QuizGenerationError('AI_NOT_CONFIGURED', 'Servico de IA nao configurado.', 500)
  }

  try {
    if (!payload.groqKey) throw new Error('GROQ_API_KEY ausente')
    return validarQuizGerado(await gerarQuizGroq(payload.promptPayload, payload.groqKey), { minQuestions })
  } catch (error) {
    console.warn('[quiz-generation] Groq initial attempt failed:', getInternalAiError(error))

    if (classifyAiError(error) === 'AI_QUALITY_FAILED' && payload.groqKey) {
      try {
        return validarQuizGerado(await gerarQuizGroq(payload.promptPayload, payload.groqKey, true), { minQuestions })
      } catch (repairError) {
        console.warn('[quiz-generation] Groq repair attempt failed:', getInternalAiError(repairError))
        throw toPublicAiError(repairError)
      }
    }

    if (!payload.geminiKey) {
      throw toPublicAiError(error)
    }
  }

  try {
    return validarQuizGerado(await gerarQuizGemini(payload.promptPayload, payload.geminiKey), { minQuestions })
  } catch (error) {
    console.warn('[quiz-generation] Gemini attempt failed:', getInternalAiError(error))
    throw toPublicAiError(error)
  }
}

function getInternalAiError(error: unknown) {
  if (error instanceof QuizGenerationError) return error.internalMessage
  if (error instanceof Error) return error.message
  return String(error)
}

export function classifyAiError(error: unknown): PublicAiErrorCode {
  if (error instanceof QuizGenerationError) return error.code

  const message = getInternalAiError(error).toLowerCase()
  if (
    message.includes('quota')
    || message.includes('rate limit')
    || message.includes('too many requests')
    || message.includes('429')
    || message.includes('resource_exhausted')
  ) {
    return 'AI_RATE_LIMIT'
  }

  if (
    message.includes('api_key ausente')
    || message.includes('api key')
    || message.includes('chave')
    || message.includes('not configured')
  ) {
    return 'AI_NOT_CONFIGURED'
  }

  if (
    message.includes('poucas perguntas validas')
    || message.includes('perguntas validas')
    || message.includes('quality')
  ) {
    return 'AI_QUALITY_FAILED'
  }

  return 'UNKNOWN'
}

export function toPublicAiError(error: unknown): PublicAiError {
  if (
    typeof error === 'object'
    && error !== null
    && 'code' in error
    && 'message' in error
    && 'status' in error
  ) {
    const publicError = error as PublicAiError
    return {
      code: publicError.code,
      message: publicError.message,
      status: publicError.status,
    }
  }

  const code = classifyAiError(error)

  if (code === 'AI_RATE_LIMIT') {
    return {
      code,
      status: 429,
      message: 'Limite temporario da IA atingido. Aguarde alguns minutos e tente novamente.',
    }
  }

  if (code === 'AI_QUALITY_FAILED') {
    return {
      code,
      status: 422,
      message: 'A IA nao conseguiu gerar perguntas especificas o suficiente para esta aula. Tente novamente ou use uma aula com transcricao melhor.',
    }
  }

  if (code === 'AI_NOT_CONFIGURED') {
    return {
      code,
      status: 500,
      message: 'Servico de IA nao configurado.',
    }
  }

  return {
    code: 'UNKNOWN',
    status: 500,
    message: 'Nao foi possivel regenerar as perguntas agora.',
  }
}
