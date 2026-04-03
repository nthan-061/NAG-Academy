import { useMemo, useState } from 'react'
import { AlertCircle, BookOpen, RefreshCcw, Target, Timer, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useMentor } from '../hooks'
import { MentorChat } from './MentorChat'
import { MentorInsights } from './MentorInsights'

const metricStyles = [
  { icon: TrendingUp, iconColor: 'text-secondary',  iconBg: 'bg-secondary-soft' },
  { icon: Timer,      iconColor: 'text-success',     iconBg: 'bg-success-soft'  },
  { icon: Target,     iconColor: 'text-warning',     iconBg: 'bg-warning-soft'  },
  { icon: BookOpen,   iconColor: 'text-danger',      iconBg: 'bg-danger-soft'   },
] as const

export function MentorScreen() {
  const {
    profile, analysis, insights, recommendations,
    messages, mentorContext, loading, sending, error,
    refreshMentor, sendMessage, acknowledgeInsight,
  } = useMentor()

  const [queuedPrompt, setQueuedPrompt] = useState<{ value: string; nonce: number } | null>(null)

  const summaryMetrics = useMemo(() => {
    if (!profile || !analysis) return []
    return [
      {
        label: 'Nivel estimado',
        value: profile.estimatedLevel.label,
        helper: `${Math.round(profile.estimatedLevel.confidence * 100)}% de confianca`,
      },
      {
        label: 'Consistencia',
        value: `${profile.consistency.consistencyScore}%`,
        helper: `${profile.consistency.activeDaysLast7} dias ativos na semana`,
      },
      {
        label: 'Acuracia recente',
        value: `${Math.round(profile.studyVelocity.recentAccuracy * 100)}%`,
        helper: analysis.status === 'critical'
          ? 'Precisa reforco imediato'
          : analysis.status === 'attention'
          ? 'Vale reforcar topicos'
          : 'Bom momento para avancar',
      },
      {
        label: 'Flashcards pendentes',
        value: String(profile.recentEngagement.pendingFlashcards),
        helper: `${profile.recentEngagement.overdueFlashcards} em atraso`,
      },
    ]
  }, [analysis, profile])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-8">

      {/* ── Hero: título + métricas ── */}
      <Card padding="lg">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-2">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-text-secondary">
              Painel do mentor
            </p>
            <h1 className="text-[2rem] font-bold tracking-[-0.04em] text-foreground">
              Mentor IA
            </h1>
            <p className="max-w-[640px] text-sm leading-7 text-text-secondary">
              Uma leitura orientada do seu progresso, das dificuldades recorrentes e do proximo passo mais util dentro da plataforma.
            </p>
          </div>

          <Button variant="outline" onClick={() => void refreshMentor()}>
            <RefreshCcw size={15} />
            Atualizar diagnostico
          </Button>
        </div>

        {!!summaryMetrics.length && (
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {summaryMetrics.map((metric, index) => {
              const style = metricStyles[index]
              const Icon = style.icon
              return (
                <div
                  key={metric.label}
                  className="rounded-xl border border-border bg-background-elevated p-6"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-text-secondary">
                      {metric.label}
                    </p>
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${style.iconBg} ${style.iconColor}`}>
                      <Icon size={15} />
                    </div>
                  </div>

                  <p className="mt-4 text-2xl font-bold capitalize tracking-[-0.03em] text-foreground">
                    {metric.value}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-text-secondary">
                    {metric.helper}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {error && (
        <Card className="border-danger/20 bg-danger-soft" padding="md">
          <div className="flex items-start gap-3 text-danger">
            <AlertCircle size={17} className="mt-0.5 shrink-0" />
            <div className="space-y-0.5">
              <p className="text-sm font-semibold">Nao foi possivel carregar tudo do mentor.</p>
              <p className="text-sm leading-6">{error}</p>
            </div>
          </div>
        </Card>
      )}

      <MentorInsights
        profile={profile}
        analysis={analysis}
        insights={insights}
        recommendations={recommendations}
        onAcknowledgeInsight={acknowledgeInsight}
        onAskMentor={(prompt) => setQueuedPrompt({ value: prompt, nonce: Date.now() })}
      />

      <MentorChat
        key={queuedPrompt?.nonce ?? 0}
        messages={messages}
        mentorContext={mentorContext}
        sending={sending}
        onSendMessage={sendMessage}
        initialPrompt={queuedPrompt?.value ?? ''}
      />

    </div>
  )
}
