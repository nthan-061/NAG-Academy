import { Link } from 'react-router-dom'
import { AlertTriangle, ArrowRight, CheckCircle2, Lightbulb, Target, TrendingDown, X } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { MentorInsight, MentorPerformanceAnalysis, MentorRecommendation, UserLearningProfile } from '../types'

const toneIcon = {
  encouragement: CheckCircle2,
  focus: Target,
  warning: AlertTriangle,
  opportunity: Lightbulb,
} as const

const toneAccent = {
  encouragement: 'bg-success-soft text-success border-success/18',
  focus: 'bg-secondary-soft text-secondary border-secondary/16',
  warning: 'bg-warning-soft text-warning border-warning/18',
  opportunity: 'bg-accent text-warning border-warning/18',
} as const

const priorityVariant = {
  low: 'default',
  medium: 'warning',
  high: 'danger',
} as const

const statusVariant = {
  good: 'success',
  attention: 'warning',
  critical: 'danger',
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
      <Card className="overflow-hidden border-border/70 p-0 shadow-[0_18px_44px_rgba(10,22,40,0.07)]">
        <div className="grid gap-0 lg:grid-cols-[1.2fr,0.8fr]">
          <div className="border-b border-border/70 px-6 py-6 lg:border-b-0 lg:border-r">
            <div className="flex flex-wrap items-start gap-3">
              <Badge variant={analysis ? statusVariant[analysis.status] : 'default'}>
                {analysis?.status === 'critical' ? 'Estado critico' : analysis?.status === 'attention' ? 'Momento de atencao' : 'Bom momento'}
              </Badge>
              {profile?.evolutionTrend.direction === 'declining' && (
                <div className="inline-flex items-center gap-1 rounded-full bg-danger-soft px-3 py-1 text-xs font-semibold text-danger">
                  <TrendingDown size={12} />
                  ritmo em queda
                </div>
              )}
            </div>

            <h2 className="mt-4 text-[2rem] font-bold tracking-[-0.04em] text-foreground">
              Leitura atual do mentor
            </h2>
            <p className="mt-3 max-w-[680px] text-[1rem] leading-7 text-text-secondary">
              {analysis?.summary ?? 'Carregando leitura comportamental do aluno.'}
            </p>

            {!!analysis?.focusTopics.length && (
              <div className="mt-5 flex flex-wrap gap-2">
                {analysis.focusTopics.map((topic) => (
                  <Badge key={topic} variant="info">{topic}</Badge>
                ))}
              </div>
            )}
          </div>

          {profile && (
            <div className="grid gap-px bg-border/70 p-px sm:grid-cols-2 lg:grid-cols-2">
              {[
                ['Nivel estimado', profile.estimatedLevel.label],
                ['Consistencia', `${profile.consistency.consistencyScore}%`],
                ['Acuracia recente', `${Math.round(profile.studyVelocity.recentAccuracy * 100)}%`],
                ['Flashcards pendentes', String(profile.recentEngagement.pendingFlashcards)],
              ].map(([label, value]) => (
                <div key={label} className="bg-surface px-5 py-5">
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-text-secondary">{label}</p>
                  <p className="mt-3 text-[1.7rem] font-bold capitalize tracking-[-0.04em] text-foreground">{value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {profile && (
        <div className="grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
          <Card className="border-border/70 p-6 shadow-[0_16px_38px_rgba(10,22,40,0.06)]">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-success" />
              <h3 className="text-[1.4rem] font-bold tracking-[-0.03em] text-foreground">
                Leitura do perfil de aprendizado
              </h3>
            </div>

            <p className="mt-4 text-[1rem] leading-7 text-text-secondary">
              <span className="font-semibold text-foreground">{profile.userName}</span>, o mentor estima seu nivel como
              {' '}<span className="capitalize font-semibold text-foreground">{profile.estimatedLevel.label}</span> e percebe
              {' '}tendencia <span className="capitalize font-semibold text-foreground">{profile.evolutionTrend.direction}</span>
              {' '}no seu desempenho recente.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-[1.4rem] border border-success/15 bg-success-soft/70 p-5">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-success">Pontos fortes</p>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-foreground">
                  {profile.strengths.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-success" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-[1.4rem] border border-warning/18 bg-warning-soft/75 p-5">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-warning">Pontos fracos</p>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-foreground">
                  {profile.weakPoints.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-warning" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>

          <Card className="border-border/70 p-6 shadow-[0_16px_38px_rgba(10,22,40,0.06)]">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-text-secondary">
              Contexto conhecido do aluno
            </p>
            <h3 className="mt-3 text-[1.35rem] font-bold tracking-[-0.03em] text-foreground">
              O mentor aprende melhor quando entende seu objetivo real.
            </h3>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-background-elevated px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-secondary">Objetivo</p>
                <p className="mt-2 text-sm leading-6 text-foreground">{profile.mentorContext?.goal ?? 'Ainda nao informado ao mentor.'}</p>
              </div>
              <div className="rounded-2xl bg-background-elevated px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-secondary">Experiencia</p>
                <p className="mt-2 text-sm capitalize leading-6 text-foreground">{profile.mentorContext?.experience_level ?? 'Nao informado'}</p>
              </div>
              <div className="rounded-2xl bg-background-elevated px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-secondary">Contexto de uso</p>
                <p className="mt-2 text-sm capitalize leading-6 text-foreground">{profile.mentorContext?.use_case ?? 'Nao informado'}</p>
              </div>
              <div className="rounded-2xl bg-background-elevated px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-secondary">Desafios</p>
                <p className="mt-2 text-sm leading-6 text-foreground">{profile.mentorContext?.declared_challenges?.join(', ') || 'Nenhum desafio declarado ainda.'}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      <Card className="border-border/70 p-6 shadow-[0_16px_38px_rgba(10,22,40,0.06)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-text-secondary">Insights personalizados</p>
            <h3 className="mt-2 text-[1.45rem] font-bold tracking-[-0.03em] text-foreground">Observacoes derivadas do seu comportamento real</h3>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          {insights.length > 0 ? insights.map((insight) => {
            const Icon = toneIcon[insight.tone]

            return (
              <div
                key={insight.id}
                className="rounded-[1.5rem] border border-border bg-[linear-gradient(180deg,#ffffff_0%,#fbfcff_100%)] p-5 shadow-[0_12px_30px_rgba(10,22,40,0.05)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 gap-4">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${toneAccent[insight.tone]}`}>
                      <Icon size={18} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-[1.12rem] font-semibold leading-6 text-foreground">{insight.title}</h4>
                        <Badge variant={priorityVariant[insight.priority]}>{insight.priority}</Badge>
                      </div>

                      <p className="mt-3 text-[0.97rem] leading-7 text-text-secondary">
                        {insight.message}
                      </p>

                      {insight.actionHint && (
                        <p className="mt-3 text-sm font-medium leading-6 text-foreground/82">
                          {insight.actionHint}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onAcknowledgeInsight(insight.id)}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-background-elevated hover:text-foreground"
                    aria-label="Dispensar insight"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            )
          }) : (
            <div className="rounded-[1.4rem] border border-dashed border-border bg-background-elevated px-5 py-6">
              <p className="text-sm leading-6 text-text-secondary">
                Sem insights pendentes no momento. O mentor segue acompanhando seu comportamento para intervir quando fizer sentido.
              </p>
            </div>
          )}
        </div>
      </Card>

      <Card className="border-border/70 p-6 shadow-[0_16px_38px_rgba(10,22,40,0.06)]">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-text-secondary">Proximos passos recomendados</p>
        <h3 className="mt-2 text-[1.45rem] font-bold tracking-[-0.03em] text-foreground">
          Acoes praticas para destravar progresso e consolidar aprendizado
        </h3>

        <div className="mt-6 grid gap-4">
          {recommendations.map((recommendation) => (
            <div
              key={recommendation.id}
              className="rounded-[1.45rem] border border-border bg-background-elevated/75 px-5 py-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-[1.08rem] font-semibold leading-6 text-foreground">{recommendation.title}</h4>
                    <Badge variant={priorityVariant[recommendation.priority]}>{recommendation.priority}</Badge>
                  </div>
                  <p className="mt-3 text-[0.97rem] leading-7 text-text-secondary">{recommendation.message}</p>
                </div>
              </div>

              <div className="mt-5">
                {recommendation.action.kind === 'route' && recommendation.action.href ? (
                  <Link to={recommendation.action.href} className="inline-flex">
                    <Button variant="secondary" className="min-w-[220px] rounded-[1rem]">
                      {recommendation.actionLabel}
                      <ArrowRight size={16} />
                    </Button>
                  </Link>
                ) : recommendation.action.kind === 'question' && recommendation.action.prompt ? (
                  <Button
                    variant="outline"
                    className="min-w-[220px] rounded-[1rem]"
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
  )
}
