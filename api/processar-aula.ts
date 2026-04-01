import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import Groq from 'groq-sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'

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
  return texts.join(' ').slice(0, 12000)
}

const QUIZ_PROMPT_SYSTEM = `Voce e um especialista em criar avaliacoes de aprendizado eficazes para marketing digital.
Analise o conteudo fornecido e gere um quiz de multipla escolha.
Responda apenas com JSON valido, sem markdown e sem texto extra.`

function buildQuizUserPrompt(conteudo: string, titulo: string) {
  return `TITULO DA AULA: ${titulo}

CONTEUDO:
${conteudo}

Gere um quiz com as seguintes especificacoes:
- Entre 8 e 12 perguntas
- 4 opcoes por pergunta
- Distribuicao: 40% facil, 40% medio, 20% dificil
- Foque em aplicacao pratica, nao memorizacao

Formato JSON:
{
  "resumo": "3-5 frases resumindo os pontos principais",
  "topicos_cobertos": ["topico1", "topico2"],
  "perguntas": [
    {
      "pergunta": "texto da pergunta",
      "opcoes": ["opcao A", "opcao B", "opcao C", "opcao D"],
      "resposta_correta": 0,
      "explicacao": "Maximo 3 frases.",
      "topico": "nome do topico",
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

async function gerarQuizGroq(conteudo: string, titulo: string, apiKey: string): Promise<QuizResult> {
  const groq = new Groq({ apiKey })
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: QUIZ_PROMPT_SYSTEM },
      { role: 'user', content: buildQuizUserPrompt(conteudo, titulo) },
    ],
    temperature: 0.4,
    max_tokens: 4096,
  })

  const raw = completion.choices[0]?.message?.content ?? ''
  return JSON.parse(raw) as QuizResult
}

async function gerarQuizGemini(conteudo: string, titulo: string, apiKey: string): Promise<QuizResult> {
  const genai = new GoogleGenerativeAI(apiKey)
  const model = genai.getGenerativeModel({ model: 'gemini-2.0-flash' })
  const prompt = `${QUIZ_PROMPT_SYSTEM}\n\n${buildQuizUserPrompt(conteudo, titulo)}`
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

  const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
  const GROQ_KEY = process.env.GROQ_API_KEY ?? process.env.VITE_GROQ_API_KEY
  const GEMINI_KEY = process.env.GEMINI_API_KEY ?? process.env.VITE_GEMINI_API_KEY
  const YOUTUBE_KEY = process.env.YOUTUBE_API_KEY ?? process.env.VITE_YOUTUBE_API_KEY
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? process.env.VITE_ADMIN_EMAIL

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Configuracao Supabase ausente no servidor.' })
  }
  if (!GROQ_KEY && !GEMINI_KEY) {
    return res.status(500).json({ error: 'Chave de API de IA nao configurada.' })
  }
  if (!YOUTUBE_KEY) {
    return res.status(500).json({ error: 'YOUTUBE_API_KEY nao configurada.' })
  }
  if (!ADMIN_EMAIL) {
    return res.status(500).json({ error: 'ADMIN_EMAIL nao configurado.' })
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
  if ((authData.user.email ?? '').toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    return res.status(403).json({ error: 'Acesso restrito.' })
  }

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

    let conteudo = ''
    let usouTranscricao = false
    try {
      conteudo = await buscarTranscricao(youtubeId)
      if (conteudo.length > 100) usouTranscricao = true
    } catch {
      conteudo = ''
    }

    if (!usouTranscricao) {
      conteudo = `Titulo: ${meta.titulo}\n\nDescricao: ${meta.descricao}`
    }

    let quiz: QuizResult | undefined
    let groqError = ''

    try {
      if (!GROQ_KEY) throw new Error('GROQ_API_KEY ausente')
      quiz = await gerarQuizGroq(conteudo, meta.titulo, GROQ_KEY)
    } catch (error) {
      groqError = error instanceof Error ? error.message : String(error)
      try {
        if (!GEMINI_KEY) throw new Error('GEMINI_API_KEY ausente')
        quiz = await gerarQuizGemini(conteudo, meta.titulo, GEMINI_KEY)
      } catch (geminiError) {
        const message = geminiError instanceof Error ? geminiError.message : String(geminiError)
        return res.status(500).json({
          error: `Falha ao gerar quiz. Groq: ${groqError} | Gemini: ${message}`,
        })
      }
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    const { data: aulaData, error: aulaError } = await supabase
      .from('aulas')
      .insert({
        modulo_id,
        titulo: meta.titulo,
        youtube_url,
        youtube_id: youtubeId,
        thumbnail_url: meta.thumbnail_url,
        duracao_segundos: meta.duracao_segundos,
        transcricao: usouTranscricao ? conteudo : null,
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

    return res.status(200).json({
      success: true,
      aula_id: aulaData.id,
      perguntas_count: perguntas.length,
      resumo: quiz!.resumo,
      usou_transcricao: usouTranscricao,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[ERRO GERAL]', message)
    return res.status(500).json({ error: `Erro interno: ${message}`, step: 'unknown' })
  }
}
