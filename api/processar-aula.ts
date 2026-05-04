import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import { logAdminAction, requireAdmin } from './_lib/auth.js'
import { gerarQuizComFallback, prepararQuizPromptPayload, toPublicAiError } from './_lib/quiz-generation.js'

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
    let usouTranscricao = false
    try {
      transcricao = await buscarTranscricao(youtubeId)
      if (transcricao.length > 100) usouTranscricao = true
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.warn('[processar-aula] transcricao indisponivel:', message)
      transcricao = ''
    }

    const quizPromptPayload = prepararQuizPromptPayload({
      titulo: meta.titulo,
      descricao: meta.descricao,
      transcricao,
    })
    let quiz
    try {
      quiz = await gerarQuizComFallback({
        promptPayload: quizPromptPayload,
        groqKey: GROQ_KEY,
        geminiKey: GEMINI_KEY,
      })
    } catch (error) {
      const publicError = toPublicAiError(error)
      console.warn('[processar-aula] falha na IA:', error)
      return res.status(publicError.status).json({
        success: false,
        code: publicError.code,
        error: publicError.message,
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
        ativa: true,
      }))

    let { error: perguntasError } = await supabase.from('quiz_perguntas').insert(perguntas)
    if (perguntasError && perguntasError.message.toLowerCase().includes('ativa')) {
      const perguntasCompat = perguntas.map((pergunta) => ({
        aula_id: pergunta.aula_id,
        pergunta: pergunta.pergunta,
        opcoes: pergunta.opcoes,
        resposta_correta: pergunta.resposta_correta,
        explicacao: pergunta.explicacao,
        topico: pergunta.topico,
        dificuldade: pergunta.dificuldade,
      }))
      const retry = await supabase.from('quiz_perguntas').insert(perguntasCompat)
      perguntasError = retry.error
    }

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
