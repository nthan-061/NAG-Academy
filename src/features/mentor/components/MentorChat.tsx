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
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EBF0FA] text-[#2E5FD4]">
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
    /*
      Chat design rules (from Dashboard benchmark):
      - Section label OUTSIDE the card (same as Dashboard section titles)
      - Outer card: white, clean border, no inner backgrounds competing
      - Zone A (messages): min-h-[480px] so it never collapses; flat bg, generous padding
      - Zone B (composer): border-t, white bg, generous padding — clearly separated
      - Opening message: simple white bubble, not nested inside another card
      - Quick prompts: row of chips below the opening bubble, associated but not nested
      - Conversation history: each message gets its own bubble with consistent padding
    */
    <div className="flex flex-col gap-5">

      {/* Section label — outside the card, same vocabulary as Dashboard headers */}
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B7280]">
        Chat do mentor
      </p>

      {/* Outer card */}
      <div className="overflow-hidden rounded-xl border border-[#E8ECF2] bg-white shadow-[0_2px_12px_rgba(10,22,40,0.07)]">

        {/* ── Zone A: Messages ────────────────────────────────────── */}
        {/*
          min-h-[480px] ensures this zone is never shallow.
          bg-[#F7F9FD] is a very subtle blue-tint surface — same tone as a premium
          macOS background — not a gradient, no drama.
        */}
        <div className="flex min-h-[480px] flex-col gap-8 bg-[#F7F9FD] px-8 pb-10 pt-9 lg:px-10 lg:pb-12 lg:pt-10">

          {/* Opening message from mentor */}
          <div className="flex gap-4">
            <MentorAvatar />

            <div className="min-w-0 flex-1">
              {/* Bubble */}
              <div className="rounded-2xl border border-[#E8ECF2] bg-white px-7 py-6 shadow-sm">
                <p className="text-[14px] leading-[1.85] text-[#374151]">
                  {openingMessage}
                </p>
              </div>

              {/* Quick prompts — below the bubble, clearly associated via mt */}
              <div className="mt-6">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#9CA3AF]">
                  Atalhos rápidos
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {quickPrompts.map((prompt, index) => (
                    <button
                      key={`${prompt}-${index}`}
                      type="button"
                      className="rounded-full border border-[#E8ECF2] bg-white px-4 py-2 text-[12px] font-semibold text-[#374151] shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-[#2E5FD4]/30 hover:text-[#2E5FD4] hover:shadow-md active:scale-95"
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
              className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {message.role === 'assistant' ? <MentorAvatar /> : <UserAvatar />}

              <div
                className={`max-w-[80%] min-w-0 rounded-2xl px-7 py-6 shadow-sm ${
                  message.role === 'assistant'
                    ? 'border border-[#E8ECF2] bg-white'
                    : 'bg-[#0D1B3E]'
                }`}
              >
                <p
                  className={`whitespace-pre-wrap text-[14px] leading-[1.85] ${
                    message.role === 'assistant' ? 'text-[#374151]' : 'text-white'
                  }`}
                >
                  {message.content}
                </p>
              </div>
            </div>
          ))}

          {/* Empty state — guides the user without creating visual noise */}
          {messages.length === 0 && !loading && (
            <div className="ml-[52px] rounded-xl border border-dashed border-[#D1D5DB] bg-white/60 px-6 py-5">
              <p className="text-[13px] leading-[1.75] text-[#9CA3AF]">
                Escolha um atalho acima ou escreva diretamente. Quanto mais específica a pergunta,
                mais cirúrgica a resposta.
              </p>
            </div>
          )}

          {/* Sending indicator */}
          {sending && (
            <div className="flex gap-4">
              <MentorAvatar />
              <div className="rounded-2xl border border-[#E8ECF2] bg-white px-7 py-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-[#2E5FD4] [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-[#2E5FD4] [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-[#2E5FD4]" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Zone B: Composer ──────────────────────────────────── */}
        {/*
          Clean separation from messages area via border-t.
          White background — distinct from the F7F9FD messages zone.
          Textarea has sufficient min-height to feel comfortable to type in.
          Footer row: hint text on the left, send button on the right.
        */}
        <div className="border-t border-[#E8ECF2] bg-white px-8 py-8 lg:px-10 lg:py-9">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) void handleSubmit()
            }}
            rows={4}
            placeholder="Escreva sua dúvida ou a decisão que você quer tomar agora."
            className="mb-6 min-h-[120px] w-full resize-none rounded-xl border border-[#E8ECF2] bg-[#F7F9FD] px-5 py-4 text-[14px] leading-[1.75] text-[#1A1F2E] outline-none transition-all duration-200 placeholder:text-[#9CA3AF] focus:border-[#2E5FD4] focus:bg-white focus:ring-2 focus:ring-[#2E5FD4]/10"
          />

          <div className="flex items-center justify-between gap-6">
            <p className="text-[12px] text-[#9CA3AF]">⌘ + Enter para enviar</p>
            <Button
              size="lg"
              className="shrink-0 gap-2 px-8 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:brightness-110 active:scale-95"
              onClick={() => void handleSubmit()}
              loading={sending}
            >
              {!sending && <Send size={14} />}
              Enviar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
