import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { aula_id, mensagem, historico = [] } = req.body as {
      aula_id: string
      mensagem: string
      historico: Array<{ role: 'user' | 'assistant'; content: string }>
    }

    if (!aula_id || !mensagem) {
      return res.status(400).json({ error: 'aula_id e mensagem sao obrigatorios.' })
    }

    const GROQ_KEY = process.env.GROQ_API_KEY ?? process.env.VITE_GROQ_API_KEY
    const GEMINI_KEY = process.env.GEMINI_API_KEY ?? process.env.VITE_GEMINI_API_KEY
    const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!GROQ_KEY && !GEMINI_KEY) {
      return res.status(500).json({ error: 'Nenhuma chave de IA configurada no servidor.' })
    }
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

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    const { data: aula, error: aulaError } = await supabase
      .from('aulas')
      .select('titulo, resumo, topicos, transcricao')
      .eq('id', aula_id)
      .single()

    if (aulaError || !aula) {
      return res.status(404).json({ error: 'Aula nao encontrada.' })
    }

    const systemPrompt = `Voce e um tutor de marketing digital direto e pratico.

REGRAS DE RESPOSTA:
- Maximo 3 paragrafos curtos; seja objetivo
- Use linguagem simples e direta, sem enrolacao
- Quando possivel, use listas curtas com no maximo 4 itens
- Sempre de exemplos praticos e aplicaveis
- Nunca repita a pergunta do usuario
- Nunca diga "Otima pergunta!" ou frases de preenchimento
- Finalize com uma dica pratica ou proximo passo

${aula.titulo ? `CONTEXTO: Esta conversa e sobre a aula "${aula.titulo}". Priorize respostas relacionadas a este tema.` : ''}
${aula.resumo ? `RESUMO DA AULA: ${aula.resumo}` : ''}`

    const contents = [
      ...historico.map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      })),
      { role: 'user', parts: [{ text: mensagem }] },
    ]

    const messagesGroq = [
      { role: 'system', content: systemPrompt },
      ...historico.map((m) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      })),
      { role: 'user', content: mensagem },
    ]

    let resposta = ''
    let lastError = ''

    if (GROQ_KEY) {
      try {
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${GROQ_KEY}`,
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: messagesGroq,
            max_tokens: 300,
            temperature: 0.5,
          }),
        })
        if (groqRes.ok) {
          const groqData = await groqRes.json() as { choices?: Array<{ message: { content: string } }> }
          resposta = groqData.choices?.[0]?.message?.content ?? ''
        } else {
          const text = await groqRes.text()
          lastError = `Groq ${groqRes.status}: ${text.slice(0, 100)}`
        }
      } catch (error) {
        lastError = error instanceof Error ? error.message : String(error)
      }
    }

    if (!resposta && GEMINI_KEY) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              system_instruction: { parts: [{ text: systemPrompt }] },
              contents,
              generationConfig: { maxOutputTokens: 300, temperature: 0.5 },
            }),
          }
        )
        if (geminiRes.ok) {
          const gData = await geminiRes.json() as {
            candidates?: Array<{ content: { parts: Array<{ text: string }> } }>
          }
          resposta = gData.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
        } else {
          const text = await geminiRes.text()
          lastError += ` | Gemini ${geminiRes.status}: ${text.slice(0, 100)}`
        }
      } catch (error) {
        lastError += ` | Gemini: ${error instanceof Error ? error.message : String(error)}`
      }
    }

    if (!resposta) {
      return res.status(500).json({ error: `Falha ao gerar resposta. ${lastError}` })
    }

    return res.status(200).json({ resposta })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return res.status(500).json({ error: `Erro interno: ${message}` })
  }
}
