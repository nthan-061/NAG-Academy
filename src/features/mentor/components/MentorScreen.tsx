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
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#0D1B3E] border-t-transparent" />
      </div>
    )
  }

  return (
    /*
      Page structure (matches Dashboard's flex-col gap-8 root):
      1. Command bar header
      2. Error banner (when present)
      3. Next-step hero — full width, premium block
      4. Main content grid:
         - Left (dominant): Chat
         - Right (sidebar): Decision panel
         Grid activates at xl (1280px+) only.
         At xl: sidebar = 380px giving chat ~600-700px depending on viewport.
         Below xl: single column, decision panel stacks below chat.
    */
    <div className="flex flex-col gap-8">

      <MentorHeader
        analysis={analysis}
        onRefresh={() => void refreshMentor()}
      />

      {error && (
        <div className="flex items-start gap-4 rounded-xl border border-red-100 bg-red-50 px-6 py-5">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-500" />
          <div>
            <p className="text-[13px] font-semibold text-red-700">
              Não foi possível atualizar o mentor.
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-red-600/80">{error}</p>
          </div>
        </div>
      )}

      <MentorNextStepHero
        primaryRecommendation={primaryRecommendation}
        analysis={analysis}
        profile={profile}
        onAskMentor={handleAskMentor}
      />

      {/*
        Grid layout:
        - 1 col below xl (stacked vertically)
        - 2 col at xl+: chat dominant (1fr), decision panel fixed at 380px
        gap-8 (32px) between columns and between rows when stacked
      */}
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
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
