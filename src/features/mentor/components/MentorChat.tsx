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
    <Card className="overflow-hidden border-border/70 p-0 shadow-[0_18px_48px_rgba(10,22,40,0.08)]">
      <div className="border-b border-border/70 bg-[linear-gradient(180deg,#ffffff_0%,#f9fbff_100%)] px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-text-secondary">Conversa guiada</p>
            <h3 className="mt-2 text-[1.45rem] font-bold tracking-[-0.03em] text-foreground">Conversa com seu mentor</h3>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              O mentor responde com base no seu historico, nos erros recorrentes e no contexto que voce compartilhar.
            </p>
          </div>

          {mentorContext?.goal && (
            <div className="max-w-[220px] rounded-[1.15rem] border border-secondary/14 bg-secondary-soft/80 px-4 py-3">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-secondary">Objetivo atual</p>
              <p className="mt-2 text-sm font-medium leading-6 text-foreground">{mentorContext.goal}</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 px-5 pb-5 pt-5">
        <div className="flex min-h-[460px] flex-col gap-4 rounded-[1.9rem] border border-border bg-[linear-gradient(180deg,#f9fbff_0%,#f4f7fd_100%)] p-4">
          {messages.length === 0 && !loading ? (
            <div className="flex flex-1 flex-col justify-between gap-6">
              <div className="rounded-[1.6rem] border border-border/70 bg-white/80 px-5 py-5 shadow-[0_12px_24px_rgba(10,22,40,0.05)]">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary-soft text-secondary">
                  <Brain size={22} />
                </div>
                <h4 className="mt-4 text-[1.25rem] font-semibold tracking-[-0.03em] text-foreground">
                  O mentor ainda nao iniciou a conversa.
                </h4>
                <p className="mt-3 text-[0.97rem] leading-7 text-text-secondary">
                  Comece contando seu objetivo, sua experiencia com Google Ads ou o que mais esta travando seu aprendizado agora.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {STARTER_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => setDraft(prompt)}
                    className="rounded-full border border-border bg-white px-4 py-2 text-left text-sm font-medium text-foreground transition hover:border-secondary/40 hover:bg-secondary-soft"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-1 flex-col gap-3 overflow-y-auto pr-1">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-secondary-soft text-secondary">
                      <Brain size={18} />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-[1.6rem] px-4 py-3 shadow-[0_8px_22px_rgba(10,22,40,0.05)] ${
                      message.role === 'assistant'
                        ? 'border border-border bg-white text-foreground'
                        : 'bg-primary text-white'
                    }`}
                  >
                    <p className={`whitespace-pre-wrap text-[0.97rem] leading-7 ${message.role === 'assistant' ? 'text-text-secondary' : 'text-white'}`}>
                      {message.content}
                    </p>
                  </div>

                  {message.role === 'user' && (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <UserRound size={18} />
                    </div>
                  )}
                </div>
              ))}

              {sending && (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary-soft text-secondary">
                    <Brain size={18} />
                  </div>
                  <div className="rounded-[1.5rem] border border-border bg-white px-4 py-3 shadow-[0_8px_22px_rgba(10,22,40,0.05)]">
                    <p className="text-sm leading-6 text-text-secondary">
                      O mentor esta analisando seu historico e montando a resposta...
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="rounded-[1.7rem] border border-border bg-white p-4 shadow-[0_14px_30px_rgba(10,22,40,0.05)]">
          <div className="mb-4 flex flex-wrap gap-2">
            {STARTER_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => setDraft(prompt)}
                className="rounded-full border border-border bg-background-elevated px-3 py-1.5 text-xs font-medium text-text-secondary transition hover:border-secondary/35 hover:bg-secondary-soft hover:text-foreground"
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
            className="w-full resize-none rounded-[1.25rem] border border-border bg-background-elevated px-4 py-3 text-sm leading-7 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-secondary focus:bg-white focus:shadow-focus"
          />

          <div className="mt-4 flex items-center justify-between gap-4">
            <p className="text-xs leading-5 text-text-secondary">
              Quanto mais contexto voce compartilhar, mais preciso fica o diagnostico do mentor.
            </p>

            <Button onClick={() => void handleSubmit()} loading={sending} className="rounded-[1rem] px-6">
              Enviar para o mentor
              <Send size={16} />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
