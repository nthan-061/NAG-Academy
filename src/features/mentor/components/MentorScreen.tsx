import { useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { useMentor } from '../hooks'
import { MentorChat } from './MentorChat'
import { MentorDecisionPanel } from './MentorDecisionPanel'
import { MentorHeader } from './MentorHeader'
import { MentorNextStepHero } from './MentorNextStepHero'

export function MentorScreen() {
  const {
    profile,
    analysis,
    recommendations,
    messages,
    mentorContext,
    loading,
    sending,
    error,
    refreshMentor,
    sendMessage,
  } = useMentor()

  const [queuedPrompt, setQueuedPrompt] = useState<{ value: string; nonce: number } | null>(null)

  const primaryRecommendation = recommendations[0] ?? null
  const secondaryRecommendations = recommendations.slice(1, 4)

  function handleAskMentor(prompt: string) {
    setQueuedPrompt({ value: prompt, nonce: Date.now() })
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 px-6 py-6 lg:px-8 lg:py-7">
      {/* Zone 1 — Command bar */}
      <MentorHeader
        analysis={analysis}
        onRefresh={() => void refreshMentor()}
      />

      {error && (
        <div className="flex items-start gap-3 rounded-[14px] border border-danger/20 bg-danger-soft px-5 py-4">
          <AlertCircle size={15} className="mt-0.5 shrink-0 text-danger" />
          <div>
            <p className="text-sm font-semibold text-danger">Não foi possível atualizar o mentor.</p>
            <p className="mt-0.5 text-xs leading-relaxed text-danger/80">{error}</p>
          </div>
        </div>
      )}

      {/* Zone 2 — Primary: next step hero */}
      <MentorNextStepHero
        primaryRecommendation={primaryRecommendation}
        analysis={analysis}
        profile={profile}
        onAskMentor={handleAskMentor}
      />

      {/* Zone 3 — Secondary + Tertiary: chat + decision panel */}
      <div className="grid gap-6 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_360px]">
        <MentorChat
          key={queuedPrompt?.nonce ?? 0}
          messages={messages}
          mentorContext={mentorContext}
          profile={profile}
          analysis={analysis}
          recommendations={recommendations}
          sending={sending}
          onSendMessage={sendMessage}
          initialPrompt={queuedPrompt?.value ?? ''}
        />

        <MentorDecisionPanel
          recommendations={secondaryRecommendations}
          onAskMentor={handleAskMentor}
        />
      </div>
    </div>
  )
}
