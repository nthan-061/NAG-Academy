import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, CheckCircle, Circle } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AulaPlayer } from './AulaPlayer'
import { AulaTabs } from './AulaTabs'
import { AulaSummaryPanel } from './AulaSummaryPanel'
import { AulaChatPanel } from './AulaChatPanel'
import { AulaNotesPanel } from './AulaNotesPanel'
import { useAula } from '../hooks/useAula'

export function AulaScreen() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const {
    data,
    userId,
    loading,
    tab,
    setTab,
    chatInput,
    setChatInput,
    chatMessages,
    chatLoading,
    togglingProgress,
    handleSendChat,
    handleToggleAssistida,
  } = useAula(id)

  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window === 'undefined' ? 1440 : window.innerWidth
  )

  useEffect(() => {
    function handleResize() {
      setViewportWidth(window.innerWidth)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const compactLayout = viewportWidth <= 1180
  const mobileLayout = viewportWidth <= 900

  const pageWrap: React.CSSProperties = {
    marginLeft: mobileLayout ? 0 : '236px',
    paddingTop: '64px',
    minHeight: '100vh',
    boxSizing: 'border-box',
    backgroundColor: '#F5F6FA',
  }

  const pageInner: React.CSSProperties = {
    width: 'min(100%, 1480px)',
    margin: '0 auto',
    padding: mobileLayout ? '16px 16px 24px' : '24px 24px 32px',
    display: 'grid',
    gridTemplateColumns: compactLayout ? 'minmax(0, 1fr)' : 'minmax(0, 1fr) minmax(340px, 380px)',
    gap: mobileLayout ? '16px' : '24px',
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

  if (!data) {
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

  const { aula, modulo, trilha, aulaAnterior, proximaAula, progresso } = data
  const assistida = progresso?.assistida ?? false
  const quizCompletado = progresso?.quiz_completado ?? false

  return (
    <div style={pageWrap}>
      <div style={pageInner}>
        <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: '22px' }}>
          <AulaPlayer youtubeId={aula.youtube_id} title={aula.titulo} />

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              padding: mobileLayout ? '22px 18px' : '30px',
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
                    fontFamily: 'inherit',
                  }}
                >
                  <ChevronLeft size={14} strokeWidth={1.5} /> Anterior
                </button>
              )}

              {userId && (
                assistida ? (
                  <button
                    onClick={() => { void handleToggleAssistida() }}
                    disabled={togglingProgress}
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
                      opacity: togglingProgress ? 0.5 : 1,
                      fontFamily: 'inherit',
                    }}
                  >
                    <CheckCircle size={14} strokeWidth={1.5} />
                    Assistida
                  </button>
                ) : (
                  <button
                    onClick={() => { void handleToggleAssistida() }}
                    disabled={togglingProgress}
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
                      opacity: togglingProgress ? 0.5 : 1,
                      fontFamily: 'inherit',
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
                    fontFamily: 'inherit',
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
                    fontFamily: 'inherit',
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
            position: compactLayout ? 'relative' : 'sticky',
            top: compactLayout ? undefined : '88px',
            maxHeight: compactLayout ? 'none' : 'calc(100vh - 112px)',
            minHeight: compactLayout ? (mobileLayout ? '70vh' : '640px') : 'calc(100vh - 112px)',
            border: '1px solid #E8ECF2',
            backgroundColor: 'rgba(255,255,255,0.94)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderRadius: mobileLayout ? '18px' : '22px',
            boxShadow: '0 16px 40px rgba(10,22,40,0.06)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <AulaTabs currentTab={tab} onChange={setTab} showNotes={!!userId} />

          <div style={{ flex: 1, minHeight: 0, position: 'relative', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: tab === 'resumo' ? 'flex' : 'none', flexDirection: 'column', height: '100%', minHeight: 0 }}>
              <AulaSummaryPanel aula={aula} />
            </div>

            <div style={{ display: tab === 'chat' ? 'flex' : 'none', flexDirection: 'column', height: '100%', minHeight: 0 }}>
              <AulaChatPanel
                aulaTitle={aula.titulo}
                messages={chatMessages}
                input={chatInput}
                loading={chatLoading}
                onInputChange={setChatInput}
                onSend={handleSendChat}
              />
            </div>

            {userId && (
              <div style={{ display: tab === 'notas' ? 'flex' : 'none', flexDirection: 'column', height: '100%', minHeight: 0 }}>
                <AulaNotesPanel aulaId={aula.id} userId={userId} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
