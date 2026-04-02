import { useEffect, useRef } from 'react'
import { MessageSquare, Send } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
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
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto bg-[#FBFCFF] p-5">
        {messages.length === 0 && (
          <div className="flex min-h-full flex-col items-center justify-center gap-3 px-4 py-10 text-center text-sm text-[#9CA3AF]">
            <MessageSquare size={28} strokeWidth={1.5} />
            <p>Tire duvidas sobre o conteudo desta aula.</p>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={cn(
              'flex',
              message.role === 'user' ? 'justify-end' : 'justify-start',
            )}
          >
            <div
              className={cn(
                'max-w-[92%] rounded-[18px] px-4 py-3 text-sm leading-7 shadow-sm',
                message.role === 'user' && 'rounded-br-[6px] bg-[#0D1B3E] text-white shadow-[0_6px_16px_rgba(13,27,62,0.14)]',
                message.role === 'assistant' && 'rounded-bl-[6px] border border-[#E5EAF3] bg-white text-[#1A1F2E] shadow-[0_8px_20px_rgba(10,22,40,0.05)]',
                message.role === 'error' && 'rounded-bl-[6px] border border-[#FECACA] bg-[#FEF2F2] text-[#DC2626]',
              )}
            >
              {message.role === 'assistant'
                ? formatAulaChatMessage(message.content).map((line, lineIndex) => {
                    if (line.kind === 'space') {
                      return <div key={`${index}-${lineIndex}-space`} className="h-2" />
                    }

                    if (line.kind === 'bullet') {
                      return (
                        <div key={`${index}-${lineIndex}-bullet`} className="mt-1 flex gap-2">
                          <span className="font-bold text-[#2E5FD4]">•</span>
                          <span>{line.content}</span>
                        </div>
                      )
                    }

                    return <p key={`${index}-${lineIndex}-paragraph`} className="m-0">{line.content}</p>
                  })
                : message.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="rounded-[18px] rounded-bl-[6px] border border-[#E5EAF3] bg-white px-4 py-3">
              <div className="flex items-center gap-1">
                {[0, 150, 300].map((delay) => (
                  <span
                    key={delay}
                    className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-[#9CA3AF]"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="flex items-center gap-3 border-t border-[#E8ECF2] bg-white p-4">
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
          className="h-12 flex-1 rounded-2xl border border-[#C8D3EA] bg-[#F9FBFF] px-4 text-sm text-[#1A1F2E] outline-none transition focus:border-[#2E5FD4] focus:shadow-[0_0_0_3px_rgba(46,95,212,0.1)]"
          disabled={loading}
        />
        <Button
          type="button"
          onClick={() => { void onSend() }}
          disabled={!input.trim() || loading}
          className="h-12 w-12 rounded-2xl p-0"
        >
          <Send size={17} strokeWidth={1.5} />
        </Button>
      </div>
    </div>
  )
}
