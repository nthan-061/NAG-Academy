import { useEffect, useRef, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Send, CheckCircle, Circle, BookOpen, MessageCircle, FileText, MessageSquare } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Aula as AulaType, Modulo, Trilha, UserProgresso } from '@/types'

type Aba = 'resumo' | 'chat' | 'notas'

interface ChatMsg { role: 'user' | 'assistant' | 'error'; content: string }

// ---------- YouTube Player ----------
function VideoPlayer({ youtubeId }: { youtubeId: string }) {
  return (
    <div className="rounded-xl overflow-hidden w-full" style={{ aspectRatio: '16/9' }}>
      <iframe
        src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`}
        title="Aula"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full border-0"
      />
    </div>
  )
}

// ---------- Aba Resumo ----------
function AbaResumo({ aula }: { aula: AulaType }) {
  if (!aula.resumo && (!aula.topicos || aula.topicos.length === 0)) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', fontSize: '13px', color: '#9CA3AF' }}>
        Resumo gerado automaticamente após o processamento da aula.
      </div>
    )
  }

  return (
    <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {aula.topicos && aula.topicos.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {aula.topicos.map((t) => (
            <span
              key={t}
              style={{
                backgroundColor: '#EBF0FA',
                color: '#2E5FD4',
                fontSize: '12px',
                fontWeight: 500,
                padding: '4px 12px',
                borderRadius: '20px',
              }}
            >
              {t}
            </span>
          ))}
        </div>
      )}
      {aula.resumo && (
        <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.8', margin: 0 }}>
          {aula.resumo}
        </p>
      )}
    </div>
  )
}

// ---------- formatarResposta ----------
function formatarResposta(texto: string) {
  return texto.split('\n').map((linha, i) => {
    if (linha.startsWith('- ') || linha.startsWith('• ')) {
      return (
        <div key={i} className="flex gap-2 mt-1">
          <span className="flex-shrink-0 mt-0.5" style={{ color: '#2E5FD4' }}>•</span>
          <span>{linha.replace(/^[-•]\s/, '')}</span>
        </div>
      )
    }
    if (linha.trim() === '') return <div key={i} className="h-2" />
    return <p key={i} className="mt-0.5">{linha}</p>
  })
}

// ---------- Aba Chat IA ----------
function AbaChat({ aula }: { aula: AulaType }) {
  const [msgs, setMsgs] = useState<ChatMsg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs])

  async function enviar() {
    const texto = input.trim()
    if (!texto || loading) return
    setInput('')

    const novasMsgs: ChatMsg[] = [...msgs, { role: 'user', content: texto }]
    setMsgs(novasMsgs)
    setLoading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        setMsgs([...novasMsgs, { role: 'error', content: 'Sua sessao expirou. Faca login novamente.' }])
        return
      }

      const res = await fetch('/api/chat-aula', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          aula_id: aula.id,
          mensagem: texto,
          historico: msgs.filter((m) => m.role !== 'error'),
        }),
      })

      let json: { resposta?: string; error?: string }
      try {
        json = await res.json()
      } catch {
        const text = await res.text().catch(() => `HTTP ${res.status}`)
        setMsgs([...novasMsgs, { role: 'error', content: `Erro do servidor: ${text.slice(0, 120)}` }])
        return
      }

      if (!res.ok || !json.resposta) {
        setMsgs([...novasMsgs, { role: 'error', content: json.error ?? 'Não foi possível responder. Tente novamente.' }])
      } else {
        setMsgs([...novasMsgs, { role: 'assistant', content: json.resposta }])
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro de conexão'
      setMsgs([...novasMsgs, { role: 'error', content: `Não foi possível responder: ${msg}` }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', minHeight: 0 }}>
        {msgs.length === 0 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '24px', textAlign: 'center' }}>
            <MessageSquare size={28} strokeWidth={1.5} color="#D1D5DB" />
            <p style={{ fontSize: '13px', color: '#9CA3AF', margin: 0 }}>
              Tire dúvidas sobre o conteúdo desta aula
            </p>
          </div>
        )}

        {msgs.map((m, i) => {
          if (m.role === 'user') {
            return (
              <div key={i} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{
                  backgroundColor: '#0D1B3E', color: '#FFFFFF',
                  fontSize: '13px', lineHeight: '1.6',
                  padding: '10px 14px', borderRadius: '16px 16px 4px 16px',
                  maxWidth: '85%',
                }}>
                  {m.content}
                </div>
              </div>
            )
          }
          if (m.role === 'error') {
            return (
              <div key={i} style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626',
                  fontSize: '13px', lineHeight: '1.6',
                  padding: '10px 14px', borderRadius: '16px 16px 16px 4px',
                  maxWidth: '85%',
                }}>
                  {m.content}
                </div>
              </div>
            )
          }
          return (
            <div key={i} style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{
                backgroundColor: '#F5F6FA', border: '1px solid #E8ECF2', color: '#1A1F2E',
                fontSize: '13px', lineHeight: '1.7',
                padding: '10px 14px', borderRadius: '16px 16px 16px 4px',
                maxWidth: '85%',
              }}>
                {formatarResposta(m.content)}
              </div>
            </div>
          )
        })}

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              backgroundColor: '#F5F6FA', border: '1px solid #E8ECF2',
              padding: '10px 14px', borderRadius: '16px 16px 16px 4px',
            }}>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                {[0, 150, 300].map((delay) => (
                  <span
                    key={delay}
                    style={{
                      width: '6px', height: '6px', borderRadius: '50%',
                      backgroundColor: '#9CA3AF',
                      animation: 'bounce 1s infinite',
                      animationDelay: `${delay}ms`,
                      display: 'inline-block',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div style={{ padding: '14px 16px', borderTop: '1px solid #E8ECF2', display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && enviar()}
          placeholder="Pergunte sobre esta aula..."
          style={{
            flex: 1, border: '1px solid #E8ECF2', borderRadius: '8px',
            padding: '8px 12px', fontSize: '13px', outline: 'none',
            color: '#1A1F2E', backgroundColor: '#F5F6FA',
          }}
          onFocus={(e) => { e.target.style.borderColor = '#2E5FD4' }}
          onBlur={(e) => { e.target.style.borderColor = '#E8ECF2' }}
          disabled={loading}
        />
        <button
          onClick={enviar}
          disabled={!input.trim() || loading}
          style={{
            backgroundColor: '#0D1B3E', border: 'none', borderRadius: '8px',
            padding: '8px', cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            opacity: (!input.trim() || loading) ? 0.4 : 1,
          }}
          onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = '#1E3A6E' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#0D1B3E' }}
        >
          <Send size={16} strokeWidth={1.5} color="white" />
        </button>
      </div>
    </div>
  )
}

// ---------- Aba Notas ----------
function AbaNotas({ aulaId, userId }: { aulaId: string; userId: string }) {
  const [notas, setNotas] = useState('')
  const [salvando, setSalvando] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    supabase
      .from('user_progresso')
      .select('notas')
      .eq('aula_id', aulaId)
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data }) => {
        const row = data as { notas?: string } | null
        if (row?.notas) setNotas(row.notas)
      })
  }, [aulaId, userId])

  function handleChange(val: string) {
    setNotas(val)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      setSalvando(true)
      await supabase
        .from('user_progresso')
        .upsert({ user_id: userId, aula_id: aulaId, notas: val }, {
          onConflict: 'user_id,aula_id',
        })
      setSalvando(false)
    }, 800)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #E8ECF2', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>
          Suas anotações são salvas automaticamente
        </p>
        {salvando && (
          <span style={{ fontSize: '11px', color: '#9CA3AF' }}>Salvando...</span>
        )}
      </div>
      <textarea
        value={notas}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Escreva suas anotações aqui..."
        style={{
          flex: 1, border: 'none', outline: 'none', resize: 'none',
          padding: '16px', fontSize: '14px', color: '#1A1F2E',
          lineHeight: '1.7', backgroundColor: '#FFFFFF', fontFamily: 'inherit',
          minHeight: '200px',
        }}
      />
    </div>
  )
}

// ---------- Página principal ----------
export function Aula() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [aula, setAula] = useState<AulaType | null>(null)
  const [modulo, setModulo] = useState<Modulo | null>(null)
  const [trilha, setTrilha] = useState<Trilha | null>(null)
  const [aulaAnterior, setAulaAnterior] = useState<AulaType | null>(null)
  const [proximaAula, setProximaAula] = useState<AulaType | null>(null)
  const [progresso, setProgresso] = useState<UserProgresso | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [aba, setAba] = useState<Aba>('resumo')
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)

  useEffect(() => {
    if (!id) return

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)

      const { data: aulaData } = await supabase
        .from('aulas')
        .select('*')
        .eq('id', id!)
        .single()

      if (!aulaData) { setLoading(false); return }
      setAula(aulaData)

      const [{ data: moduloData }, progressoData] = await Promise.all([
        supabase.from('modulos').select('*').eq('id', aulaData.modulo_id).single(),
        user
          ? supabase.from('user_progresso').select('*').eq('user_id', user.id).eq('aula_id', id!).maybeSingle()
          : Promise.resolve({ data: null }),
      ])

      if (moduloData) {
        setModulo(moduloData)
        const { data: trilhaData } = await supabase
          .from('trilhas').select('*').eq('id', moduloData.trilha_id).single()
        if (trilhaData) setTrilha(trilhaData)

        const { data: todasAulas } = await supabase
          .from('aulas').select('*').eq('modulo_id', moduloData.id).order('ordem')

        if (todasAulas) {
          const idx = todasAulas.findIndex((a) => a.id === id)
          if (idx > 0) setAulaAnterior(todasAulas[idx - 1])
          if (idx < todasAulas.length - 1) setProximaAula(todasAulas[idx + 1])
        }
      }

      if (progressoData.data) setProgresso(progressoData.data)
      setLoading(false)
    }

    load()
  }, [id])

  async function toggleAssistida() {
    if (!userId || !id || toggling) return
    setToggling(true)

    const novoStatus = !progresso?.assistida

    await supabase.from('user_progresso').upsert(
      {
        user_id: userId,
        aula_id: id,
        assistida: novoStatus,
        ...(novoStatus === false && {
          quiz_completado: false,
          acertos: 0,
          total_perguntas: 0,
          percentual_acerto: 0,
        }),
      },
      { onConflict: 'user_id,aula_id' }
    )

    setProgresso((prev) => ({
      ...(prev ?? {
        id: '',
        user_id: userId,
        aula_id: id,
        quiz_completado: false,
        acertos: 0,
        total_perguntas: 0,
        percentual_acerto: null,
        xp_ganho: 0,
        completed_at: null,
      }),
      assistida: novoStatus,
      ...(novoStatus === false && {
        quiz_completado: false,
        acertos: 0,
        total_perguntas: 0,
        percentual_acerto: null,
      }),
    }))
    setToggling(false)
  }

  const pageWrap: React.CSSProperties = {
    marginLeft: '236px',
    paddingTop: '64px',
    minHeight: '100vh',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '24px',
    padding: '24px 24px 32px 24px',
    backgroundColor: '#F5F6FA',
  }

  if (loading) {
    return (
      <div style={{ ...pageWrap }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="animate-pulse rounded-xl" style={{ aspectRatio: '16/9', backgroundColor: '#E8ECF2' }} />
          <div className="animate-pulse h-8 w-2/3 rounded-lg" style={{ backgroundColor: '#E8ECF2' }} />
        </div>
        <div className="animate-pulse rounded-xl" style={{ width: '320px', height: '400px', backgroundColor: '#E8ECF2', flexShrink: 0 }} />
      </div>
    )
  }

  if (!aula) {
    return (
      <div style={{ ...pageWrap, alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#6B7280' }}>Aula não encontrada.</p>
      </div>
    )
  }

  const assistida = progresso?.assistida ?? false
  const quizCompletado = progresso?.quiz_completado ?? false

  const ABAS: { key: Aba; label: string; icon: typeof BookOpen }[] = [
    { key: 'resumo', label: 'Resumo',  icon: BookOpen },
    { key: 'chat',   label: 'Chat IA', icon: MessageCircle },
    { key: 'notas',  label: 'Notas',   icon: FileText },
  ]

  return (
    <div style={{ ...pageWrap }}>
      {/* Coluna principal — player */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <VideoPlayer youtubeId={aula.youtube_id} />

        {/* Conteúdo abaixo do player — scrollável */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          padding: '28px',
          borderRadius: '20px',
          border: '1px solid #E8ECF2',
          backgroundColor: 'rgba(255,255,255,0.88)',
          boxShadow: '0 16px 40px rgba(10,22,40,0.06)',
          backdropFilter: 'blur(14px)',
        }}>
          {/* Breadcrumb */}
          {trilha && modulo && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#9CA3AF', marginBottom: '12px', flexWrap: 'wrap' }}>
              <Link to="/trilhas" style={{ color: '#2E5FD4', textDecoration: 'none' }}
                onMouseOver={(e) => { e.currentTarget.style.textDecoration = 'underline' }}
                onMouseOut={(e) => { e.currentTarget.style.textDecoration = 'none' }}>
                Trilhas
              </Link>
              <ChevronRight size={12} />
              <Link to={`/trilhas/${trilha.id}`} style={{ color: '#2E5FD4', textDecoration: 'none' }}
                onMouseOver={(e) => { e.currentTarget.style.textDecoration = 'underline' }}
                onMouseOut={(e) => { e.currentTarget.style.textDecoration = 'none' }}>
                {trilha.titulo}
              </Link>
              <ChevronRight size={12} />
              <span>{modulo.titulo}</span>
            </div>
          )}

          <h1 style={{ fontSize: 'clamp(26px, 3vw, 34px)', fontWeight: 700, color: '#1A1F2E', margin: '0 0 8px 0', lineHeight: '1.18', letterSpacing: '-0.03em' }}>
            {aula.titulo}
          </h1>

          {/* Navegação + botão assistida */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', paddingTop: '20px', borderTop: '1px solid #E8ECF2' }}>
            {aulaAnterior && (
              <button
                onClick={() => navigate(`/aula/${aulaAnterior.id}`)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '10px 16px', borderRadius: '10px',
                  border: '1px solid #E8ECF2', backgroundColor: '#FFFFFF',
                  color: '#6B7280', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F5F6FA' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#FFFFFF' }}
              >
                <ChevronLeft size={14} strokeWidth={1.5} /> Anterior
              </button>
            )}

            {/* Toggle assistida */}
            {userId && (
              assistida ? (
                <button
                  onClick={toggleAssistida}
                  disabled={toggling}
                  title="Clique para desmarcar"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '10px 16px', borderRadius: '10px',
                    border: '1px solid #BBF7D0', backgroundColor: '#F0FDF4',
                    color: '#16A34A', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                    opacity: toggling ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#FEF2F2'
                    e.currentTarget.style.color = '#DC2626'
                    e.currentTarget.style.borderColor = '#FECACA'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#F0FDF4'
                    e.currentTarget.style.color = '#16A34A'
                    e.currentTarget.style.borderColor = '#BBF7D0'
                  }}
                >
                  <CheckCircle size={14} strokeWidth={1.5} />
                  Assistida
                </button>
              ) : (
                <button
                  onClick={toggleAssistida}
                  disabled={toggling}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '10px 16px', borderRadius: '10px',
                    border: '1px solid #E8ECF2', backgroundColor: '#FFFFFF',
                    color: '#6B7280', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                    opacity: toggling ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F5F6FA' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#FFFFFF' }}
                >
                  <Circle size={14} strokeWidth={1.5} />
                  Marcar como assistida
                </button>
              )
            )}

            {proximaAula && (
              <button
                onClick={() => navigate(`/aula/${proximaAula.id}`)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '10px 18px', borderRadius: '10px',
                  border: 'none', backgroundColor: '#0D1B3E',
                  color: '#FFFFFF', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                  marginLeft: 'auto',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1E3A6E' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#0D1B3E' }}
              >
                Próxima <ChevronRight size={14} strokeWidth={1.5} />
              </button>
            )}
          </div>

          {/* CTA Quiz — aparece sempre que assistida */}
          {assistida && (
            <div style={{
              marginTop: '4px', padding: '22px 24px',
              background: 'linear-gradient(135deg, #EDF3FF 0%, #F8FBFF 100%)', border: '1px solid rgba(46,95,212,0.32)',
              borderRadius: '16px', display: 'flex',
              alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap',
            }}>
              <div>
                <p style={{ fontSize: '16px', fontWeight: 700, color: '#0D1B3E', margin: '0 0 4px 0' }}>
                  {quizCompletado ? 'Quiz concluído' : 'Quiz disponível'}
                </p>
                <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
                  {quizCompletado
                    ? `Você acertou ${progresso?.acertos ?? 0} de ${progresso?.total_perguntas ?? 0} — clique para refazer`
                    : 'Teste seu conhecimento sobre esta aula'}
                </p>
              </div>
              <button
                onClick={() => navigate(`/aula/${aula.id}/quiz`)}
                style={{
                  padding: '12px 20px', borderRadius: '10px',
                  border: 'none', backgroundColor: '#0D1B3E',
                  color: '#FFFFFF', fontSize: '14px', fontWeight: 600,
                  cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1E3A6E' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#0D1B3E' }}
              >
                {quizCompletado ? 'Refazer quiz' : 'Fazer quiz'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Painel direito — abas */}
      <div style={{
        width: 'min(360px, 32vw)',
        flexShrink: 0,
        border: '1px solid #E8ECF2',
        backgroundColor: 'rgba(255,255,255,0.92)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderRadius: '20px',
        boxShadow: '0 16px 40px rgba(10,22,40,0.06)',
        position: 'sticky',
        top: '80px',
        maxHeight: 'calc(100vh - 104px)',
      }}>
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #E8ECF2', backgroundColor: '#FFFFFF', flexShrink: 0, minHeight: '64px', padding: '0 8px' }}>
          {ABAS.map(({ key, label, icon: Icon }) => {
            const active = aba === key
            return (
              <button
                key={key}
                onClick={() => setAba(key)}
                style={{
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', gap: '6px', padding: '14px 8px',
                  border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  backgroundColor: 'transparent',
                  borderBottom: active ? '2px solid #0D1B3E' : '2px solid transparent',
                  marginBottom: '-1px',
                  color: active ? '#0D1B3E' : '#9CA3AF',
                  fontSize: '12px', fontWeight: active ? 700 : 500,
                  transition: 'color 0.15s',
                }}
              >
                <Icon size={15} strokeWidth={1.5} color={active ? '#0D1B3E' : '#9CA3AF'} />
                {label}
              </button>
            )
          })}
        </div>

        {/* Conteúdo da aba */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {aba === 'resumo' && <AbaResumo aula={aula} />}
          {aba === 'chat' && <AbaChat aula={aula} />}
          {aba === 'notas' && userId && <AbaNotas aulaId={aula.id} userId={userId} />}
        </div>
      </div>
    </div>
  )
}
