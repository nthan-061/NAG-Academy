import { useEffect, useRef } from 'react'
import { MessageSquare, Send } from 'lucide-react'
import { formatAulaChatMessage } from '../utils'
import type { AulaChatMessage } from '../types'

interface AulaChatPanelProps {
  aulaTitle: string
  messages: AulaChatMessage[]
  input: string
  loading: boolean
  onInputChange: (value: string) => void
  onSend: () => Promise<void>
}

export function AulaChatPanel({
  aulaTitle,
  messages,
  input,
  loading,
  onInputChange,
  onSend,
}: AulaChatPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, loading])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          padding: '18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          minHeight: 0,
          overscrollBehavior: 'contain',
          touchAction: 'pan-y',
          backgroundColor: '#FBFCFF',
        }}
      >
        {messages.length === 0 && (
          <div
            style={{
              minHeight: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '32px 20px',
              textAlign: 'center',
              color: '#9CA3AF',
            }}
          >
            <MessageSquare size={28} strokeWidth={1.5} />
            <p style={{ fontSize: '13px', margin: 0 }}>
              Tire duvidas sobre o conteudo desta aula.
            </p>
          </div>
        )}

        {messages.map((message, index) => {
          if (message.role === 'user') {
            return (
              <div key={index} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div
                  style={{
                    backgroundColor: '#0D1B3E',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    lineHeight: '1.7',
                    padding: '12px 14px',
                    borderRadius: '18px 18px 6px 18px',
                    maxWidth: '88%',
                    boxShadow: '0 6px 16px rgba(13,27,62,0.14)',
                  }}
                >
                  {message.content}
                </div>
              </div>
            )
          }

          if (message.role === 'error') {
            return (
              <div key={index} style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div
                  style={{
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FECACA',
                    color: '#DC2626',
                    fontSize: '13px',
                    lineHeight: '1.7',
                    padding: '12px 14px',
                    borderRadius: '18px 18px 18px 6px',
                    maxWidth: '88%',
                  }}
                >
                  {message.content}
                </div>
              </div>
            )
          }

          return (
            <div key={index} style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5EAF3',
                  color: '#1A1F2E',
                  fontSize: '14px',
                  lineHeight: '1.8',
                  padding: '14px 16px',
                  borderRadius: '18px 18px 18px 6px',
                  maxWidth: '92%',
                  boxShadow: '0 8px 20px rgba(10,22,40,0.05)',
                }}
              >
                {formatAulaChatMessage(message.content).map((line, lineIndex) => {
                  if (line.kind === 'space') return <div key={`${index}-${lineIndex}`} style={{ height: '8px' }} />
                  if (line.kind === 'bullet') {
                    return (
                      <div key={`${index}-${lineIndex}`} style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                        <span style={{ color: '#2E5FD4', fontWeight: 700, lineHeight: 1.6 }}>•</span>
                        <span>{line.content}</span>
                      </div>
                    )
                  }
                  return <p key={`${index}-${lineIndex}`} style={{ margin: 0 }}>{line.content}</p>
                })}
              </div>
            </div>
          )
        })}

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5EAF3',
                padding: '12px 14px',
                borderRadius: '18px 18px 18px 6px',
              }}
            >
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                {[0, 150, 300].map((delay) => (
                  <span
                    key={delay}
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: '#9CA3AF',
                      animation: 'bounce 1s infinite',
                      animationDelay: `${delay}ms`,
                      display: 'inline-block',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div
        style={{
          padding: '14px 16px 16px',
          borderTop: '1px solid #E8ECF2',
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
        }}
      >
        <input
          value={input}
          onChange={(event) => onInputChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              void onSend()
            }
          }}
          placeholder={`Pergunte sobre ${aulaTitle.slice(0, 40)}...`}
          style={{
            flex: 1,
            border: '1px solid #C8D3EA',
            borderRadius: '14px',
            padding: '14px 16px',
            fontSize: '14px',
            outline: 'none',
            color: '#1A1F2E',
            backgroundColor: '#F9FBFF',
          }}
          onFocus={(event) => { event.currentTarget.style.borderColor = '#2E5FD4' }}
          onBlur={(event) => { event.currentTarget.style.borderColor = '#C8D3EA' }}
          disabled={loading}
        />
        <button
          onClick={() => { void onSend() }}
          disabled={!input.trim() || loading}
          style={{
            backgroundColor: '#0D1B3E',
            border: 'none',
            borderRadius: '14px',
            width: '48px',
            height: '48px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: (!input.trim() || loading) ? 0.45 : 1,
            flexShrink: 0,
          }}
        >
          <Send size={17} strokeWidth={1.5} color="white" />
        </button>
      </div>
    </div>
  )
}
