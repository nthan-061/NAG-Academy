import { useParams, useNavigate, Link } from 'react-router-dom'
import { Target } from 'lucide-react'
import { Button } from '@/components/ui/Button'
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
      <div className="flex min-h-screen items-center justify-center bg-[#F5F6FA]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0D1B3E] border-t-transparent" />
      </div>
    )
  }

  if (!aula || perguntas.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#F5F6FA]">
        <p className="text-base font-medium text-[#1A1F2E]">Nenhuma pergunta disponivel para esta aula.</p>
        <Link to={`/aula/${id}`} className="text-sm text-[#2E5FD4]">Voltar para a aula</Link>
      </div>
    )
  }

  const progressPercent = getQuizProgressPercent(indice, totalPerguntas, status === 'confirmado')

  return (
    <div className="min-h-screen bg-[#F5F6FA] pl-0 pt-16 md:pl-[236px]">
      <QuizHeader
        aulaTitulo={aula.titulo}
        indice={indice}
        totalPerguntas={totalPerguntas}
        statusLabel={status === 'resultado' ? 'Resultado final' : ''}
        progressPercent={progressPercent}
        showProgress={status !== 'resultado'}
        onExit={() => {
          if (confirm('Sair do quiz? Seu progresso sera perdido.')) {
            navigate(`/aula/${id}`)
          }
        }}
      />

      <div className="flex justify-center px-5 py-9">
        <div className={`animate-slideUp w-full rounded-3xl border border-[#E8ECF2] bg-white shadow-[0_20px_50px_rgba(10,22,40,0.08)] ${status === 'resultado' ? 'max-w-[700px] px-9 py-10' : 'max-w-[760px] p-10'}`}>
          {status === 'resultado' && resultado ? (
            <QuizResult
              aulaId={id!}
              result={resultado}
              onShowToast={() => setShowToast(true)}
            />
          ) : (
            <>
              <div className="mb-[18px] flex items-center gap-2.5">
                <Target size={18} strokeWidth={1.5} className="text-[#2E5FD4]" />
                <span className="text-[13px] font-semibold text-[#6B7280]">
                  Responda com calma e foque no entendimento
                </span>
              </div>

              <p className="mb-8 text-2xl font-bold leading-[1.45] tracking-[-0.02em] text-[#1A1F2E]">
                {perguntaAtual?.pergunta}
              </p>

              <div className="mb-8 flex flex-col gap-3">
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
                <div className="mb-6">
                  <QuizFeedback resposta={ultimaResposta} pergunta={perguntaAtual} />
                </div>
              )}

              <Button
                type="button"
                onClick={() => { void (status === 'respondendo' ? confirmAnswer() : advanceQuiz()) }}
                disabled={selecionada === null && status === 'respondendo'}
                fullWidth
                className="h-[52px] rounded-2xl text-[15px] font-bold"
              >
                {status === 'respondendo'
                  ? 'Confirmar resposta'
                  : indice < totalPerguntas - 1
                    ? 'Proxima pergunta'
                    : 'Ver resultado'}
              </Button>
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
