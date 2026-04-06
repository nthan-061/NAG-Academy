import { useEffect, useMemo, useState } from 'react'
import { Brain, Send, UserRound } from 'lucide-react'
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
  if (topic && pendingFlashcards > 0)
    return `Com base no seu desempenho recente, identifiquei que seu maior gargalo está em ${topic} e sua revisão está acumulando. Posso te ajudar a corrigir isso ou montar um plano de estudo agora.`
  if (topic)
    return `Analisei seu histórico e o principal ponto de atrito agora está em ${topic}. Posso te ajudar a corrigir os erros, revisar o conteúdo ou decidir seu próximo passo.`
  if (nextFocus)
    return `Já li seu momento recente e o foco mais útil agora está em ${nextFocus}. Se quiser, eu transformo isso em um plano de estudo simples.`
  return 'Já estou com seu histórico em mãos. Posso resumir seu momento, sugerir a próxima ação ou montar um plano curto agora.'
}

const CHIP_LABELS = ['Corrigir erros', 'Revisar conteúdo', 'Montar plano', 'Definir objetivo']

// Pixel-exact values from Dashboard benchmark
const card: React.CSSProperties = {
  backgroundColor: '#FFFFFF',
  borderRadius: '12px',
  border: '1px solid #E8ECF2',
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  overflow: 'hidden',
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

  useEffect(() => { setDraft(initialPrompt) }, [initialPrompt])

  const openingMessage = useMemo(() => buildOpeningMessage(profile, analysis), [analysis, profile])

  const quickPrompts = useMemo(() => {
    const prompts = [
      profile?.topicErrors[0]?.topic
        ? `Quero corrigir meus erros em ${profile.topicErrors[0].topic}.`
        : 'Quero corrigir meus erros agora.',
      recommendations.find(r => r.type === 'review_flashcards')?.action.prompt ??
        'Quero revisar o conteúdo mais importante agora.',
      'Monte um plano de estudo curto para hoje.',
      mentorContext?.goal
        ? `Meu objetivo é ${mentorContext.goal}. Ajuste meu próximo passo.`
        : 'Quero definir meu objetivo para estudar melhor.',
    ]
    return prompts.filter((v, i, a) => a.indexOf(v) === i).slice(0, 4)
  }, [mentorContext?.goal, profile?.topicErrors, recommendations])

  async function handleSubmit() {
    const content = draft.trim()
    if (!content) return
    setDraft('')
    await onSendMessage(content)
  }

  return (
    <div>
      {/* Section label — outside the card, exact Dashboard pattern */}
      <p
        style={{
          fontSize: '13px',
          fontWeight: 600,
          color: '#6B7280',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          margin: '0 0 16px 0',
        }}
      >
        Chat do mentor
      </p>

      {/* Outer card */}
      <div style={card}>

        {/* ── Zone A: Messages ───────────────────────────── */}
        {/*
          Background: very light blue-tint surface (#F7F9FD).
          Padding: 32px — same as Dashboard card body.
          No artificial min-height. Content fills the space naturally.
          Empty state is purposeful and fills the area.
        */}
        <div
          style={{
            backgroundColor: '#F7F9FD',
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            gap: '28px',
          }}
        >
          {/* Opening mentor message */}
          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            {/* Avatar */}
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#EBF0FA',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: '#2E5FD4',
              }}
            >
              <Brain size={15} />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Message bubble */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E8ECF2',
                  borderRadius: '12px',
                  padding: '20px 24px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                }}
              >
                <p style={{ fontSize: '14px', lineHeight: 1.85, color: '#374151', margin: 0 }}>
                  {openingMessage}
                </p>
              </div>

              {/* Quick prompts */}
              <div style={{ marginTop: '20px' }}>
                <p
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#9CA3AF',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    margin: '0 0 10px 0',
                  }}
                >
                  Atalhos rápidos
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {quickPrompts.map((prompt, index) => (
                    <button
                      key={`${index}-${prompt.slice(0, 12)}`}
                      type="button"
                      style={{
                        padding: '8px 16px',
                        borderRadius: '999px',
                        border: '1px solid #E8ECF2',
                        backgroundColor: '#FFFFFF',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#374151',
                        cursor: 'pointer',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => {
                        const el = e.currentTarget as HTMLElement
                        el.style.borderColor = 'rgba(46,95,212,0.35)'
                        el.style.color = '#2E5FD4'
                        el.style.transform = 'translateY(-1px)'
                        el.style.boxShadow = '0 4px 10px rgba(0,0,0,0.10)'
                      }}
                      onMouseLeave={e => {
                        const el = e.currentTarget as HTMLElement
                        el.style.borderColor = '#E8ECF2'
                        el.style.color = '#374151'
                        el.style.transform = ''
                        el.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'
                      }}
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
              style={{
                display: 'flex',
                gap: '14px',
                alignItems: 'flex-start',
                flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: '#EBF0FA',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  color: '#2E5FD4',
                }}
              >
                {message.role === 'assistant' ? <Brain size={15} /> : <UserRound size={15} />}
              </div>
              <div
                style={{
                  maxWidth: '80%',
                  minWidth: 0,
                  borderRadius: '12px',
                  padding: '16px 20px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                  ...(message.role === 'assistant'
                    ? { backgroundColor: '#FFFFFF', border: '1px solid #E8ECF2' }
                    : { backgroundColor: '#0D1B3E' }),
                }}
              >
                <p
                  style={{
                    fontSize: '14px',
                    lineHeight: 1.85,
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                    color: message.role === 'assistant' ? '#374151' : '#FFFFFF',
                  }}
                >
                  {message.content}
                </p>
              </div>
            </div>
          ))}

          {/* Empty state */}
          {messages.length === 0 && !loading && (
            <div
              style={{
                marginLeft: '50px',
                borderRadius: '10px',
                border: '1px dashed #D1D5DB',
                backgroundColor: 'rgba(255,255,255,0.6)',
                padding: '18px 22px',
              }}
            >
              <p style={{ fontSize: '13px', lineHeight: 1.75, color: '#9CA3AF', margin: 0 }}>
                Escolha um atalho acima ou escreva diretamente. Quanto mais específica a
                pergunta, mais cirúrgica a resposta.
              </p>
            </div>
          )}

          {/* Sending indicator */}
          {sending && (
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div
                style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  backgroundColor: '#EBF0FA', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, color: '#2E5FD4',
                }}
              >
                <Brain size={15} />
              </div>
              <div
                style={{
                  borderRadius: '12px', padding: '16px 20px',
                  backgroundColor: '#FFFFFF', border: '1px solid #E8ECF2',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                }}
              >
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  {['-0.3s', '-0.15s', '0s'].map((delay) => (
                    <span
                      key={delay}
                      style={{
                        display: 'block', width: '7px', height: '7px',
                        borderRadius: '50%', backgroundColor: '#2E5FD4',
                        animation: 'bounce 1s infinite',
                        animationDelay: delay,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Zone B: Composer ────────────────────────── */}
        {/*
          White background — clearly different from Zone A.
          Separated by border-top.
          Generous padding: 32px.
          Textarea: comfortable min-height, clear focus state.
          Footer: hint text left, send button right.
        */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderTop: '1px solid #E8ECF2',
            padding: '28px 32px 32px',
          }}
        >
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) void handleSubmit()
            }}
            rows={4}
            placeholder="Escreva sua dúvida ou a decisão que você quer tomar agora."
            style={{
              display: 'block',
              width: '100%',
              minHeight: '120px',
              resize: 'none',
              padding: '14px 16px',
              borderRadius: '10px',
              border: '1px solid #E8ECF2',
              backgroundColor: '#F7F9FD',
              fontSize: '14px',
              lineHeight: 1.75,
              color: '#1A1F2E',
              outline: 'none',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
              transition: 'border-color 0.15s, background-color 0.15s',
              marginBottom: '20px',
            }}
            onFocus={e => {
              e.currentTarget.style.borderColor = '#2E5FD4'
              e.currentTarget.style.backgroundColor = '#FFFFFF'
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(46,95,212,0.08)'
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = '#E8ECF2'
              e.currentTarget.style.backgroundColor = '#F7F9FD'
              e.currentTarget.style.boxShadow = 'none'
            }}
          />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
            <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>
              ⌘ + Enter para enviar
            </p>
            <button
              type="button"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '11px 24px',
                borderRadius: '8px',
                backgroundColor: '#0D1B3E',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 600,
                border: 'none',
                cursor: sending ? 'not-allowed' : 'pointer',
                opacity: sending ? 0.7 : 1,
                transition: 'transform 0.15s, box-shadow 0.15s',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                flexShrink: 0,
              }}
              onMouseEnter={e => {
                if (sending) return
                const el = e.currentTarget as HTMLElement
                el.style.transform = 'translateY(-1px)'
                el.style.boxShadow = '0 4px 14px rgba(0,0,0,0.20)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.transform = ''
                el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)'
              }}
              onClick={() => void handleSubmit()}
              disabled={sending}
            >
              {!sending && <Send size={14} />}
              {sending ? 'Enviando…' : 'Enviar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
