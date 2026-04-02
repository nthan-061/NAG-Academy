import { useMemo, useState } from 'react'
import { AlertCircle, RefreshCcw, Sparkles, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Text } from '@/components/ui/Text'
import { useMentor } from '../hooks'
import { MentorChat } from './MentorChat'
import { MentorInsights } from './MentorInsights'

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
        helper: `${Math.round(profile.estimatedLevel.confidence * 100)}% de confianca`,
      },
      {
        label: 'Consistencia',
        value: `${profile.consistency.consistencyScore}%`,
        helper: `${profile.consistency.activeDaysLast7} dias ativos nos ultimos 7`,
      },
      {
        label: 'Acuracia recente',
        value: `${Math.round(profile.studyVelocity.recentAccuracy * 100)}%`,
        helper: analysis.summary,
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
    <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary-soft px-4 py-2 text-sm font-semibold text-secondary">
            <Sparkles size={16} />
            Mentor IA contextual
          </div>
          <div>
            <Text as="h1" variant="h1" className="text-[2.6rem] leading-[1.02]">
              Seu mentor interpreta comportamento, nao apenas mensagens.
            </Text>
            <Text className="mt-3 max-w-[760px] text-base leading-7">
              Aqui o mentor cruza progresso real, erros de quiz, revisao por flashcards e consistencia para orientar suas proximas decisoes com mais clareza.
            </Text>
          </div>
        </div>

        <Button variant="outline" onClick={() => void refreshMentor()}>
          Atualizar diagnostico
          <RefreshCcw size={16} />
        </Button>
      </div>

      {error && (
        <Card className="border-danger/20 bg-danger-soft p-4">
          <div className="flex items-start gap-3 text-danger">
            <AlertCircle size={18} className="mt-0.5" />
            <div>
              <Text variant="bodyStrong" tone="danger">Nao foi possivel carregar tudo do mentor.</Text>
              <Text tone="danger">{error}</Text>
            </div>
          </div>
        </Card>
      )}

      {!!summaryMetrics.length && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {summaryMetrics.map((metric) => (
            <Card key={metric.label} className="space-y-2 p-5">
              <Text variant="caption">{metric.label}</Text>
              <Text variant="h2" className="text-[2rem] capitalize">{metric.value}</Text>
              <Text>{metric.helper}</Text>
            </Card>
          ))}
        </div>
      )}

      {profile && (
        <Card className="grid gap-5 p-6 lg:grid-cols-[1.2fr,0.8fr]">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-secondary" />
              <Text as="h2" variant="h2">Leitura do perfil de aprendizado</Text>
            </div>
            <Text>
              {profile.userName}, o mentor estima seu nivel como <strong className="capitalize text-foreground">{profile.estimatedLevel.label}</strong> e enxerga
              {' '}tendencia <strong className="capitalize text-foreground">{profile.evolutionTrend.direction}</strong> no seu desempenho recente.
            </Text>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-background-elevated p-4">
                <Text variant="caption">Pontos fortes</Text>
                <ul className="mt-3 space-y-2 text-sm text-text-secondary">
                  {profile.strengths.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
              <div className="rounded-2xl bg-background-elevated p-4">
                <Text variant="caption">Pontos fracos</Text>
                <ul className="mt-3 space-y-2 text-sm text-text-secondary">
                  {profile.weakPoints.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-border bg-background-elevated p-5">
            <Text as="h3" variant="h3">Contexto conhecido do aluno</Text>
            <div className="mt-4 space-y-3">
              <div>
                <Text variant="caption">Objetivo</Text>
                <Text>{mentorContext?.goal ?? 'Ainda nao informado ao mentor.'}</Text>
              </div>
              <div>
                <Text variant="caption">Experiencia previa</Text>
                <Text>{mentorContext?.experience_level ?? 'Nao informado'}</Text>
              </div>
              <div>
                <Text variant="caption">Contexto de uso</Text>
                <Text>{mentorContext?.use_case ?? 'Nao informado'}</Text>
              </div>
              <div>
                <Text variant="caption">Desafios declarados</Text>
                <Text>{mentorContext?.declared_challenges?.join(', ') || 'Nenhum desafio declarado ainda.'}</Text>
              </div>
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
