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
    // PageLayout (wide) provides: max-w-7xl, px-4 lg:px-6, py-8
    // No extra padding/max-w here — matches Dashboard's root pattern: flex flex-col gap-8
    <div className="flex flex-col gap-8">

      {/* Zone 1 — Command bar */}
      <MentorHeader
        analysis={analysis}
        onRefresh={() => void refreshMentor()}
      />

      {error && (
        <div className="flex items-start gap-4 rounded-[20px] border border-danger/20 bg-danger-soft px-7 py-6 shadow-[0_16px_40px_rgba(10,22,40,0.05)]">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-danger" />
          <div>
            <p className="text-sm font-semibold text-danger">
              Não foi possível atualizar o mentor.
            </p>
            <p className="mt-1 text-sm leading-relaxed text-danger/80">{error}</p>
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

      {/* Zone 3 — Chat (dominant) + Decision panel
          lg: 2 cols with 360px sidebar (activates at 1024px)
          xl: wider sidebar at 420px (activates at 1280px)
          Below lg: single column, panel stacks below chat
      */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_420px]">
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
