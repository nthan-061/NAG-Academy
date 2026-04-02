import { useNavigate, Link, useParams } from 'react-router-dom'
import { Target } from 'lucide-react'
import { XPToast } from '@/components/ui/Toast'
import { QuizHeader } from './QuizHeader'
import { QuizOption } from './QuizOption'
import { QuizFeedback } from './QuizFeedback'
import { QuizResult } from './QuizResult'
import { useQuiz } from '../hooks/useQuiz'
import { getQuizProgressPercent } from '../utils'

export function QuizScreen() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
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
  } = useQuiz(id)

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
    <div style={{ marginLeft: '236px', paddingTop: '64px', minHeight: '100vh', backgroundColor: '#F5F6FA' }}>
      <QuizHeader
        aulaTitulo={aula.titulo}
        indice={indice}
        totalPerguntas={totalPerguntas}
        statusLabel={status === 'resultado' ? 'Resultado final' : ''}
        progressPercent={progressPercent}
        showProgress={status !== 'resultado'}
        onExit={() => {
          if (confirm('Sair do quiz? Seu progresso sera perdido.')) navigate(`/aula/${id}`)
        }}
      />

      <div style={{ padding: '36px 20px', display: 'flex', justifyContent: 'center' }}>
        <div
          className="animate-slideUp"
          style={{
            width: '100%',
            maxWidth: status === 'resultado' ? '700px' : '760px',
            borderRadius: '24px',
            padding: status === 'resultado' ? '38px 36px' : '40px',
            backgroundColor: '#FFFFFF',
            boxShadow: '0 20px 50px rgba(10,22,40,0.08)',
            border: '1px solid #E8ECF2',
          }}
        >
          {status === 'resultado' && resultado ? (
            <QuizResult
              aulaId={id!}
              result={resultado}
              onShowToast={() => setShowToast(true)}
            />
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                <Target size={18} strokeWidth={1.5} style={{ color: '#2E5FD4' }} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#6B7280' }}>
                  Responda com calma e foque no entendimento
                </span>
              </div>

              <p style={{ fontSize: '24px', fontWeight: 700, color: '#1A1F2E', margin: '0 0 32px 0', lineHeight: '1.45', letterSpacing: '-0.02em' }}>
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
    </div>
  )
}
