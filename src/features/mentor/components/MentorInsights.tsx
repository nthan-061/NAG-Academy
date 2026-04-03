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

/** Label de seção em caixa alta — mesmo padrão dos cards de métricas e do restante da app */
function SectionEyebrow({ children }: { children: string }) {
  return (
    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-text-secondary">
      {children}
    </p>
  )
}

/** Cabeçalho de seção: eyebrow + h2 + subtítulo opcional — segue theme.tailwind.text */
function SectionHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="space-y-2">
      <SectionEyebrow>{eyebrow}</SectionEyebrow>
      <h2 className="text-2xl font-bold tracking-[-0.03em] text-foreground">
        {title}
      </h2>
      {subtitle && (
        <p className="max-w-[720px] text-sm leading-7 text-text-secondary">
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
    <div className="space-y-8">

      {/* ── Leitura atual ── */}
      <Card padding="lg">
        <SectionHeader
          eyebrow="Leitura atual"
          title="Leitura atual do mentor"
          subtitle={analysis?.summary ?? 'Carregando leitura comportamental do aluno.'}
        />

        <div className="mt-5 flex flex-wrap items-center gap-2.5">
          <Badge variant={analysis ? statusVariant[analysis.status] : 'default'}>
            {analysis?.status === 'critical'
              ? 'Estado critico'
              : analysis?.status === 'attention'
              ? 'Momento de atencao'
              : 'Bom momento'}
          </Badge>

          {profile?.evolutionTrend.direction === 'declining' && (
            <Badge variant="danger">
              <TrendingDown size={11} className="mr-1" />
              ritmo em queda
            </Badge>
          )}

          {!!analysis?.focusTopics.length && analysis.focusTopics.map((topic) => (
            <Badge key={topic} variant="info">{topic}</Badge>
          ))}
        </div>
      </Card>

      {/* ── Perfil + Contexto ── */}
      {profile && (
        <div className="grid gap-6 xl:grid-cols-2">

          {/* Pontos fortes e fracos */}
          <Card padding="lg">
            <SectionHeader
              eyebrow="Perfil"
              title="Leitura do perfil de aprendizado"
              subtitle={`${profile.userName}, o mentor estima seu nivel como ${profile.estimatedLevel.label} e percebe tendencia ${profile.evolutionTrend.direction} no seu desempenho recente.`}
            />

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {/* Pontos fortes */}
              <div className="rounded-xl border border-border bg-background-elevated p-5">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-success">
                  Pontos fortes
                </p>
                <ul className="mt-4 space-y-2.5">
                  {profile.strengths.map((item) => (
                    <li key={item} className="text-sm leading-7 text-foreground">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pontos fracos */}
              <div className="rounded-xl border border-border bg-background-elevated p-5">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-warning">
                  Pontos fracos
                </p>
                <ul className="mt-4 space-y-2.5">
                  {profile.weakPoints.map((item) => (
                    <li key={item} className="text-sm leading-7 text-foreground">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>

          {/* Contexto — sem bordas extras nos campos, só label + valor */}
          <Card padding="lg">
            <SectionHeader
              eyebrow="Contexto"
              title="Contexto conhecido do aluno"
              subtitle="O mentor orienta melhor quando entende objetivo, experiencia e contexto de uso."
            />

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {[
                ['Objetivo',       profile.mentorContext?.goal ?? 'Ainda nao informado ao mentor.'],
                ['Experiencia',    profile.mentorContext?.experience_level ?? 'Nao informado'],
                ['Contexto de uso', profile.mentorContext?.use_case ?? 'Nao informado'],
                ['Desafios',       profile.mentorContext?.declared_challenges?.join(', ') || 'Nenhum desafio declarado ainda.'],
              ].map(([label, value]) => (
                <div key={label} className="space-y-2">
                  <SectionEyebrow>{label}</SectionEyebrow>
                  <p className="text-sm leading-7 text-foreground">{value}</p>
                </div>
              ))}
            </div>
          </Card>

        </div>
      )}

      {/* ── Insights ── */}
      <Card padding="lg">
        <SectionHeader
          eyebrow="Insights"
          title="Insights personalizados"
          subtitle="Observacoes derivadas do uso real da plataforma."
        />

        <div className="mt-6 space-y-3">
          {insights.length > 0 ? insights.map((insight) => {
            const Icon = toneIcon[insight.tone]
            return (
              <div key={insight.id} className="rounded-xl border border-border bg-background-elevated p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 gap-4">
                    <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${toneAccent[insight.tone]}`}>
                      <Icon size={16} />
                    </div>

                    <div className="min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-semibold text-foreground">{insight.title}</h4>
                        <Badge variant={priorityVariant[insight.priority]}>{insight.priority}</Badge>
                      </div>
                      <p className="text-sm leading-7 text-text-secondary">{insight.message}</p>
                      {insight.actionHint && (
                        <p className="text-sm font-medium leading-7 text-foreground/80">{insight.actionHint}</p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onAcknowledgeInsight(insight.id)}
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-border hover:text-foreground"
                    aria-label="Dispensar insight"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>
            )
          }) : (
            <div className="rounded-xl border border-dashed border-border bg-background-elevated p-6">
              <p className="text-sm leading-7 text-text-secondary">
                Sem insights pendentes no momento. O mentor segue acompanhando seu comportamento para intervir quando fizer sentido.
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* ── Recomendações ── */}
      <Card padding="lg">
        <SectionHeader
          eyebrow="Proximos passos"
          title="Recomendacoes do mentor"
          subtitle="Acoes praticas para destravar progresso e consolidar aprendizado."
        />

        <div className="mt-6 space-y-3">
          {recommendations.map((recommendation) => (
            <div key={recommendation.id} className="rounded-xl border border-border bg-background-elevated p-5">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-sm font-semibold text-foreground">{recommendation.title}</h4>
                  <Badge variant={priorityVariant[recommendation.priority]}>{recommendation.priority}</Badge>
                </div>
                <p className="text-sm leading-7 text-text-secondary">{recommendation.message}</p>
              </div>

              <div className="mt-5">
                {recommendation.action.kind === 'route' && recommendation.action.href ? (
                  <Link to={recommendation.action.href} className="inline-flex">
                    <Button variant="secondary" size="sm">
                      {recommendation.actionLabel}
                      <ArrowRight size={14} />
                    </Button>
                  </Link>
                ) : recommendation.action.kind === 'question' && recommendation.action.prompt ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAskMentor(recommendation.action.prompt!)}
                  >
                    {recommendation.actionLabel}
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
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
