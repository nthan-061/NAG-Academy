import { Link } from 'react-router-dom'
import { AlertTriangle, ArrowRight, CheckCircle2, Lightbulb, Target, X } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Text } from '@/components/ui/Text'
import type { MentorInsight, MentorPerformanceAnalysis, MentorRecommendation, UserLearningProfile } from '../types'

const toneIcon = {
  encouragement: CheckCircle2,
  focus: Target,
  warning: AlertTriangle,
  opportunity: Lightbulb,
} as const

const priorityVariant = {
  low: 'default',
  medium: 'warning',
  high: 'danger',
} as const

interface MentorInsightsProps {
  profile: UserLearningProfile | null
  analysis: MentorPerformanceAnalysis | null
  insights: MentorInsight[]
  recommendations: MentorRecommendation[]
  onAcknowledgeInsight: (id: string) => void
  onAskMentor: (prompt: string) => void
}

export function MentorInsights({
  profile,
  analysis,
  insights,
  recommendations,
  onAcknowledgeInsight,
  onAskMentor,
}: MentorInsightsProps) {
  return (
    <div className="flex flex-col gap-6">
      <Card className="space-y-5 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <Badge variant={analysis?.status === 'critical' ? 'danger' : analysis?.status === 'attention' ? 'warning' : 'success'}>
              {analysis?.status === 'critical' ? 'Estado critico' : analysis?.status === 'attention' ? 'Pede atencao' : 'Bom momento'}
            </Badge>
            <Text as="h2" variant="h2">Leitura atual do mentor</Text>
            <Text>{analysis?.summary ?? 'Carregando leitura comportamental do aluno.'}</Text>
          </div>

          {profile && (
            <div className="grid min-w-[220px] grid-cols-2 gap-3 rounded-2xl border border-border bg-background-elevated p-4">
              <div>
                <Text variant="caption">Nivel estimado</Text>
                <Text variant="bodyStrong" className="capitalize">{profile.estimatedLevel.label}</Text>
              </div>
              <div>
                <Text variant="caption">Consistencia</Text>
                <Text variant="bodyStrong">{profile.consistency.consistencyScore}%</Text>
              </div>
              <div>
                <Text variant="caption">Acuracia recente</Text>
                <Text variant="bodyStrong">{Math.round(profile.studyVelocity.recentAccuracy * 100)}%</Text>
              </div>
              <div>
                <Text variant="caption">Flashcards pendentes</Text>
                <Text variant="bodyStrong">{profile.recentEngagement.pendingFlashcards}</Text>
              </div>
            </div>
          )}
        </div>

        {!!analysis?.focusTopics.length && (
          <div className="flex flex-wrap gap-2">
            {analysis.focusTopics.map((topic) => (
              <Badge key={topic} variant="info">{topic}</Badge>
            ))}
          </div>
        )}
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <Card className="space-y-4 p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <Text as="h3" variant="h3">Insights personalizados</Text>
              <Text>Observacoes derivadas do uso real da plataforma.</Text>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {insights.length > 0 ? insights.map((insight) => {
              const Icon = toneIcon[insight.tone]

              return (
                <div key={insight.id} className="rounded-2xl border border-border bg-background-elevated p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex gap-3">
                      <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary-soft text-secondary">
                        <Icon size={18} />
                      </div>
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Text variant="bodyStrong" className="text-base leading-6">{insight.title}</Text>
                          <Badge variant={priorityVariant[insight.priority]}>{insight.priority}</Badge>
                        </div>
                        <Text className="leading-6">{insight.message}</Text>
                        {insight.actionHint && <Text variant="caption">{insight.actionHint}</Text>}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onAcknowledgeInsight(insight.id)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-surface hover:text-foreground"
                      aria-label="Dispensar insight"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              )
            }) : (
              <div className="rounded-2xl border border-dashed border-border bg-background-elevated p-6">
                <Text>Sem insights pendentes no momento. O mentor vai continuar monitorando sua evolucao.</Text>
              </div>
            )}
          </div>
        </Card>

        <Card className="space-y-4 p-6">
          <div>
            <Text as="h3" variant="h3">Proximos passos recomendados</Text>
            <Text>Acoes praticas para destravar progresso e consolidar aprendizado.</Text>
          </div>

          <div className="flex flex-col gap-4">
            {recommendations.map((recommendation) => (
              <div key={recommendation.id} className="rounded-2xl border border-border bg-background-elevated p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Text variant="bodyStrong" className="text-base leading-6">{recommendation.title}</Text>
                      <Badge variant={priorityVariant[recommendation.priority]}>{recommendation.priority}</Badge>
                    </div>
                    <Text className="leading-6">{recommendation.message}</Text>
                  </div>
                </div>

                <div className="mt-4">
                  {recommendation.action.kind === 'route' && recommendation.action.href ? (
                    <Link to={recommendation.action.href} className="inline-flex">
                      <Button variant="secondary" className="min-w-[220px]">
                        {recommendation.actionLabel}
                        <ArrowRight size={16} />
                      </Button>
                    </Link>
                  ) : recommendation.action.kind === 'question' && recommendation.action.prompt ? (
                    <Button
                      variant="outline"
                      className="min-w-[220px]"
                      onClick={() => onAskMentor(recommendation.action.prompt!)}
                    >
                      {recommendation.actionLabel}
                    </Button>
                  ) : (
                    <Button variant="ghost" onClick={() => onAskMentor('Quero revisar meu plano atual de estudo com voce.')}>
                      Conversar com o mentor
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
