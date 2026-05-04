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

function buildQuizUserPrompt(payload: QuizPromptPayload) {
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

export function validarQuizGerado(quiz: QuizResult): QuizResult {
  const perguntasValidas: ValidatedQuizPergunta[] = []
  const rejeicoes: string[] = []

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

  if (perguntasValidas.length < 10) {
    const details = rejeicoes.slice(0, 5).join(' | ')
    throw new Error(`Quiz gerado com poucas perguntas validas (${perguntasValidas.length}/10). ${details}`)
  }

  return {
    resumo: String(quiz.resumo ?? '').trim(),
    topicos_cobertos: Array.isArray(quiz.topicos_cobertos)
      ? quiz.topicos_cobertos.map((topico) => String(topico).trim()).filter(Boolean).slice(0, 8)
      : [],
    perguntas: perguntasValidas.slice(0, 15),
  }
}

async function gerarQuizGroq(promptPayload: QuizPromptPayload, apiKey: string): Promise<QuizResult> {
  const groq = new Groq({ apiKey })
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: QUIZ_PROMPT_SYSTEM },
      { role: 'user', content: buildQuizUserPrompt(promptPayload) },
    ],
    temperature: 0.55,
    max_tokens: 8192,
  })

  const raw = (completion.choices[0]?.message?.content ?? '').replace(/```json\n?|```/g, '').trim()
  return JSON.parse(raw) as QuizResult
}

async function gerarQuizGemini(promptPayload: QuizPromptPayload, apiKey: string): Promise<QuizResult> {
  const genai = new GoogleGenerativeAI(apiKey)
  const model = genai.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      temperature: 0.55,
      maxOutputTokens: 8192,
    },
  })
  const prompt = `${QUIZ_PROMPT_SYSTEM}\n\n${buildQuizUserPrompt(promptPayload)}`
  const result = await model.generateContent(prompt)
  const raw = result.response.text().replace(/```json\n?|```/g, '').trim()
  return JSON.parse(raw) as QuizResult
}

export async function gerarQuizComFallback(payload: {
  promptPayload: QuizPromptPayload
  groqKey?: string
  geminiKey?: string
}) {
  let groqError = ''

  try {
    if (!payload.groqKey) throw new Error('GROQ_API_KEY ausente')
    return validarQuizGerado(await gerarQuizGroq(payload.promptPayload, payload.groqKey))
  } catch (error) {
    groqError = error instanceof Error ? error.message : String(error)
  }

  try {
    if (!payload.geminiKey) throw new Error('GEMINI_API_KEY ausente')
    return validarQuizGerado(await gerarQuizGemini(payload.promptPayload, payload.geminiKey))
  } catch (error) {
    const geminiError = error instanceof Error ? error.message : String(error)
    throw new Error(`Groq: ${groqError} | Gemini: ${geminiError}`)
  }
}
