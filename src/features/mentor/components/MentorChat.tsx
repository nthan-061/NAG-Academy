import { useEffect, useMemo, useState } from 'react'
import { Brain, Send, UserRound } from 'lucide-react'
import { Button, Card } from '@/components/ui'
import type { MentorChatMessage, MentorPerformanceAnalysis, MentorRecommendation, MentorUserContext, UserLearningProfile } from '../types'

interface MentorChatProps {
  messages: MentorChatMessage[]
  mentorContext: MentorUserContext | null
  profile: UserLearningProfile | null
  analysis: MentorPerformanceAnalysis | null
  recommendations: MentorRecommendation[]
  loading?: boolean
  sending?: boolean
  onSendMessage: (message: string) => Promise<void>
  initialPrompt?: string
}

function buildOpeningMessage(
  profile: UserLearningProfile | null,
  analysis: MentorPerformanceAnalysis | null,
) {
  const topic = profile?.topicErrors[0]?.topic
  const pendingFlashcards = profile?.recentEngagement.pendingFlashcards ?? 0
  const nextFocus = analysis?.focusTopics[0]

  if (topic && pendingFlashcards > 0) {
    return `Com base no seu desempenho recente, identifiquei que seu maior gargalo esta em ${topic} e sua revisao esta acumulando. Posso te ajudar a corrigir isso ou montar um plano de estudo agora.`
  }

  if (topic) {
    return `Analisei seu historico e o principal ponto de atrito agora esta em ${topic}. Posso te ajudar a corrigir os erros, revisar o conteudo ou decidir seu proximo passo.`
  }

  if (nextFocus) {
    return `Ja li seu momento recente e o foco mais util agora esta em ${nextFocus}. Se quiser, eu transformo isso em um plano de estudo simples.`
  }

  return 'Ja estou com seu historico em maos. Posso resumir seu momento, sugerir a proxima acao ou montar um plano curto agora.'
}

export function MentorChat({
  messages,
  mentorContext,
  profile,
  analysis,
  recommendations,
  loading = false,
  sending = false,
  onSendMessage,
  initialPrompt = '',
}: MentorChatProps) {
  const [draft, setDraft] = useState(initialPrompt)

  useEffect(() => {
    setDraft(initialPrompt)
  }, [initialPrompt])

  const openingMessage = useMemo(
    () => buildOpeningMessage(profile, analysis),
    [analysis, profile],
  )

  const quickPrompts = useMemo(() => {
    const prompts = [
      profile?.topicErrors[0]?.topic ? `Quero corrigir meus erros em ${profile.topicErrors[0].topic}.` : 'Quero corrigir meus erros agora.',
      recommendations.find((item) => item.type === 'review_flashcards')?.action.prompt ?? 'Quero revisar o conteudo mais importante agora.',
      'Monte um plano de estudo curto para hoje.',
      mentorContext?.goal ? `Meu objetivo e ${mentorContext.goal}. Ajuste meu proximo passo.` : 'Quero definir meu objetivo para estudar melhor.',
    ]

    return prompts.filter((value, index, array) => array.indexOf(value) === index).slice(0, 4)
  }, [mentorContext?.goal, profile?.topicErrors, recommendations])

  async function handleSubmit() {
    const content = draft.trim()
    if (!content) return
    setDraft('')
    await onSendMessage(content)
  }

  return (
    <section className="mt-10 space-y-7">
      <div className="max-w-3xl space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary">
          Chat do mentor
        </p>
        <h2 className="text-3xl font-bold tracking-[-0.04em] text-foreground md:text-[2.2rem]">
          Converse com o mentor para decidir o proximo passo
        </h2>
      </div>

      <Card padding="lg" className="grid gap-8 rounded-[2rem] border border-border/90 bg-white/95 p-6 shadow-md lg:p-8">
        <div className="min-h-[620px] rounded-[2rem] border border-border/90 bg-background-elevated/90 p-6 shadow-sm lg:p-8">
          <div className="flex flex-col gap-8">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary-soft text-secondary shadow-sm">
                <Brain size={17} />
              </div>
              <div className="max-w-[85%] rounded-[1.75rem] border border-border bg-white px-6 py-5 shadow-sm lg:px-7 lg:py-6">
                <p className="text-sm leading-relaxed text-text-secondary md:text-[15px]">
                  {openingMessage}
                </p>
              </div>
            </div>

            <div className="ml-[64px] flex flex-wrap gap-3.5">
              {quickPrompts.map((prompt, index) => (
                <Button
                  key={`${prompt}-${index}`}
                  variant="outline"
                  size="sm"
                  className="h-auto rounded-full border-border bg-white px-4 py-2.5 text-xs shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:brightness-105 active:scale-95"
                  onClick={() => setDraft(prompt)}
                >
                  {index === 0 ? 'corrigir erros' : index === 1 ? 'revisar conteudo' : index === 2 ? 'montar plano' : 'definir objetivo'}
                </Button>
              ))}
            </div>

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
              >
                {message.role === 'assistant' && (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary-soft text-secondary shadow-sm">
                    <Brain size={17} />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-[1.75rem] px-6 py-5 shadow-sm lg:px-7 lg:py-6 ${
                    message.role === 'assistant'
                      ? 'border border-border bg-white'
                      : 'bg-primary text-white'
                  }`}
                >
                  <p className={`whitespace-pre-wrap text-sm leading-relaxed md:text-[15px] ${message.role === 'assistant' ? 'text-text-secondary' : 'text-white'}`}>
                    {message.content}
                  </p>
                </div>

                {message.role === 'user' && (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary-soft text-secondary shadow-sm">
                    <UserRound size={17} />
                  </div>
                )}
              </div>
            ))}

            {messages.length === 0 && !loading && (
              <div className="rounded-[1.75rem] border border-dashed border-border bg-white/80 px-6 py-5 lg:px-7 lg:py-6">
                <p className="text-sm leading-relaxed text-text-secondary">
                  O mentor nao espera contexto extra para comecar. Escolha uma acao rapida ou descreva a decisao que voce quer tomar.
                </p>
              </div>
            )}

            {sending && (
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary-soft text-secondary shadow-sm">
                  <Brain size={17} />
                </div>
                <div className="rounded-[1.75rem] border border-border bg-white px-6 py-5 shadow-sm lg:px-7 lg:py-6">
                  <p className="text-sm leading-relaxed text-text-secondary">
                    O mentor esta preparando sua resposta...
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-border bg-white p-6 shadow-sm lg:p-8">
          <div className="flex flex-col gap-6">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={5}
              placeholder="Escreva sua duvida ou a decisao que voce quer tomar agora."
              className="w-full min-h-[168px] resize-none rounded-[1.25rem] border border-border bg-background-elevated px-5 py-4 text-sm leading-relaxed text-foreground outline-none transition-all duration-200 placeholder:text-muted-foreground focus:border-secondary focus:ring-2 focus:ring-secondary/15 md:text-[15px] lg:px-6 lg:py-5"
            />

            <div className="flex flex-wrap items-end justify-between gap-6">
              <p className="max-w-md text-xs leading-relaxed text-muted-foreground">
                Quanto mais direta for sua pergunta, mais acionavel fica a resposta.
              </p>

              <Button
                size="lg"
                className="shadow-button transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:brightness-110 active:scale-95"
                onClick={() => void handleSubmit()}
                loading={sending}
              >
                {!sending && <Send size={15} />}
                Enviar
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </section>
  )
}
