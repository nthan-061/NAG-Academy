import { useEffect, useRef, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ChevronLeft,
  ChevronRight,
  Send,
  CheckCircle,
  Circle,
  BookOpen,
  MessageCircle,
  FileText,
  MessageSquare,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Aula as AulaType, Modulo, Trilha, UserProgresso } from '@/types'

type Aba = 'resumo' | 'chat' | 'notas'

interface ChatMsg {
  role: 'user' | 'assistant' | 'error'
  content: string
}

function VideoPlayer({ youtubeId }: { youtubeId: string }) {
  return (
    <div
      style={{
        width: '100%',
        aspectRatio: '16 / 9',
        borderRadius: '24px',
        overflow: 'hidden',
        backgroundColor: '#0D1B3E',
        boxShadow: '0 18px 50px rgba(10,22,40,0.14)',
      }}
    >
      <iframe
        src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`}
        title="Aula"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
      />
    </div>
  )
}

function AbaResumo({ aula }: { aula: AulaType }) {
  if (!aula.resumo && (!aula.topicos || aula.topicos.length === 0)) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', fontSize: '13px', color: '#9CA3AF' }}>
        Resumo gerado automaticamente apos o processamento da aula.
      </div>
    )
  }

  return (
    <div
      style={{
        padding: '24px',
        overflowY: 'auto',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
        minHeight: 0,
      }}
    >
      {aula.topicos && aula.topicos.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {aula.topicos.map((topico) => (
            <span
              key={topico}
              style={{
                backgroundColor: '#EBF0FA',
                color: '#2E5FD4',
                fontSize: '12px',
                fontWeight: 600,
                padding: '6px 12px',
                borderRadius: '999px',
              }}
            >
              {topico}
            </span>
          ))}
        </div>
      )}

      {aula.resumo && (
        <p style={{ fontSize: '15px', color: '#4B5563', lineHeight: '1.85', margin: 0 }}>
          {aula.resumo}
        </p>
      )}
    </div>
  )
}

function formatarResposta(texto: string) {
  return texto.split('\n').map((linha, index) => {
    const limpa = linha.trim()

    if (limpa.startsWith('- ') || limpa.startsWith('* ') || limpa.startsWith('• ')) {
      return (
        <div key={index} style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
          <span style={{ color: '#2E5FD4', fontWeight: 700, lineHeight: 1.6 }}>•</span>
          <span>{limpa.replace(/^[-*•]\s/, '')}</span>
        </div>
      )
    }

    if (!limpa) return <div key={index} style={{ height: '8px' }} />
    return <p key={index} style={{ margin: 0 }}>{linha}</p>
  })
}

interface AbaChatProps {
  aula: AulaType
  msgs: ChatMsg[]
  input: string
  loading: boolean
  onInputChange: (value: string) => void
  onSend: () => Promise<void>
}

function AbaChat({ aula, msgs, input, loading, onInputChange, onSend }: AbaChatProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [msgs, loading])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          minHeight: 0,
          overscrollBehavior: 'contain',
          backgroundColor: '#FBFCFF',
        }}
      >
        {msgs.length === 0 && (
          <div
            style={{
              minHeight: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '32px 20px',
              textAlign: 'center',
              color: '#9CA3AF',
            }}
          >
            <MessageSquare size={28} strokeWidth={1.5} />
            <p style={{ fontSize: '13px', margin: 0 }}>
              Tire duvidas sobre o conteudo desta aula.
            </p>
          </div>
        )}

        {msgs.map((msg, index) => {
          if (msg.role === 'user') {
            return (
              <div key={index} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div
                  style={{
                    backgroundColor: '#0D1B3E',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    lineHeight: '1.7',
                    padding: '12px 14px',
                    borderRadius: '18px 18px 6px 18px',
                    maxWidth: '88%',
                    boxShadow: '0 6px 16px rgba(13,27,62,0.14)',
                  }}
                >
                  {msg.content}
                </div>
              </div>
            )
          }

          if (msg.role === 'error') {
            return (
              <div key={index} style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div
                  style={{
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FECACA',
                    color: '#DC2626',
                    fontSize: '13px',
                    lineHeight: '1.7',
                    padding: '12px 14px',
                    borderRadius: '18px 18px 18px 6px',
                    maxWidth: '88%',
                  }}
                >
                  {msg.content}
                </div>
              </div>
            )
          }

          return (
            <div key={index} style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5EAF3',
                  color: '#1A1F2E',
                  fontSize: '14px',
                  lineHeight: '1.8',
                  padding: '14px 16px',
                  borderRadius: '18px 18px 18px 6px',
                  maxWidth: '92%',
                  boxShadow: '0 8px 20px rgba(10,22,40,0.05)',
                }}
              >
                {formatarResposta(msg.content)}
              </div>
            </div>
          )
        })}

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5EAF3',
                padding: '12px 14px',
                borderRadius: '18px 18px 18px 6px',
              }}
            >
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                {[0, 150, 300].map((delay) => (
                  <span
                    key={delay}
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
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

      <div
        style={{
          padding: '14px 16px 16px',
          borderTop: '1px solid #E8ECF2',
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
        }}
      >
        <input
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              void onSend()
            }
          }}
          placeholder={`Pergunte sobre ${aula.titulo.slice(0, 40)}...`}
          style={{
            flex: 1,
            border: '1px solid #C8D3EA',
            borderRadius: '14px',
            padding: '14px 16px',
            fontSize: '14px',
            outline: 'none',
            color: '#1A1F2E',
            backgroundColor: '#F9FBFF',
          }}
          onFocus={(e) => { e.target.style.borderColor = '#2E5FD4' }}
          onBlur={(e) => { e.target.style.borderColor = '#C8D3EA' }}
          disabled={loading}
        />
        <button
          onClick={() => { void onSend() }}
          disabled={!input.trim() || loading}
          style={{
            backgroundColor: '#0D1B3E',
            border: 'none',
            borderRadius: '14px',
            width: '48px',
            height: '48px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: (!input.trim() || loading) ? 0.45 : 1,
            flexShrink: 0,
          }}
        >
          <Send size={17} strokeWidth={1.5} color="white" />
        </button>
      </div>
    </div>
  )
}

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

  function handleChange(value: string) {
    setNotas(value)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      setSalvando(true)
      await supabase
        .from('user_progresso')
        .upsert({ user_id: userId, aula_id: aulaId, notas: value }, {
          onConflict: 'user_id,aula_id',
        })
      setSalvando(false)
    }, 800)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <div
        style={{
          padding: '14px 18px',
          borderBottom: '1px solid #E8ECF2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>
          Suas anotacoes sao salvas automaticamente
        </p>
        {salvando && (
          <span style={{ fontSize: '11px', color: '#9CA3AF' }}>Salvando...</span>
        )}
      </div>

      <textarea
        value={notas}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Escreva suas anotacoes aqui..."
        style={{
          flex: 1,
          border: 'none',
          outline: 'none',
          resize: 'none',
          padding: '20px',
          fontSize: '15px',
          color: '#1A1F2E',
          lineHeight: '1.85',
          backgroundColor: '#FFFFFF',
          fontFamily: 'inherit',
          minHeight: '280px',
        }}
      />
    </div>
  )
}

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
  const [chatMsgs, setChatMsgs] = useState<ChatMsg[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)

  useEffect(() => {
    if (!id) return

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)

      const { data: aulaData } = await supabase
        .from('aulas')
        .select('*')
        .eq('id', id)
        .single()

      if (!aulaData) {
        setLoading(false)
        return
      }

      setAula(aulaData)

      const [{ data: moduloData }, progressoData] = await Promise.all([
        supabase.from('modulos').select('*').eq('id', aulaData.modulo_id).single(),
        user
          ? supabase.from('user_progresso').select('*').eq('user_id', user.id).eq('aula_id', id).maybeSingle()
          : Promise.resolve({ data: null }),
      ])

      if (moduloData) {
        setModulo(moduloData)

        const { data: trilhaData } = await supabase
          .from('trilhas')
          .select('*')
          .eq('id', moduloData.trilha_id)
          .single()

        if (trilhaData) setTrilha(trilhaData)

        const { data: todasAulas } = await supabase
          .from('aulas')
          .select('*')
          .eq('modulo_id', moduloData.id)
          .order('ordem')

        if (todasAulas) {
          const index = todasAulas.findIndex((item) => item.id === id)
          if (index > 0) setAulaAnterior(todasAulas[index - 1])
          if (index < todasAulas.length - 1) setProximaAula(todasAulas[index + 1])
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

  async function enviarChat() {
    if (!aula || chatLoading) return

    const texto = chatInput.trim()
    if (!texto) return

    setChatInput('')
    const novasMsgs: ChatMsg[] = [...chatMsgs, { role: 'user', content: texto }]
    setChatMsgs(novasMsgs)
    setChatLoading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        setChatMsgs([...novasMsgs, { role: 'error', content: 'Sua sessao expirou. Faca login novamente.' }])
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
          historico: chatMsgs.filter((msg) => msg.role !== 'error'),
        }),
      })

      let json: { resposta?: string; error?: string }
      try {
        json = await res.json()
      } catch {
        const text = await res.text().catch(() => `HTTP ${res.status}`)
        setChatMsgs([...novasMsgs, { role: 'error', content: `Erro do servidor: ${text.slice(0, 120)}` }])
        return
      }

      if (!res.ok || !json.resposta) {
        setChatMsgs([...novasMsgs, { role: 'error', content: json.error ?? 'Nao foi possivel responder. Tente novamente.' }])
      } else {
        setChatMsgs([...novasMsgs, { role: 'assistant', content: json.resposta }])
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro de conexao'
      setChatMsgs([...novasMsgs, { role: 'error', content: `Nao foi possivel responder: ${message}` }])
    } finally {
      setChatLoading(false)
    }
  }

  const pageWrap: React.CSSProperties = {
    marginLeft: '236px',
    paddingTop: '64px',
    minHeight: '100vh',
    boxSizing: 'border-box',
    backgroundColor: '#F5F6FA',
  }

  const pageInner: React.CSSProperties = {
    width: 'min(100%, 1480px)',
    margin: '0 auto',
    padding: '24px 24px 32px',
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) minmax(340px, 380px)',
    gap: '24px',
    alignItems: 'start',
  }

  if (loading) {
    return (
      <div style={pageWrap}>
        <div style={pageInner}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="animate-pulse rounded-xl" style={{ aspectRatio: '16/9', backgroundColor: '#E8ECF2' }} />
            <div className="animate-pulse h-8 w-2/3 rounded-lg" style={{ backgroundColor: '#E8ECF2' }} />
          </div>
          <div className="animate-pulse rounded-xl" style={{ width: '100%', minHeight: '420px', backgroundColor: '#E8ECF2' }} />
        </div>
      </div>
    )
  }

  if (!aula) {
    return (
      <div style={pageWrap}>
        <div style={{ ...pageInner, gridTemplateColumns: '1fr' }}>
          <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: '#6B7280' }}>Aula nao encontrada.</p>
          </div>
        </div>
      </div>
    )
  }

  const assistida = progresso?.assistida ?? false
  const quizCompletado = progresso?.quiz_completado ?? false

  const abas: { key: Aba; label: string; icon: typeof BookOpen }[] = [
    { key: 'resumo', label: 'Resumo', icon: BookOpen },
    { key: 'chat', label: 'Chat IA', icon: MessageCircle },
    { key: 'notas', label: 'Notas', icon: FileText },
  ]

  return (
    <div style={pageWrap}>
      <div style={pageInner}>
        <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: '22px' }}>
          <VideoPlayer youtubeId={aula.youtube_id} />

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              padding: '30px',
              borderRadius: '20px',
              border: '1px solid #E8ECF2',
              backgroundColor: 'rgba(255,255,255,0.9)',
              boxShadow: '0 16px 40px rgba(10,22,40,0.06)',
              backdropFilter: 'blur(14px)',
            }}
          >
            {trilha && modulo && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#9CA3AF', flexWrap: 'wrap' }}>
                <Link to="/trilhas" style={{ color: '#2E5FD4', textDecoration: 'none' }}>Trilhas</Link>
                <ChevronRight size={12} />
                <Link to={`/trilhas/${trilha.id}`} style={{ color: '#2E5FD4', textDecoration: 'none' }}>{trilha.titulo}</Link>
                <ChevronRight size={12} />
                <span>{modulo.titulo}</span>
              </div>
            )}

            <h1
              style={{
                fontSize: 'clamp(26px, 3vw, 34px)',
                fontWeight: 700,
                color: '#1A1F2E',
                margin: 0,
                lineHeight: '1.18',
                letterSpacing: '-0.03em',
              }}
            >
              {aula.titulo}
            </h1>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                flexWrap: 'wrap',
                paddingTop: '20px',
                borderTop: '1px solid #E8ECF2',
              }}
            >
              {aulaAnterior && (
                <button
                  onClick={() => navigate(`/aula/${aulaAnterior.id}`)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 16px',
                    borderRadius: '10px',
                    border: '1px solid #E8ECF2',
                    backgroundColor: '#FFFFFF',
                    color: '#6B7280',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  <ChevronLeft size={14} strokeWidth={1.5} /> Anterior
                </button>
              )}

              {userId && (
                assistida ? (
                  <button
                    onClick={toggleAssistida}
                    disabled={toggling}
                    title="Clique para desmarcar"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '10px 16px',
                      borderRadius: '10px',
                      border: '1px solid #BBF7D0',
                      backgroundColor: '#F0FDF4',
                      color: '#16A34A',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      opacity: toggling ? 0.5 : 1,
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
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '10px 16px',
                      borderRadius: '10px',
                      border: '1px solid #E8ECF2',
                      backgroundColor: '#FFFFFF',
                      color: '#6B7280',
                      fontSize: '13px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      opacity: toggling ? 0.5 : 1,
                    }}
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
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 18px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: '#0D1B3E',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    marginLeft: 'auto',
                  }}
                >
                  Proxima <ChevronRight size={14} strokeWidth={1.5} />
                </button>
              )}
            </div>

            {assistida && (
              <div
                style={{
                  padding: '22px 24px',
                  background: 'linear-gradient(135deg, #EDF3FF 0%, #F8FBFF 100%)',
                  border: '1px solid rgba(46,95,212,0.32)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <p style={{ fontSize: '16px', fontWeight: 700, color: '#0D1B3E', margin: '0 0 4px 0' }}>
                    {quizCompletado ? 'Quiz concluido' : 'Quiz disponivel'}
                  </p>
                  <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
                    {quizCompletado
                      ? `Voce acertou ${progresso?.acertos ?? 0} de ${progresso?.total_perguntas ?? 0}, clique para refazer`
                      : 'Teste seu conhecimento sobre esta aula'}
                  </p>
                </div>

                <button
                  onClick={() => navigate(`/aula/${aula.id}/quiz`)}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: '#0D1B3E',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  {quizCompletado ? 'Refazer quiz' : 'Fazer quiz'}
                </button>
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            minWidth: 0,
            position: 'sticky',
            top: '88px',
            maxHeight: 'calc(100vh - 112px)',
            border: '1px solid #E8ECF2',
            backgroundColor: 'rgba(255,255,255,0.94)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderRadius: '22px',
            boxShadow: '0 16px 40px rgba(10,22,40,0.06)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div
            style={{
              display: 'flex',
              borderBottom: '1px solid #E8ECF2',
              backgroundColor: '#FFFFFF',
              flexShrink: 0,
              minHeight: '72px',
              padding: '0 10px',
            }}
          >
            {abas.map(({ key, label, icon: Icon }) => {
              const active = aba === key
              return (
                <button
                  key={key}
                  onClick={() => setAba(key)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '14px 8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    backgroundColor: 'transparent',
                    borderBottom: active ? '2px solid #0D1B3E' : '2px solid transparent',
                    marginBottom: '-1px',
                    color: active ? '#0D1B3E' : '#9CA3AF',
                    fontSize: '12px',
                    fontWeight: active ? 700 : 500,
                    transition: 'color 0.15s',
                  }}
                >
                  <Icon size={16} strokeWidth={1.5} color={active ? '#0D1B3E' : '#9CA3AF'} />
                  {label}
                </button>
              )
            })}
          </div>

          <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
            <div style={{ display: aba === 'resumo' ? 'flex' : 'none', flexDirection: 'column', height: '100%' }}>
              <AbaResumo aula={aula} />
            </div>

            <div style={{ display: aba === 'chat' ? 'flex' : 'none', flexDirection: 'column', height: '100%' }}>
              <AbaChat
                aula={aula}
                msgs={chatMsgs}
                input={chatInput}
                loading={chatLoading}
                onInputChange={setChatInput}
                onSend={enviarChat}
              />
            </div>

            {userId && (
              <div style={{ display: aba === 'notas' ? 'flex' : 'none', flexDirection: 'column', height: '100%' }}>
                <AbaNotas aulaId={aula.id} userId={userId} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
