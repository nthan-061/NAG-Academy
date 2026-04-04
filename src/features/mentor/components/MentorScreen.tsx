import { useState } from 'react'
import { AlertCircle, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui'
import { useMentor } from '../hooks'
import { MentorChat } from './MentorChat'
import { MentorHeader } from './MentorHeader'
import { MentorQuickActions } from './MentorQuickActions'

export function MentorScreen() {
  const {
    profile, analysis, recommendations,
    messages, mentorContext, loading, sending, error,
    refreshMentor, sendMessage,
  } = useMentor()

  const [queuedPrompt, setQueuedPrompt] = useState<{ value: string; nonce: number } | null>(null)

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
        <MentorHeader profile={profile} analysis={analysis} />

        <Button variant="outline" onClick={() => void refreshMentor()}>
          <RefreshCcw size={14} />
          Atualizar
        </Button>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-danger/20 bg-danger-soft px-5 py-4">
          <AlertCircle size={17} className="mt-1 shrink-0 text-danger" />
          <div>
            <p className="text-sm font-semibold text-danger">
              Nao foi possivel atualizar a leitura do mentor.
            </p>
            <p className="text-sm text-danger/85">{error}</p>
          </div>
        </div>
      )}

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

      <MentorQuickActions
        recommendations={recommendations}
        onAskMentor={(prompt) => setQueuedPrompt({ value: prompt, nonce: Date.now() })}
      />
    </div>
  )
}
