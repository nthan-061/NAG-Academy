import { useState } from 'react'
import { Brain, Send, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Text } from '@/components/ui/Text'
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
    <Card className="flex h-full flex-col gap-5 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Text as="h3" variant="h3">Conversa com seu mentor</Text>
          <Text>O mentor responde com base no seu historico, nos erros recorrentes e no contexto que voce compartilhar.</Text>
        </div>

        {mentorContext?.goal && (
          <div className="rounded-2xl bg-secondary-soft px-3 py-2 text-right">
            <Text variant="caption">Objetivo atual</Text>
            <Text variant="bodyStrong" className="max-w-[220px] text-sm leading-5">{mentorContext.goal}</Text>
          </div>
        )}
      </div>

      <div className="flex min-h-[420px] flex-1 flex-col gap-3 rounded-3xl border border-border bg-background-elevated p-4">
        {messages.length === 0 && !loading ? (
          <div className="flex flex-1 flex-col justify-between gap-6">
            <div className="space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary-soft text-secondary">
                <Brain size={22} />
              </div>
              <Text variant="bodyStrong" className="text-base">O mentor ainda nao iniciou a conversa.</Text>
              <Text>
                Comece contando seu objetivo, sua experiencia com Google Ads ou o que mais esta travando seu aprendizado agora.
              </Text>
            </div>

            <div className="flex flex-wrap gap-2">
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setDraft(prompt)}
                  className="rounded-full border border-border bg-surface px-4 py-2 text-left text-sm text-foreground transition hover:border-secondary hover:bg-secondary-soft"
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
                  className={`max-w-[85%] rounded-3xl px-4 py-3 ${
                    message.role === 'assistant'
                      ? 'border border-border bg-surface text-foreground'
                      : 'bg-primary text-white'
                  }`}
                >
                  <Text
                    className={`whitespace-pre-wrap leading-6 ${message.role === 'assistant' ? '' : '!text-white'}`}
                  >
                    {message.content}
                  </Text>
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
                <div className="rounded-3xl border border-border bg-surface px-4 py-3">
                  <Text>O mentor esta analisando seu historico e montando a resposta...</Text>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          rows={4}
          placeholder="Conte ao mentor onde voce esta travando, qual e seu objetivo ou o que deseja decidir agora."
          className="w-full rounded-3xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-secondary focus:shadow-focus"
        />

        <div className="flex justify-end">
          <Button onClick={() => void handleSubmit()} loading={sending} className="min-w-[180px]">
            Enviar para o mentor
            <Send size={16} />
          </Button>
        </div>
      </div>
    </Card>
  )
}
