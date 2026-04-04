import { useMemo, useState } from 'react'
import { Brain, Compass, Send, UserRound } from 'lucide-react'
import { Badge, Button, Card } from '@/components/ui'
import type { MentorChatMessage, MentorPerformanceAnalysis, MentorRecommendation, MentorUserContext, UserLearningProfile } from '../types'

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

  const starterPrompts = useMemo(() => {
    const prompts = [
      recommendations[0]?.action.prompt,
      profile?.topicErrors[0]?.topic ? `Quero corrigir meus erros em ${profile.topicErrors[0].topic}.` : null,
      mentorContext?.goal
        ? `Meu objetivo e ${mentorContext.goal}. Como eu devo estudar agora?`
        : 'Quero definir meu objetivo para melhorar suas recomendacoes.',
      'Monte um plano curto para meu proximo bloco de estudo.',
    ]

    return prompts.filter((value, index, array): value is string => Boolean(value) && array.indexOf(value) === index).slice(0, 4)
  }, [mentorContext?.goal, profile?.topicErrors, recommendations])

  const openingMessage = useMemo(() => {
    if (!analysis) {
      return 'Ja tenho seu historico em processamento. Assim que a leitura terminar, posso sugerir seu proximo passo.'
    }

    if (analysis.status === 'critical') {
      return 'Com base no seu desempenho recente, eu recomendo atacar o principal bloqueio antes de avancar. Posso te ajudar a corrigir os erros mais urgentes ou montar um plano de recuperacao.'
    }

    if (analysis.status === 'attention') {
      return 'Ja analisei seu historico recente e existe um ponto de atencao claro. Posso te ajudar a organizar o proximo passo sem dispersar sua energia.'
    }

    return 'Seu historico indica espaco para avancar com criterio. Se quiser, eu transformo isso em um plano de estudo objetivo para a proxima sessao.'
  }, [analysis])

  async function handleSubmit() {
    const content = draft.trim()
    if (!content) return
    setDraft('')
    await onSendMessage(content)
  }

  return (
    <Card padding="lg" className="space-y-6">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary">
          Conversa guiada
        </p>
        <div className="max-w-3xl">
          <h2 className="text-2xl font-bold tracking-[-0.03em] text-foreground">
            Continue a analise com o mentor
          </h2>
          <p className="mt-2 text-sm leading-7 text-text-secondary">
            O mentor ja conhece seu historico, seus erros recorrentes e a prioridade da tela. Use a conversa para transformar isso em decisao pratica.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {mentorContext?.goal && <Badge variant="info">Objetivo: {mentorContext.goal}</Badge>}
          {profile?.topicErrors[0]?.topic && <Badge variant="warning">Tema critico: {profile.topicErrors[0].topic}</Badge>}
          {recommendations[0] && <Badge variant="default">Foco atual: {recommendations[0].title}</Badge>}
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-border bg-background-elevated p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-secondary-soft text-secondary">
            <Compass size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Primeira orientacao do mentor
            </p>
            <p className="mt-1 text-sm leading-7 text-text-secondary">
              {openingMessage}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-border bg-background-elevated p-5">
        {messages.length === 0 && !loading ? (
          <div className="flex min-h-[240px] flex-col justify-between gap-6">
            <div>
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary-soft text-secondary">
                <Brain size={18} />
              </div>
              <p className="text-base font-semibold text-foreground">
                A conversa ja nasce com contexto.
              </p>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-text-secondary">
                Em vez de partir de um campo vazio, voce pode pedir que eu explique a prioridade atual, corrija seus erros ou monte um plano de estudo coerente com o seu momento.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {starterPrompts.map((prompt) => (
                <Button
                  key={prompt}
                  variant="outline"
                  size="sm"
                  onClick={() => setDraft(prompt)}
                  className="h-auto rounded-full px-4 py-2 text-left whitespace-normal"
                >
                  {prompt}
                </Button>
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
                    <Brain size={15} />
                  </div>
                )}

                <div
                  className={`max-w-[82%] rounded-2xl px-4 py-3 ${
                    message.role === 'assistant'
                      ? 'border border-border bg-white text-foreground'
                      : 'bg-primary text-white'
                  }`}
                >
                  <p
                    className={`whitespace-pre-wrap text-sm leading-7 ${
                      message.role === 'assistant' ? 'text-text-secondary' : 'text-white'
                    }`}
                  >
                    {message.content}
                  </p>
                </div>

                {message.role === 'user' && (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary-soft text-secondary">
                    <UserRound size={15} />
                  </div>
                )}
              </div>
            ))}

            {sending && (
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary-soft text-secondary">
                  <Brain size={15} />
                </div>
                <div className="rounded-2xl border border-border bg-white px-4 py-3">
                  <p className="text-sm text-text-secondary">
                    O mentor esta cruzando seu historico, seus erros e seu contexto para responder.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="rounded-[1.5rem] border border-border bg-white p-5">
        <div className="mb-4 flex flex-wrap gap-2">
          {starterPrompts.map((prompt) => (
            <Button
              key={prompt}
              variant="ghost"
              size="sm"
              onClick={() => setDraft(prompt)}
              className="h-auto rounded-full border border-border px-4 py-2 text-xs whitespace-normal"
            >
              {prompt}
            </Button>
          ))}
        </div>

        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={4}
          placeholder="Pergunte o que deve fazer agora, peça um plano curto ou traga a decisao que voce quer tomar."
          className="w-full resize-none rounded-2xl border border-border bg-background-elevated px-4 py-3 text-sm leading-7 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-secondary focus:shadow-focus"
        />

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <p className="max-w-md text-xs leading-6 text-muted-foreground">
            Se quiser, voce pode pedir uma decisao objetiva, um plano de estudo curto ou uma explicacao do risco mais importante.
          </p>

          <Button size="lg" onClick={() => void handleSubmit()} loading={sending}>
            {!sending && <Send size={15} />}
            Enviar para o mentor
          </Button>
        </div>
      </div>
    </Card>
  )
}
