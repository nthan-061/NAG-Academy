import { useState } from 'react'
import { Brain, Send, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { MentorChatMessage, MentorUserContext } from '../types'

interface MentorChatProps {
  messages: MentorChatMessage[]
  mentorContext: MentorUserContext | null
  loading?: boolean
  sending?: boolean
  onSendMessage: (message: string) => Promise<void>
  initialPrompt?: string
}

const STARTER_PROMPTS = [
  'Meu objetivo com Google Ads e gerar leads qualificados.',
  'Ja anunciei antes, mas erro muito na segmentacao.',
  'Quero que voce monte meu proximo passo de estudo.',
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
    <Card className="border-border bg-white p-8 shadow-card">
      {/* Cabeçalho */}
      <div className="space-y-3">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-text-secondary">
          Conversa guiada
        </p>
        <h2 className="text-[1.55rem] font-bold tracking-[-0.03em] text-foreground">
          Conversa com seu mentor
        </h2>
        <p className="max-w-[680px] text-sm leading-7 text-text-secondary">
          O mentor responde com base no seu historico, nos erros recorrentes e no contexto que voce compartilhar.
        </p>
      </div>

      {/* Objetivo atual, se existir */}
      {mentorContext?.goal && (
        <div className="mt-7 rounded-2xl border border-border bg-background p-6">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-text-secondary">Objetivo atual</p>
          <p className="mt-3 text-sm leading-7 text-foreground">{mentorContext.goal}</p>
        </div>
      )}

      {/* Histórico de mensagens */}
      <div className="mt-7 min-h-[320px] rounded-2xl border border-border bg-background p-6">
        {messages.length === 0 && !loading ? (
          <div className="flex h-full min-h-[280px] flex-col justify-between gap-8">
            <div className="space-y-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary-soft text-secondary">
                <Brain size={20} />
              </div>
              <h3 className="text-[1.1rem] font-semibold text-foreground">
                O mentor ainda nao iniciou a conversa.
              </h3>
              <p className="max-w-[540px] text-sm leading-7 text-text-secondary">
                Comece contando seu objetivo, sua experiencia com Google Ads ou o que mais esta travando seu aprendizado agora.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setDraft(prompt)}
                  className="rounded-full border border-border bg-white px-4 py-2 text-left text-sm font-medium leading-6 text-foreground transition hover:border-secondary/35 hover:bg-secondary-soft"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
              >
                {message.role === 'assistant' && (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary-soft text-secondary">
                    <Brain size={18} />
                  </div>
                )}

                <div
                  className={`max-w-[84%] rounded-2xl px-5 py-4 ${
                    message.role === 'assistant'
                      ? 'border border-border bg-white text-foreground'
                      : 'bg-primary text-white'
                  }`}
                >
                  <p className={`whitespace-pre-wrap text-sm leading-7 ${message.role === 'assistant' ? 'text-text-secondary' : 'text-white'}`}>
                    {message.content}
                  </p>
                </div>

                {message.role === 'user' && (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <UserRound size={18} />
                  </div>
                )}
              </div>
            ))}

            {sending && (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-soft text-secondary">
                  <Brain size={18} />
                </div>
                <div className="rounded-2xl border border-border bg-white px-5 py-4">
                  <p className="text-sm leading-7 text-text-secondary">
                    O mentor esta analisando seu historico e montando a resposta...
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input de envio */}
      <div className="mt-6 rounded-2xl border border-border bg-background p-6">
        <div className="mb-5 flex flex-wrap gap-2.5">
          {STARTER_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => setDraft(prompt)}
              className="rounded-full border border-border bg-white px-3.5 py-2 text-xs font-medium leading-5 text-text-secondary transition hover:border-secondary/35 hover:bg-secondary-soft hover:text-foreground"
            >
              {prompt}
            </button>
          ))}
        </div>

        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          rows={5}
          placeholder="Conte ao mentor onde voce esta travando, qual e seu objetivo ou o que deseja decidir agora."
          className="w-full resize-none rounded-[0.9rem] border border-border bg-white px-5 py-4 text-sm leading-7 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-secondary focus:shadow-focus"
        />

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-[380px] text-xs leading-6 text-text-secondary">
            Quanto mais contexto voce compartilhar, mais preciso fica o diagnostico do mentor.
          </p>

          <Button onClick={() => void handleSubmit()} loading={sending} className="rounded-[0.9rem] px-6">
            Enviar para o mentor
            <Send size={16} />
          </Button>
        </div>
      </div>
    </Card>
  )
}
