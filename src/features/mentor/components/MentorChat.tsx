import { useState } from 'react'
import { Brain, Send, UserRound } from 'lucide-react'
import type React from 'react'
import type { MentorChatMessage, MentorUserContext } from '../types'

interface MentorChatProps {
  messages: MentorChatMessage[]
  mentorContext: MentorUserContext | null
  loading?: boolean
  sending?: boolean
  onSendMessage: (message: string) => Promise<void>
  initialPrompt?: string
}

const card: React.CSSProperties = {
  backgroundColor: '#FFFFFF',
  borderRadius: '12px',
  border: '1px solid #E8ECF2',
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  padding: '28px',
}

const innerCard: React.CSSProperties = {
  backgroundColor: '#F8FAFF',
  borderRadius: '10px',
  border: '1px solid #E8ECF2',
  padding: '20px',
}

const STARTER_PROMPTS = [
  'Meu objetivo com Google Ads é gerar leads qualificados.',
  'Já anunciei antes, mas erro muito na segmentação.',
  'Quero que você monte meu próximo passo de estudo.',
]

export function MentorChat({
  messages,
  mentorContext,
  loading = false,
  sending = false,
  onSendMessage,
  initialPrompt = '',
}: MentorChatProps) {
  const [draft, setDraft] = useState(initialPrompt)

  async function handleSubmit() {
    const content = draft.trim()
    if (!content) return
    setDraft('')
    await onSendMessage(content)
  }

  return (
    <div style={card}>
      {/* Cabeçalho */}
      <div style={{ marginBottom: '24px' }}>
        <p style={{ fontSize: '13px', fontWeight: 600, color: '#6B7280', letterSpacing: '0.05em', margin: '0 0 4px 0' }}>
          Conversa guiada
        </p>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1A1F2E', margin: '0 0 6px 0' }}>
          Conversa com seu mentor
        </h2>
        <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.6', margin: 0 }}>
          O mentor responde com base no seu histórico, nos erros recorrentes e no contexto que você compartilhar.
        </p>
      </div>

      {/* Objetivo atual */}
      {mentorContext?.goal && (
        <div style={{ ...innerCard, marginBottom: '16px' }}>
          <p style={{ fontSize: '12px', fontWeight: 500, color: '#9CA3AF', margin: '0 0 4px 0' }}>
            Objetivo atual
          </p>
          <p style={{ fontSize: '14px', color: '#1A1F2E', lineHeight: '1.55', margin: 0 }}>
            {mentorContext.goal}
          </p>
        </div>
      )}

      {/* Histórico de mensagens */}
      <div style={{ ...innerCard, minHeight: '280px', marginBottom: '16px', display: 'flex', flexDirection: 'column' }}>
        {messages.length === 0 && !loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1, gap: '24px', minHeight: '240px' }}>
            <div>
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%', marginBottom: '14px',
                backgroundColor: '#EEF4FF',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Brain size={18} color="#2E5FD4" />
              </div>
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#1A1F2E', margin: '0 0 6px 0' }}>
                O mentor ainda não iniciou a conversa.
              </p>
              <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: '1.6', margin: 0, maxWidth: '460px' }}>
                Comece contando seu objetivo, sua experiência com Google Ads ou o que mais está travando seu aprendizado agora.
              </p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setDraft(prompt)}
                  style={{
                    padding: '6px 14px', borderRadius: '999px',
                    border: '1px solid #E8ECF2', backgroundColor: '#FFFFFF',
                    color: '#6B7280', fontSize: '12px', fontWeight: 500,
                    cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#2E5FD4'; e.currentTarget.style.color = '#2E5FD4' }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E8ECF2'; e.currentTarget.style.color = '#6B7280' }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {messages.map((message) => (
              <div
                key={message.id}
                style={{ display: 'flex', gap: '10px', justifyContent: message.role === 'assistant' ? 'flex-start' : 'flex-end' }}
              >
                {message.role === 'assistant' && (
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                    backgroundColor: '#EEF4FF',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Brain size={15} color="#2E5FD4" />
                  </div>
                )}

                <div style={{
                  maxWidth: '82%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  ...(message.role === 'assistant'
                    ? { backgroundColor: '#FFFFFF', border: '1px solid #E8ECF2', color: '#1A1F2E' }
                    : { backgroundColor: '#0D1B3E', color: '#FFFFFF' }
                  ),
                }}>
                  <p style={{
                    fontSize: '13px', lineHeight: '1.65', margin: 0, whiteSpace: 'pre-wrap',
                    color: message.role === 'assistant' ? '#6B7280' : '#FFFFFF',
                  }}>
                    {message.content}
                  </p>
                </div>

                {message.role === 'user' && (
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                    backgroundColor: '#EBF0FA',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <UserRound size={15} color="#2E5FD4" />
                  </div>
                )}
              </div>
            ))}

            {sending && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  backgroundColor: '#EEF4FF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Brain size={15} color="#2E5FD4" />
                </div>
                <div style={{ padding: '10px 14px', borderRadius: '10px', backgroundColor: '#FFFFFF', border: '1px solid #E8ECF2' }}>
                  <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
                    O mentor está analisando seu histórico e montando a resposta...
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ ...innerCard, padding: '20px' }}>
        {/* Atalhos de prompt */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
          {STARTER_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => setDraft(prompt)}
              style={{
                padding: '4px 12px', borderRadius: '999px',
                border: '1px solid #E8ECF2', backgroundColor: '#FFFFFF',
                color: '#9CA3AF', fontSize: '11px', fontWeight: 500,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#2E5FD4'; e.currentTarget.style.borderColor = '#2E5FD4' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#9CA3AF'; e.currentTarget.style.borderColor = '#E8ECF2' }}
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={4}
          placeholder="Conte ao mentor onde você está travando, qual é seu objetivo ou o que deseja decidir agora."
          style={{
            width: '100%', resize: 'none', borderRadius: '8px',
            border: '1px solid #E8ECF2', backgroundColor: '#FFFFFF',
            padding: '12px 16px', fontSize: '13px', lineHeight: '1.65',
            color: '#1A1F2E', fontFamily: 'inherit', outline: 'none',
            boxSizing: 'border-box',
          }}
          onFocus={(e) => { e.target.style.borderColor = '#2E5FD4' }}
          onBlur={(e) => { e.target.style.borderColor = '#E8ECF2' }}
        />

        {/* Rodapé do input */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginTop: '14px', flexWrap: 'wrap' }}>
          <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0, maxWidth: '360px' }}>
            Quanto mais contexto você compartilhar, mais preciso fica o diagnóstico do mentor.
          </p>

          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={sending}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '9px 20px', borderRadius: '8px',
              backgroundColor: sending ? '#D1D5DB' : '#0D1B3E',
              color: '#FFFFFF', fontSize: '13px', fontWeight: 600,
              border: 'none', cursor: sending ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', flexShrink: 0,
            }}
            onMouseEnter={(e) => { if (!sending) e.currentTarget.style.backgroundColor = '#1E3A6E' }}
            onMouseLeave={(e) => { if (!sending) e.currentTarget.style.backgroundColor = '#0D1B3E' }}
          >
            {sending
              ? <span style={{ width: '14px', height: '14px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
              : <Send size={14} />
            }
            Enviar para o mentor
          </button>
        </div>
      </div>
    </div>
  )
}
