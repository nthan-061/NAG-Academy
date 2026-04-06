import { useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { useMentor } from '../hooks'
import { MentorChat } from './MentorChat'
import { MentorDecisionPanel } from './MentorDecisionPanel'
import { MentorHeader } from './MentorHeader'
import { MentorNextStepHero } from './MentorNextStepHero'

/*
  Page layout:
  - Root: flex column, gap 32px (matches Dashboard's gap-8)
  - Section order: header → hero → [chat | sidebar]
  - Grid: single col by default, two cols at xl (1280px+)
  - Sidebar: 400px — wide enough for comfortable card reading
  - Chat column: flex-1 — takes all remaining space
  - No extra padding: PageLayout (wide) provides px-4 lg:px-6 py-8
*/

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
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
        }}
      >
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#0D1B3E] border-t-transparent" />
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '32px',
      }}
    >
      {/* ── 1. Command bar ── */}
      <MentorHeader
        analysis={analysis}
        onRefresh={() => void refreshMentor()}
      />

      {/* ── 2. Error banner ── */}
      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px',
            padding: '18px 20px',
            borderRadius: '10px',
            border: '1px solid rgba(239,68,68,0.20)',
            backgroundColor: '#FEF2F2',
          }}
        >
          <AlertCircle size={16} style={{ marginTop: '2px', flexShrink: 0, color: '#EF4444' }} />
          <div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#DC2626', margin: '0 0 4px 0' }}>
              Não foi possível atualizar o mentor.
            </p>
            <p style={{ fontSize: '13px', lineHeight: 1.65, color: 'rgba(220,38,38,0.80)', margin: 0 }}>
              {error}
            </p>
          </div>
        </div>
      )}

      {/* ── 3. Hero — full width ── */}
      <MentorNextStepHero
        primaryRecommendation={primaryRecommendation}
        analysis={analysis}
        profile={profile}
        onAskMentor={handleAskMentor}
      />

      {/* ── 4. Chat + Sidebar grid ── */}
      {/*
        Below xl: single column (sidebar stacks below chat)
        At xl+: two columns — chat takes flex-1, sidebar fixed 400px
        gap: 32px between columns
      */}
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_400px]">
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
