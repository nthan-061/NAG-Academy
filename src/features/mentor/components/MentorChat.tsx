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
    <Card padding="lg">

      {/* Cabeçalho — mesmo padrão de SectionHeader das outras seções */}
      <div className="space-y-2">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-text-secondary">
          Conversa guiada
        </p>
        <h2 className="text-2xl font-bold tracking-[-0.03em] text-foreground">
          Conversa com seu mentor
        </h2>
        <p className="max-w-[640px] text-sm leading-7 text-text-secondary">
          O mentor responde com base no seu historico, nos erros recorrentes e no contexto que voce compartilhar.
        </p>
      </div>

      {/* Objetivo atual, se existir */}
      {mentorContext?.goal && (
        <div className="mt-6 rounded-xl border border-border bg-background-elevated p-5">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-text-secondary">
            Objetivo atual
          </p>
          <p className="mt-2 text-sm leading-7 text-foreground">{mentorContext.goal}</p>
        </div>
      )}

      {/* Histórico de mensagens */}
      <div className="mt-6 min-h-[300px] rounded-xl border border-border bg-background-elevated p-6">
        {messages.length === 0 && !loading ? (
          <div className="flex h-full min-h-[260px] flex-col justify-between gap-6">
            <div className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-soft text-secondary">
                <Brain size={18} />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                O mentor ainda nao iniciou a conversa.
              </h3>
              <p className="max-w-[500px] text-sm leading-7 text-text-secondary">
                Comece contando seu objetivo, sua experiencia com Google Ads ou o que mais esta travando seu aprendizado agora.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setDraft(prompt)}
                  className="rounded-full border border-border bg-surface px-4 py-1.5 text-left text-xs font-medium text-foreground transition hover:border-secondary/30 hover:bg-secondary-soft"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
              >
                {message.role === 'assistant' && (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary-soft text-secondary">
                    <Brain size={16} />
                  </div>
                )}

                <div
                  className={`max-w-[82%] rounded-xl px-4 py-3 ${
                    message.role === 'assistant'
                      ? 'border border-border bg-surface text-foreground'
                      : 'bg-primary text-white'
                  }`}
                >
                  <p className={`whitespace-pre-wrap text-sm leading-7 ${
                    message.role === 'assistant' ? 'text-text-secondary' : 'text-white'
                  }`}>
                    {message.content}
                  </p>
                </div>

                {message.role === 'user' && (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <UserRound size={16} />
                  </div>
                )}
              </div>
            ))}

            {sending && (
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary-soft text-secondary">
                  <Brain size={16} />
                </div>
                <div className="rounded-xl border border-border bg-surface px-4 py-3">
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
      <div className="mt-4 rounded-xl border border-border bg-background-elevated p-5">
        <div className="mb-4 flex flex-wrap gap-2">
          {STARTER_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => setDraft(prompt)}
              className="rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-medium text-text-secondary transition hover:border-secondary/30 hover:bg-secondary-soft hover:text-foreground"
            >
              {prompt}
            </button>
          ))}
        </div>

        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          rows={4}
          placeholder="Conte ao mentor onde voce esta travando, qual e seu objetivo ou o que deseja decidir agora."
          className="w-full resize-none rounded-xl border border-border bg-surface px-5 py-4 text-sm leading-7 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-secondary focus:shadow-focus"
        />

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-[360px] text-xs leading-6 text-text-secondary">
            Quanto mais contexto voce compartilhar, mais preciso fica o diagnostico do mentor.
          </p>

          <Button onClick={() => void handleSubmit()} loading={sending}>
            Enviar para o mentor
            <Send size={15} />
          </Button>
        </div>
      </div>

    </Card>
  )
}
