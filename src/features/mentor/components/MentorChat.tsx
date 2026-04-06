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

  const chipLabels = ['Corrigir erros', 'Revisar conteúdo', 'Montar plano', 'Definir objetivo']

  async function handleSubmit() {
    const content = draft.trim()
    if (!content) return
    setDraft('')
    await onSendMessage(content)
  }

  return (
    <section className="flex flex-col gap-6">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Chat do mentor
      </p>

      <div className="overflow-hidden rounded-[20px] border border-border bg-white shadow-[0_16px_48px_rgba(10,22,40,0.08)]">

        {/* ── Zone A: Conversation ────────────────────────────────────── */}
        <div className="flex flex-col gap-8 bg-surface px-6 pb-8 pt-8 lg:px-8 lg:pb-9 lg:pt-9 xl:px-10">

          {/*
            Opening message from mentor + quick prompts as one integrated card.
            The chips are a sub-section of the mentor's initial turn — not floating elements.
          */}
          <div className="flex gap-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary-soft text-secondary shadow-sm">
              <Brain size={17} />
            </div>

            {/* Integrated card: message text + chips */}
            <div className="flex-1 overflow-hidden rounded-[18px] border border-border bg-white shadow-[0_10px_28px_rgba(10,22,40,0.06)]">
              {/* Message text */}
              <div className="px-7 pb-6 pt-7">
                <p className="text-[15px] leading-[1.8] text-text-secondary">
                  {openingMessage}
                </p>
              </div>

              {/* Chips — visually distinct sub-section, connected to the message above */}
              <div className="border-t border-border/60 bg-[#f8faff] px-7 py-5">
                <p className="mb-3.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Atalhos rápidos
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {quickPrompts.map((prompt, index) => (
                    <button
                      key={`${prompt}-${index}`}
                      type="button"
                      className="rounded-full border border-border bg-white px-4 py-2 text-xs font-semibold text-foreground shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-secondary/40 hover:text-secondary hover:shadow-md active:scale-95"
                      onClick={() => setDraft(prompt)}
                    >
                      {chipLabels[index] ?? prompt.slice(0, 18)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Conversation history */}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-5 ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
            >
              {message.role === 'assistant' && (
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary-soft text-secondary shadow-sm">
                  <Brain size={17} />
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-[16px] px-7 py-6 shadow-[0_8px_24px_rgba(10,22,40,0.05)] ${
                  message.role === 'assistant'
                    ? 'border border-border bg-white'
                    : 'bg-primary text-white'
                }`}
              >
                <p
                  className={`whitespace-pre-wrap text-[15px] leading-[1.8] ${
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

          {/* Empty state — indented to align with bubble column */}
          {messages.length === 0 && !loading && (
            <div className="ml-[64px] rounded-[16px] border border-dashed border-border/80 bg-white/70 px-7 py-7">
              <p className="text-[14px] leading-[1.75] text-muted-foreground">
                Escolha um atalho acima ou escreva diretamente. Quanto mais específica a pergunta,
                mais cirúrgica a resposta.
              </p>
            </div>
          )}

          {/* Sending indicator */}
          {sending && (
            <div className="flex gap-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary-soft text-secondary shadow-sm">
                <Brain size={17} />
              </div>
              <div className="rounded-[16px] border border-border bg-white px-7 py-5 shadow-[0_8px_24px_rgba(10,22,40,0.05)]">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-secondary [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-secondary [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-secondary" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Zone B: Composer ─────────────────────────────────────────── */}
        <div className="border-t border-border bg-white px-6 py-7 lg:px-8 xl:px-10 xl:py-8">
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
                className="min-h-[128px] w-full resize-none rounded-[16px] border border-border bg-[#f8faff] px-6 py-5 pr-40 text-[15px] leading-[1.7] text-foreground outline-none transition-all duration-200 placeholder:text-muted-foreground focus:border-secondary focus:bg-white focus:ring-2 focus:ring-secondary/12"
              />
              <Button
                size="lg"
                className="absolute bottom-4 right-4 shrink-0 px-6 shadow-button transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:brightness-110 active:scale-95"
                onClick={() => void handleSubmit()}
                loading={sending}
              >
                {!sending && <Send size={15} />}
                Enviar
              </Button>
            </div>

            <p className="px-1 text-[12px] leading-relaxed text-muted-foreground">
              ⌘ + Enter para enviar · Quanto mais direta a pergunta, mais acionável a resposta.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
