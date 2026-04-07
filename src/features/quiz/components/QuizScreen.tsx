import { useEffect, useState } from 'react'
import { useNavigate, Link, useParams, useBlocker } from 'react-router-dom'
import { AlertTriangle, Target } from 'lucide-react'
import { XPToast } from '@/components/ui/Toast'
import { QuizHeader } from './QuizHeader'
import { QuizOption } from './QuizOption'
import { QuizFeedback } from './QuizFeedback'
import { QuizResult } from './QuizResult'
import { ReflexaoEtapa } from './ReflexaoEtapa'
import { useQuiz } from '../hooks/useQuiz'
import { getQuizProgressPercent } from '../utils'

export function QuizScreen() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window === 'undefined' ? 1440 : window.innerWidth
  )
  const {
    aula,
    perguntas,
    perguntaAtual,
    loading,
    status,
    indice,
    selecionada,
    setSelecionada,
    ultimaResposta,
    totalPerguntas,
    resultado,
    showToast,
    setShowToast,
    confirmAnswer,
    advanceQuiz,
    goToReflexao,
    handleReflexaoApproved,
  } = useQuiz(id)

  // Block all in-app navigation while the user is in the mandatory reflection step.
  // The browser back button and <Link> clicks are both intercepted.
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      status === 'reflexao' && currentLocation.pathname !== nextLocation.pathname,
  )

  useEffect(() => {
    function handleResize() {
      setViewportWidth(window.innerWidth)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const mobileLayout = viewportWidth <= 900

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F6FA' }}>
        <div className="w-8 h-8 border-2 border-[#0D1B3E] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!aula || perguntas.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ backgroundColor: '#F5F6FA' }}>
        <p className="text-base font-medium" style={{ color: '#1A1F2E' }}>
          Nenhuma pergunta disponivel para esta aula.
        </p>
        <Link to={`/aula/${id}`} className="text-sm" style={{ color: '#2E5FD4' }}>
          Voltar para a aula
        </Link>
      </div>
    )
  }

  const progressPercent = getQuizProgressPercent(indice, totalPerguntas, status === 'confirmado')

  return (
    <div
      style={{
        marginLeft: mobileLayout ? 0 : '236px',
        paddingTop: '64px',
        minHeight: '100vh',
        backgroundColor: '#F5F6FA',
      }}
    >
      <QuizHeader
        aulaTitulo={aula.titulo}
        indice={indice}
        totalPerguntas={totalPerguntas}
        statusLabel={
          status === 'resultado' ? 'Resultado final'
          : status === 'reflexao' ? 'Reflexão obrigatória'
          : ''
        }
        progressPercent={progressPercent}
        showProgress={status !== 'resultado' && status !== 'reflexao'}
        onExit={() => {
          if (confirm('Sair do quiz? Seu progresso sera perdido.')) navigate(`/aula/${id}`)
        }}
      />

      <div style={{ padding: mobileLayout ? '20px 12px 28px' : '36px 20px', display: 'flex', justifyContent: 'center' }}>
        <div
          className="animate-slideUp"
          style={{
            width: '100%',
            maxWidth: status === 'resultado' || status === 'reflexao' ? '640px' : '760px',
            borderRadius: '24px',
            padding: mobileLayout
              ? (status === 'resultado' || status === 'reflexao' ? '26px 18px' : '24px 18px')
              : (status === 'resultado' || status === 'reflexao' ? '34px 32px' : '40px'),
            backgroundColor: '#FFFFFF',
            boxShadow: '0 20px 50px rgba(10,22,40,0.08)',
            border: '1px solid #E8ECF2',
          }}
        >
          {status === 'resultado' && resultado ? (
            <QuizResult
              result={resultado}
              onShowToast={() => setShowToast(true)}
              onContinueToReflexao={goToReflexao}
            />
          ) : status === 'reflexao' && resultado ? (
            <ReflexaoEtapa
              aulaId={id!}
              aulaTitle={aula.titulo}
              quizAcertos={resultado.acertos}
              quizTotal={resultado.total}
              onApproved={handleReflexaoApproved}
              onBackToAula={() => navigate(`/aula/${id}`)}
            />
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                <Target size={18} strokeWidth={1.5} style={{ color: '#2E5FD4' }} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#6B7280' }}>
                  Responda com calma e foque no entendimento
                </span>
              </div>

              <p
                style={{
                  fontSize: mobileLayout ? '21px' : '24px',
                  fontWeight: 700,
                  color: '#1A1F2E',
                  margin: '0 0 32px 0',
                  lineHeight: '1.45',
                  letterSpacing: '-0.02em',
                }}
              >
                {perguntaAtual?.pergunta}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                {perguntaAtual?.opcoes.map((opcao, index) => (
                  <QuizOption
                    key={`${perguntaAtual.id}-${index}`}
                    texto={opcao}
                    index={index}
                    status={status}
                    selecionada={selecionada === index}
                    correta={index === perguntaAtual.resposta_correta}
                    onSelect={() => setSelecionada(index)}
                  />
                ))}
              </div>

              {status === 'confirmado' && (
                <div style={{ marginBottom: '24px' }}>
                  <QuizFeedback resposta={ultimaResposta} pergunta={perguntaAtual} />
                </div>
              )}

              <button
                onClick={() => { void (status === 'respondendo' ? confirmAnswer() : advanceQuiz()) }}
                disabled={selecionada === null && status === 'respondendo'}
                style={{
                  width: '100%',
                  height: '52px',
                  borderRadius: '14px',
                  border: 'none',
                  backgroundColor: (selecionada === null && status === 'respondendo') ? '#E8ECF2' : '#0D1B3E',
                  color: (selecionada === null && status === 'respondendo') ? '#9CA3AF' : '#FFFFFF',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: (selecionada === null && status === 'respondendo') ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {status === 'respondendo'
                  ? 'Confirmar resposta'
                  : indice < totalPerguntas - 1
                    ? 'Proxima pergunta'
                    : 'Ver resultado'}
              </button>
            </>
          )}
        </div>
      </div>

      {showToast && resultado && (
        <XPToast xp={resultado.xpGanho} onDone={() => setShowToast(false)} />
      )}

      {/* Back-button / in-app navigation blocker during mandatory reflection */}
      {blocker.state === 'blocked' && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(10,22,40,0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              padding: '32px 28px',
              maxWidth: '420px',
              width: '100%',
              boxShadow: '0 24px 64px rgba(10,22,40,0.20)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: '#FEF2F2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <AlertTriangle size={20} style={{ color: '#DC2626' }} />
              </div>
              <div>
                <p style={{ fontSize: '16px', fontWeight: 700, color: '#1A1F2E', margin: '0 0 6px 0' }}>
                  Etapa obrigatória não concluída
                </p>
                <p style={{ fontSize: '13px', lineHeight: 1.65, color: '#6B7280', margin: 0 }}>
                  Você ainda não completou a reflexão escrita. Esta etapa é obrigatória para concluir a aula.
                  Se sair agora, precisará refazê-la quando voltar.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                onClick={() => blocker.reset?.()}
                style={{
                  width: '100%',
                  height: '48px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: '#0D1B3E',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Continuar a reflexão
              </button>
              <button
                type="button"
                onClick={() => blocker.proceed?.()}
                style={{
                  width: '100%',
                  height: '44px',
                  borderRadius: '12px',
                  border: '1px solid #E8ECF2',
                  backgroundColor: '#FFFFFF',
                  color: '#6B7280',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Sair mesmo assim (reflexão ficará pendente)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
