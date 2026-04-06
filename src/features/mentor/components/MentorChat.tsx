import { useEffect, useMemo, useState } from 'react'
import { Brain, Send, UserRound } from 'lucide-react'
import { Button } from '@/components/ui'
import type {
  MentorChatMessage,
  MentorPerformanceAnalysis,
  MentorRecommendation,
  MentorUserContext,
  UserLearningProfile,
} from '../types'

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
    return `Com base no seu desempenho recente, identifiquei que seu maior gargalo está em ${topic} e sua revisão está acumulando. Posso te ajudar a corrigir isso ou montar um plano de estudo agora.`
  }
  if (topic) {
    return `Analisei seu histórico e o principal ponto de atrito agora está em ${topic}. Posso te ajudar a corrigir os erros, revisar o conteúdo ou decidir seu próximo passo.`
  }
  if (nextFocus) {
    return `Já li seu momento recente e o foco mais útil agora está em ${nextFocus}. Se quiser, eu transformo isso em um plano de estudo simples.`
  }
  return 'Já estou com seu histórico em mãos. Posso resumir seu momento, sugerir a próxima ação ou montar um plano curto agora.'
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
      profile?.topicErrors[0]?.topic
        ? `Quero corrigir meus erros em ${profile.topicErrors[0].topic}.`
        : 'Quero corrigir meus erros agora.',
      recommendations.find((item) => item.type === 'review_flashcards')?.action.prompt ??
        'Quero revisar o conteúdo mais importante agora.',
      'Monte um plano de estudo curto para hoje.',
      mentorContext?.goal
        ? `Meu objetivo é ${mentorContext.goal}. Ajuste meu próximo passo.`
        : 'Quero definir meu objetivo para estudar melhor.',
    ]
    return prompts.filter((value, index, array) => array.indexOf(value) === index).slice(0, 4)
  }, [mentorContext?.goal, profile?.topicErrors, recommendations])

  const chipLabels = ['corrigir erros', 'revisar conteúdo', 'montar plano', 'definir objetivo']

  async function handleSubmit() {
    const content = draft.trim()
    if (!content) return
    setDraft('')
    await onSendMessage(content)
  }

  return (
    <section className="flex flex-col gap-5">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Chat do mentor
      </p>

      {/* Outer card — matches Dashboard card language: white, rounded-[20px], generous shadow */}
      <div className="flex flex-col overflow-hidden rounded-[20px] border border-border bg-white shadow-[0_16px_40px_rgba(10,22,40,0.07)]">

        {/* Message area */}
        <div className="flex min-h-[520px] flex-col gap-7 overflow-y-auto bg-[linear-gradient(180deg,#fcfdff_0%,#f7faff_100%)] p-7 lg:p-8">

          {/* Opening message */}
          <div className="flex gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary-soft text-secondary shadow-sm">
              <Brain size={17} />
            </div>
            <div className="max-w-[85%] rounded-[16px] border border-border bg-white px-6 py-5 shadow-[0_8px_24px_rgba(10,22,40,0.05)] lg:px-7 lg:py-6">
              <p className="text-sm leading-relaxed text-text-secondary md:text-[15px]">
                {openingMessage}
              </p>
            </div>
          </div>

          {/* Quick prompt chips */}
          <div className="ml-[60px] flex flex-wrap gap-2.5 rounded-[16px] border border-border/70 bg-white/80 px-5 py-4 shadow-[0_4px_12px_rgba(10,22,40,0.03)]">
            {quickPrompts.map((prompt, index) => (
              <Button
                key={`${prompt}-${index}`}
                variant="outline"
                size="sm"
                className="h-auto rounded-full border-border bg-white px-5 py-2.5 text-xs font-semibold shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:brightness-105 active:scale-95"
                onClick={() => setDraft(prompt)}
              >
                {chipLabels[index] ?? prompt.slice(0, 18)}
              </Button>
            ))}
          </div>

          {/* Conversation messages */}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-4 ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
            >
              {message.role === 'assistant' && (
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary-soft text-secondary shadow-sm">
                  <Brain size={17} />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-[16px] px-6 py-5 shadow-[0_8px_24px_rgba(10,22,40,0.05)] lg:px-7 lg:py-6 ${
                  message.role === 'assistant'
                    ? 'border border-border bg-white'
                    : 'bg-primary text-white'
                }`}
              >
                <p
                  className={`whitespace-pre-wrap text-sm leading-relaxed md:text-[15px] ${
                    message.role === 'assistant' ? 'text-text-secondary' : 'text-white'
                  }`}
                >
                  {message.content}
                </p>
              </div>

              {message.role === 'user' && (
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary-soft text-secondary shadow-sm">
                  <UserRound size={17} />
                </div>
              )}
            </div>
          ))}

          {messages.length === 0 && !loading && (
            <div className="rounded-[16px] border border-dashed border-border bg-white px-6 py-5 lg:px-7 lg:py-6">
              <p className="text-sm leading-relaxed text-text-secondary">
                O mentor não espera contexto extra para começar. Escolha uma ação rápida ou
                descreva a decisão que você quer tomar.
              </p>
            </div>
          )}

          {sending && (
            <div className="flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary-soft text-secondary shadow-sm">
                <Brain size={17} />
              </div>
              <div className="rounded-[16px] border border-border bg-white px-6 py-5 shadow-[0_8px_24px_rgba(10,22,40,0.05)]">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-secondary [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-secondary [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-secondary" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input area — separated by a border, padded consistently with the message area */}
        <div className="border-t border-border bg-white p-7 lg:p-8">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) void handleSubmit()
                }}
                rows={4}
                placeholder="Escreva sua dúvida ou a decisão que você quer tomar agora."
                className="min-h-[120px] w-full resize-none rounded-[16px] border border-border bg-background-elevated px-6 py-5 pr-36 text-sm leading-relaxed text-foreground outline-none transition-all duration-200 placeholder:text-muted-foreground focus:border-secondary focus:ring-2 focus:ring-secondary/15 md:text-[15px] lg:px-7 lg:py-5"
              />
              <Button
                size="lg"
                className="absolute bottom-4 right-4 w-fit shrink-0 px-6 shadow-button transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:brightness-110 active:scale-95"
                onClick={() => void handleSubmit()}
                loading={sending}
              >
                {!sending && <Send size={15} />}
                Enviar
              </Button>
            </div>

            <div className="rounded-[14px] border border-border/70 bg-[#FCFDFF] px-5 py-3.5 lg:px-6">
              <p className="text-xs leading-relaxed text-muted-foreground">
                ⌘ + Enter para enviar · Quanto mais direta a pergunta, mais acionável a resposta.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
