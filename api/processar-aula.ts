import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import Groq from 'groq-sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { logAdminAction, requireAdmin } from './_lib/auth.js'

function extrairYoutubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

async function buscarMetadadosYoutube(youtubeId: string, apiKey: string) {
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${youtubeId}&key=${apiKey}`
  const response = await fetch(url)
  const data = await response.json() as {
    items?: Array<{
      snippet: {
        title: string
        description: string
        thumbnails: { high: { url: string } }
      }
      contentDetails: { duration: string }
    }>
  }

  const item = data.items?.[0]
  if (!item) return null

  const duration = item.contentDetails.duration
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  const segundos = match
    ? (parseInt(match[1] ?? '0', 10) * 3600) + (parseInt(match[2] ?? '0', 10) * 60) + parseInt(match[3] ?? '0', 10)
    : 0

  return {
    titulo: item.snippet.title,
    descricao: item.snippet.description?.slice(0, 2000) ?? '',
    thumbnail_url: item.snippet.thumbnails.high.url,
    duracao_segundos: segundos,
  }
}

async function buscarTranscricao(youtubeId: string): Promise<string> {
  const CLIENT_VERSION = '20.10.38'
  const response = await fetch('https://www.youtube.com/youtubei/v1/player?prettyPrint=false', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': `com.google.android.youtube/${CLIENT_VERSION} (Linux; U; Android 14)`,
    },
    body: JSON.stringify({
      context: { client: { clientName: 'ANDROID', clientVersion: CLIENT_VERSION } },
      videoId: youtubeId,
    }),
  })

  if (!response.ok) throw new Error(`YouTube InnerTube returned ${response.status}`)

  const data = await response.json() as {
    captions?: { playerCaptionsTracklistRenderer?: { captionTracks?: Array<{ languageCode: string; baseUrl: string }> } }
  }

  const tracks = data.captions?.playerCaptionsTracklistRenderer?.captionTracks
  if (!Array.isArray(tracks) || tracks.length === 0) throw new Error('No captions available')

  const track = tracks.find((item) => item.languageCode === 'pt')
    ?? tracks.find((item) => item.languageCode === 'en')
    ?? tracks[0]

  const xmlResponse = await fetch(track.baseUrl)
  if (!xmlResponse.ok) throw new Error('Failed to fetch caption XML')

  const xml = await xmlResponse.text()
  const regex = /<text[^>]*>([^<]*)<\/text>/g
  const texts: string[] = []

  let match: RegExpExecArray | null
  while ((match = regex.exec(xml)) !== null) {
    const text = match[1]
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim()

    if (text) texts.push(text)
  }

  if (texts.length === 0) throw new Error('No text found in captions')
  return texts.join(' ')
}

type ConteudoBase = 'transcricao' | 'metadados'

const QUIZ_PROMPT_SYSTEM = `Voce e um designer instrucional senior especializado em avaliacoes praticas de marketing digital.
Sua tarefa e criar quizzes especificos da aula, com perguntas que comprovem compreensao real do conteudo apresentado.
Responda apenas com JSON valido, sem markdown, sem comentarios e sem texto extra.`

function criarRecorteTranscricao(transcricao: string) {
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

function buildQuizUserPrompt(payload: {
  conteudo: string
  titulo: string
  descricao: string
  origemConteudo: ConteudoBase
}) {
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

interface QuizResult {
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

type QuizPromptPayload = Parameters<typeof buildQuizUserPrompt>[0]
type ValidatedQuizPergunta = QuizResult['perguntas'][number]

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

function validarQuizGerado(quiz: QuizResult): QuizResult {
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const GROQ_KEY = process.env.GROQ_API_KEY ?? process.env.VITE_GROQ_API_KEY
  const GEMINI_KEY = process.env.GEMINI_API_KEY ?? process.env.VITE_GEMINI_API_KEY
  const YOUTUBE_KEY = process.env.YOUTUBE_API_KEY ?? process.env.VITE_YOUTUBE_API_KEY

  if (!GROQ_KEY && !GEMINI_KEY) {
    return res.status(500).json({ error: 'Chave de API de IA nao configurada.' })
  }
  if (!YOUTUBE_KEY) {
    return res.status(500).json({ error: 'YOUTUBE_API_KEY nao configurada.' })
  }

  const auth = await requireAdmin(req, res)
  if (!auth) return

  const { youtube_url, modulo_id, ordem } = req.body as {
    youtube_url: string
    modulo_id: string
    ordem: number
  }

  if (!youtube_url || !modulo_id) {
    return res.status(400).json({ error: 'youtube_url e modulo_id sao obrigatorios.' })
  }

  const youtubeId = extrairYoutubeId(youtube_url)
  if (!youtubeId) {
    return res.status(400).json({ error: 'URL do YouTube invalida.' })
  }

  try {
    let meta: Awaited<ReturnType<typeof buscarMetadadosYoutube>>
    try {
      meta = await buscarMetadadosYoutube(youtubeId, YOUTUBE_KEY)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return res.status(500).json({ error: `Falha ao buscar metadados do YouTube: ${message}` })
    }

    if (!meta) {
      return res.status(400).json({ error: 'Video nao encontrado no YouTube. Verifique a URL.' })
    }

    let transcricao = ''
    let conteudoPrompt = ''
    let usouTranscricao = false
    try {
      transcricao = await buscarTranscricao(youtubeId)
      if (transcricao.length > 100) usouTranscricao = true
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.warn('[processar-aula] transcricao indisponivel:', message)
      transcricao = ''
    }

    conteudoPrompt = usouTranscricao
      ? criarRecorteTranscricao(transcricao)
      : `Titulo: ${meta.titulo}\n\nDescricao: ${meta.descricao || 'Sem descricao disponivel.'}`

    const quizPromptPayload: QuizPromptPayload = {
      conteudo: conteudoPrompt,
      titulo: meta.titulo,
      descricao: meta.descricao,
      origemConteudo: usouTranscricao ? 'transcricao' : 'metadados',
    }

    let quiz: QuizResult | undefined
    let groqError = ''

    try {
      if (!GROQ_KEY) throw new Error('GROQ_API_KEY ausente')
      quiz = await gerarQuizGroq(quizPromptPayload, GROQ_KEY)
    } catch (error) {
      groqError = error instanceof Error ? error.message : String(error)
      try {
        if (!GEMINI_KEY) throw new Error('GEMINI_API_KEY ausente')
        quiz = await gerarQuizGemini(quizPromptPayload, GEMINI_KEY)
      } catch (geminiError) {
        const message = geminiError instanceof Error ? geminiError.message : String(geminiError)
        return res.status(500).json({
          error: `Falha ao gerar quiz. Groq: ${groqError} | Gemini: ${message}`,
        })
      }
    }

    try {
      quiz = validarQuizGerado(quiz!)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return res.status(422).json({
        error: `Falha na validacao de qualidade do quiz: ${message}`,
        usou_transcricao: usouTranscricao,
      })
    }

    const supabase = createClient(auth.env.supabaseUrl, auth.env.supabaseServiceKey)

    const { data: aulaData, error: aulaError } = await supabase
      .from('aulas')
      .insert({
        modulo_id,
        titulo: meta.titulo,
        youtube_url,
        youtube_id: youtubeId,
        thumbnail_url: meta.thumbnail_url,
        duracao_segundos: meta.duracao_segundos,
        transcricao: usouTranscricao ? transcricao.slice(0, 30000) : null,
        resumo: quiz!.resumo,
        topicos: quiz!.topicos_cobertos,
        ordem: ordem ?? 1,
        processada: true,
      })
      .select()
      .single()

    if (aulaError) {
      return res.status(500).json({ error: `Erro ao salvar aula: ${aulaError.message}` })
    }

    const perguntas = quiz!.perguntas.map((pergunta) => ({
      aula_id: aulaData.id,
      pergunta: pergunta.pergunta,
      opcoes: pergunta.opcoes,
      resposta_correta: pergunta.resposta_correta,
      explicacao: pergunta.explicacao,
      topico: pergunta.topico,
      dificuldade: pergunta.dificuldade,
    }))

    const { error: perguntasError } = await supabase.from('quiz_perguntas').insert(perguntas)
    if (perguntasError) {
      return res.status(500).json({ error: `Erro ao salvar perguntas: ${perguntasError.message}` })
    }

    await logAdminAction(auth.serviceClient, auth.user.id, 'aula.processar', {
      aula_id: aulaData.id,
      modulo_id,
      youtube_id: youtubeId,
      youtube_url,
      perguntas_count: perguntas.length,
      usou_transcricao: usouTranscricao,
    })

    return res.status(200).json({
      success: true,
      aula_id: aulaData.id,
      perguntas_count: perguntas.length,
      resumo: quiz!.resumo,
      usou_transcricao: usouTranscricao,
      qualidade_base: usouTranscricao ? 'transcricao' : 'metadados',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[ERRO GERAL]', message)
    return res.status(500).json({ error: `Erro interno: ${message}`, step: 'unknown' })
  }
}
