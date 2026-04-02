import { useMemo, useState } from 'react'
import { AlertCircle, Brain, RefreshCcw, ShieldAlert, Sparkles, TrendingUp, Zap } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useMentor } from '../hooks'
import { MentorChat } from './MentorChat'
import { MentorInsights } from './MentorInsights'

const metricStyles = [
  {
    valueClass: 'text-primary',
    ringClass: 'border-secondary/18 bg-secondary-soft/70',
    icon: TrendingUp,
  },
  {
    valueClass: 'text-foreground',
    ringClass: 'border-success/18 bg-success-soft/80',
    icon: Sparkles,
  },
  {
    valueClass: 'text-warning',
    ringClass: 'border-warning/20 bg-warning-soft/90',
    icon: ShieldAlert,
  },
  {
    valueClass: 'text-danger',
    ringClass: 'border-danger/20 bg-danger-soft/90',
    icon: Zap,
  },
] as const

export function MentorScreen() {
  const {
    profile,
    analysis,
    insights,
    recommendations,
    messages,
    mentorContext,
    loading,
    sending,
    error,
    refreshMentor,
    sendMessage,
    acknowledgeInsight,
  } = useMentor()

  const [queuedPrompt, setQueuedPrompt] = useState<{ value: string; nonce: number } | null>(null)

  const summaryMetrics = useMemo(() => {
    if (!profile || !analysis) return []

    return [
      {
        label: 'Nivel estimado',
        value: profile.estimatedLevel.label,
        helper: `${Math.round(profile.estimatedLevel.confidence * 100)}% de confianca no diagnostico`,
      },
      {
        label: 'Consistencia',
        value: `${profile.consistency.consistencyScore}%`,
        helper: `${profile.consistency.activeDaysLast7} dias ativos na ultima semana`,
      },
      {
        label: 'Acuracia recente',
        value: `${Math.round(profile.studyVelocity.recentAccuracy * 100)}%`,
        helper: analysis.summary,
      },
      {
        label: 'Flashcards pendentes',
        value: String(profile.recentEngagement.pendingFlashcards),
        helper: `${profile.recentEngagement.overdueFlashcards} em atraso agora`,
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
    <div className="mx-auto flex w-full max-w-[1340px] flex-col gap-8 md:gap-10">
      <Card className="overflow-hidden border-border/70 bg-surface p-0 shadow-[0_26px_70px_rgba(10,22,40,0.10)]">
        <div className="bg-[linear-gradient(135deg,rgba(13,27,62,1)_0%,rgba(30,58,110,1)_58%,rgba(46,95,212,0.92)_100%)] px-8 py-10 text-white md:px-12 md:py-12">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-[780px] space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/16 bg-white/10 px-4 py-2 text-sm font-semibold text-white/95 backdrop-blur">
                <Brain size={16} />
                Mentor IA contextual
              </div>

              <div className="space-y-5">
                <h1 className="max-w-[940px] !text-white text-[2.3rem] font-bold leading-[1.08] tracking-[-0.04em] md:text-[3rem]">
                  Seu mentor interpreta comportamento e transforma historico em direcao pratica.
                </h1>
                <p className="max-w-[760px] text-[1rem] leading-8 text-white/84 md:text-[1.05rem]">
                  O mentor cruza progresso, desempenho em quiz, padrao de revisao e consistencia de estudo para mostrar o que esta travando seu avanco e qual deve ser seu proximo passo.
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <Button
                variant="secondary"
                className="border-white/10 bg-white px-5 text-primary shadow-none hover:bg-white/92"
                onClick={() => void refreshMentor()}
              >
                Atualizar diagnostico
                <RefreshCcw size={16} />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {!!summaryMetrics.length && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {summaryMetrics.map((metric, index) => {
            const style = metricStyles[index]
            const Icon = style.icon

            return (
              <Card
                key={metric.label}
                className={`rounded-[1.6rem] border px-6 py-6 shadow-[0_16px_30px_rgba(10,22,40,0.06)] ${style.ringClass}`}
              >
                <div className="mb-5 flex items-center justify-between gap-3">
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-text-secondary">
                    {metric.label}
                  </p>
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/85 text-primary shadow-sm">
                    <Icon size={18} />
                  </div>
                </div>

                <p className={`text-[2rem] font-bold capitalize tracking-[-0.04em] ${style.valueClass}`}>
                  {metric.value}
                </p>
                <p className="mt-3 text-sm leading-7 text-text-secondary">
                  {metric.helper}
                </p>
              </Card>
            )
          })}
        </div>
      )}

      {error && (
        <Card className="border-danger/20 bg-danger-soft px-5 py-4">
          <div className="flex items-start gap-3 text-danger">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold">Nao foi possivel carregar tudo do mentor.</p>
              <p className="mt-1 text-sm leading-6">{error}</p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-7 xl:grid-cols-[minmax(0,1.12fr),420px]">
        <div className="min-w-0">
          <MentorInsights
            profile={profile}
            analysis={analysis}
            insights={insights}
            recommendations={recommendations}
            onAcknowledgeInsight={acknowledgeInsight}
            onAskMentor={(prompt) => setQueuedPrompt({ value: prompt, nonce: Date.now() })}
          />
        </div>

        <div className="min-w-0">
          <div className="xl:sticky xl:top-[96px]">
            <MentorChat
              key={queuedPrompt?.nonce ?? 0}
              messages={messages}
              mentorContext={mentorContext}
              sending={sending}
              onSendMessage={sendMessage}
              initialPrompt={queuedPrompt?.value ?? ''}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
