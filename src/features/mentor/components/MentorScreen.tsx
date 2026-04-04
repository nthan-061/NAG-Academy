import { useMemo, useState } from 'react'
import { AlertCircle, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui'
import { useMentor } from '../hooks'
import { MentorChat } from './MentorChat'
import { MentorHero } from './MentorHero'
import { MentorInsights } from './MentorInsights'
import { MentorPriorityAction } from './MentorPriorityAction'

export function MentorScreen() {
  const {
    profile, analysis, insights, recommendations,
    messages, mentorContext, loading, sending, error,
    refreshMentor, sendMessage, acknowledgeInsight,
  } = useMentor()

  const [queuedPrompt, setQueuedPrompt] = useState<{ value: string; nonce: number } | null>(null)

  const sortedRecommendations = useMemo(
    () => [...recommendations].sort((a, b) => (
      (b.priority === 'high' ? 3 : b.priority === 'medium' ? 2 : 1)
      - (a.priority === 'high' ? 3 : a.priority === 'medium' ? 2 : 1)
    )),
    [recommendations],
  )

  const priorityRecommendation = sortedRecommendations[0] ?? null

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary">
            Mentor IA
          </p>
          <p className="mt-2 text-sm leading-7 text-text-secondary">
            Uma experiencia de orientacao inteligente para reduzir duvida, destacar prioridade e transformar leitura em acao.
          </p>
        </div>

        <Button variant="outline" onClick={() => void refreshMentor()}>
          <RefreshCcw size={14} />
          Atualizar diagnostico
        </Button>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-danger/20 bg-danger-soft px-5 py-4">
          <AlertCircle size={17} className="mt-1 shrink-0 text-danger" />
          <div>
            <p className="text-sm font-semibold text-danger">
              Nao foi possivel carregar o diagnostico do mentor.
            </p>
            <p className="text-sm text-danger/85">{error}</p>
          </div>
        </div>
      )}

      <MentorHero
        profile={profile}
        analysis={analysis}
        priorityRecommendation={priorityRecommendation}
        onAskMentor={(prompt) => setQueuedPrompt({ value: prompt, nonce: Date.now() })}
      />

      <MentorPriorityAction
        recommendation={priorityRecommendation}
        onAskMentor={(prompt) => setQueuedPrompt({ value: prompt, nonce: Date.now() })}
      />

      <MentorInsights
        profile={profile}
        analysis={analysis}
        insights={insights}
        recommendations={sortedRecommendations}
        onAcknowledgeInsight={acknowledgeInsight}
        onAskMentor={(prompt) => setQueuedPrompt({ value: prompt, nonce: Date.now() })}
      />

      <MentorChat
        key={queuedPrompt?.nonce ?? 0}
        messages={messages}
        mentorContext={mentorContext}
        profile={profile}
        analysis={analysis}
        recommendations={sortedRecommendations}
        sending={sending}
        onSendMessage={sendMessage}
        initialPrompt={queuedPrompt?.value ?? ''}
      />
    </div>
  )
}
