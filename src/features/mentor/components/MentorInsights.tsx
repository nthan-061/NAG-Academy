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

function SectionHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="border-b border-border/80 px-6 py-5">
      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-text-secondary">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-[1.7rem] font-bold tracking-[-0.03em] text-foreground">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-2 text-sm leading-7 text-text-secondary">
          {subtitle}
        </p>
      )}
    </div>
  )
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
      <Card className="overflow-hidden border-border/80 p-0 shadow-[0_8px_24px_rgba(10,22,40,0.06)]">
        <SectionHeader
          eyebrow="Leitura atual"
          title="Leitura atual do mentor"
          subtitle={analysis?.summary ?? 'Carregando leitura comportamental do aluno.'}
        />

        <div className="px-6 py-5">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant={analysis ? statusVariant[analysis.status] : 'default'}>
              {analysis?.status === 'critical' ? 'Estado critico' : analysis?.status === 'attention' ? 'Momento de atencao' : 'Bom momento'}
            </Badge>
            {profile?.evolutionTrend.direction === 'declining' && (
              <div className="inline-flex items-center gap-1 rounded-full bg-danger-soft px-3 py-1.5 text-xs font-semibold text-danger">
                <TrendingDown size={12} />
                ritmo em queda
              </div>
            )}
            {!!analysis?.focusTopics.length && analysis.focusTopics.map((topic) => (
              <Badge key={topic} variant="info">{topic}</Badge>
            ))}
          </div>
        </div>
      </Card>

      {profile && (
        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="overflow-hidden border-border/80 p-0 shadow-[0_8px_24px_rgba(10,22,40,0.06)]">
            <SectionHeader
              eyebrow="Perfil"
              title="Leitura do perfil de aprendizado"
              subtitle={`${profile.userName}, o mentor estima seu nivel como ${profile.estimatedLevel.label} e percebe tendencia ${profile.evolutionTrend.direction} no seu desempenho recente.`}
            />

            <div className="grid gap-px bg-border/70 p-px md:grid-cols-2">
              <div className="bg-surface px-6 py-5">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-success">Pontos fortes</p>
                <ul className="mt-4 space-y-3 text-sm leading-7 text-foreground">
                  {profile.strengths.map((item) => (
                    <li key={item} className="flex gap-2.5">
                      <span className="mt-[10px] h-1.5 w-1.5 rounded-full bg-success" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-surface px-6 py-5">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-warning">Pontos fracos</p>
                <ul className="mt-4 space-y-3 text-sm leading-7 text-foreground">
                  {profile.weakPoints.map((item) => (
                    <li key={item} className="flex gap-2.5">
                      <span className="mt-[10px] h-1.5 w-1.5 rounded-full bg-warning" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden border-border/80 p-0 shadow-[0_8px_24px_rgba(10,22,40,0.06)]">
            <SectionHeader
              eyebrow="Contexto"
              title="Contexto conhecido do aluno"
              subtitle="O mentor orienta melhor quando entende objetivo, experiencia e contexto de uso."
            />

            <div className="grid gap-px bg-border/70 p-px sm:grid-cols-2">
              {[
                ['Objetivo', profile.mentorContext?.goal ?? 'Ainda nao informado ao mentor.'],
                ['Experiencia', profile.mentorContext?.experience_level ?? 'Nao informado'],
                ['Contexto de uso', profile.mentorContext?.use_case ?? 'Nao informado'],
                ['Desafios', profile.mentorContext?.declared_challenges?.join(', ') || 'Nenhum desafio declarado ainda.'],
              ].map(([label, value]) => (
                <div key={label} className="bg-surface px-6 py-5">
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-text-secondary">
                    {label}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-foreground">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      <Card className="overflow-hidden border-border/80 p-0 shadow-[0_8px_24px_rgba(10,22,40,0.06)]">
        <SectionHeader
          eyebrow="Insights"
          title="Insights personalizados"
          subtitle="Observacoes derivadas do uso real da plataforma."
        />

        <div className="flex flex-col gap-4 px-6 py-5">
          {insights.length > 0 ? insights.map((insight) => {
            const Icon = toneIcon[insight.tone]

            return (
              <div key={insight.id} className="rounded-[1rem] border border-border bg-background-elevated/65 px-5 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 gap-4">
                    <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${toneAccent[insight.tone]}`}>
                      <Icon size={18} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-[1.05rem] font-semibold leading-7 text-foreground">{insight.title}</h4>
                        <Badge variant={priorityVariant[insight.priority]}>{insight.priority}</Badge>
                      </div>
                      <p className="mt-2 text-sm leading-7 text-text-secondary">{insight.message}</p>
                      {insight.actionHint && (
                        <p className="mt-2 text-sm font-medium leading-7 text-foreground/80">{insight.actionHint}</p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onAcknowledgeInsight(insight.id)}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-white hover:text-foreground"
                    aria-label="Dispensar insight"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            )
          }) : (
            <div className="rounded-[1rem] border border-dashed border-border bg-background-elevated px-5 py-6">
              <p className="text-sm leading-7 text-text-secondary">
                Sem insights pendentes no momento. O mentor segue acompanhando seu comportamento para intervir quando fizer sentido.
              </p>
            </div>
          )}
        </div>
      </Card>

      <Card className="overflow-hidden border-border/80 p-0 shadow-[0_8px_24px_rgba(10,22,40,0.06)]">
        <SectionHeader
          eyebrow="Proximos passos"
          title="Recomendacoes do mentor"
          subtitle="Acoes praticas para destravar progresso e consolidar aprendizado."
        />

        <div className="flex flex-col gap-4 px-6 py-5">
          {recommendations.map((recommendation) => (
            <div key={recommendation.id} className="rounded-[1rem] border border-border bg-background-elevated/65 px-5 py-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-[1.05rem] font-semibold leading-7 text-foreground">{recommendation.title}</h4>
                    <Badge variant={priorityVariant[recommendation.priority]}>{recommendation.priority}</Badge>
                  </div>
                  <p className="mt-2 text-sm leading-7 text-text-secondary">{recommendation.message}</p>
                </div>
              </div>

              <div className="mt-5">
                {recommendation.action.kind === 'route' && recommendation.action.href ? (
                  <Link to={recommendation.action.href} className="inline-flex">
                    <Button variant="secondary" className="rounded-[0.9rem] px-5">
                      {recommendation.actionLabel}
                      <ArrowRight size={16} />
                    </Button>
                  </Link>
                ) : recommendation.action.kind === 'question' && recommendation.action.prompt ? (
                  <Button
                    variant="outline"
                    className="rounded-[0.9rem] px-5"
                    onClick={() => onAskMentor(recommendation.action.prompt!)}
                  >
                    {recommendation.actionLabel}
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    className="rounded-[0.9rem] px-5"
                    onClick={() => onAskMentor('Quero revisar meu plano atual de estudo com voce.')}
                  >
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
