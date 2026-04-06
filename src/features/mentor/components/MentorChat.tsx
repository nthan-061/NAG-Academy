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

const CHIP_LABELS = ['Corrigir erros', 'Revisar conteúdo', 'Montar plano', 'Definir objetivo']

function MentorAvatar() {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary-soft text-secondary">
      <Brain size={15} />
    </div>
  )
}

function UserAvatar() {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary-soft text-secondary">
      <UserRound size={15} />
    </div>
  )
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

  async function handleSubmit() {
    const content = draft.trim()
    if (!content) return
    setDraft('')
    await onSendMessage(content)
  }

  return (
    <section className="flex flex-col gap-5">
      {/* Section label — same pattern as Dashboard card headers */}
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Chat do mentor
      </p>

      {/*
        Outer card — matches Dashboard's card vocabulary:
        white bg, subtle border, light shadow
      */}
      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-[0_4px_20px_rgba(10,22,40,0.06)]">

        {/* ── Zone A: Messages ──────────────────────────────────────── */}
        <div className="flex flex-col gap-7 bg-[#f7f9fd] px-7 pb-8 pt-8 lg:px-8 lg:pb-9 lg:pt-9">

          {/* Opening mentor message + quick prompts below */}
          <div className="flex gap-4">
            <MentorAvatar />

            <div className="min-w-0 flex-1">
              {/* Message bubble */}
              <div className="rounded-2xl border border-border bg-white px-6 py-5 shadow-sm">
                <p className="text-[14px] leading-[1.8] text-text-secondary">
                  {openingMessage}
                </p>
              </div>

              {/* Quick prompts — below the bubble, clearly associated */}
              <div className="mt-5">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Atalhos rápidos
                </p>
                <div className="flex flex-wrap gap-2">
                  {quickPrompts.map((prompt, index) => (
                    <button
                      key={`${prompt}-${index}`}
                      type="button"
                      className="rounded-full border border-border bg-white px-4 py-2 text-[12px] font-semibold text-foreground shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-secondary/40 hover:text-secondary hover:shadow-md active:scale-95"
                      onClick={() => setDraft(prompt)}
                    >
                      {CHIP_LABELS[index] ?? prompt.slice(0, 18)}
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
              className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : ''}`}
            >
              {message.role === 'assistant' && <MentorAvatar />}

              <div
                className={`max-w-[82%] rounded-2xl px-6 py-5 shadow-sm ${
                  message.role === 'assistant'
                    ? 'border border-border bg-white'
                    : 'bg-primary text-white'
                }`}
              >
                <p
                  className={`whitespace-pre-wrap text-[14px] leading-[1.8] ${
                    message.role === 'assistant' ? 'text-text-secondary' : 'text-white'
                  }`}
                >
                  {message.content}
                </p>
              </div>

              {message.role === 'user' && <UserAvatar />}
            </div>
          ))}

          {/* Empty state */}
          {messages.length === 0 && !loading && (
            <div className="ml-[52px] rounded-xl border border-dashed border-border/70 bg-white/70 px-5 py-4">
              <p className="text-[13px] leading-[1.7] text-muted-foreground">
                Escolha um atalho acima ou escreva diretamente. Quanto mais específica a pergunta,
                mais cirúrgica a resposta.
              </p>
            </div>
          )}

          {/* Sending indicator */}
          {sending && (
            <div className="flex gap-4">
              <MentorAvatar />
              <div className="rounded-2xl border border-border bg-white px-6 py-5 shadow-sm">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-secondary [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-secondary [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-secondary" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Zone B: Composer ────────────────────────────────────── */}
        <div className="border-t border-border bg-white px-7 py-7 lg:px-8 lg:py-8">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) void handleSubmit()
            }}
            rows={4}
            placeholder="Escreva sua dúvida ou a decisão que você quer tomar agora."
            className="mb-5 min-h-[112px] w-full resize-none rounded-xl border border-border bg-[#f7f9fd] px-5 py-4 text-[14px] leading-[1.7] text-foreground outline-none transition-all duration-200 placeholder:text-muted-foreground focus:border-secondary focus:bg-white focus:ring-2 focus:ring-secondary/10"
          />

          <div className="flex items-center justify-between gap-4">
            <p className="text-[12px] leading-relaxed text-muted-foreground">
              ⌘ + Enter para enviar
            </p>
            <Button
              size="lg"
              className="shrink-0 px-7 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:brightness-110 active:scale-95"
              onClick={() => void handleSubmit()}
              loading={sending}
            >
              {!sending && <Send size={14} />}
              Enviar
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
