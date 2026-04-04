import { Activity, BookOpenCheck, Brain, Goal, Target, TrendingDown } from 'lucide-react'
import { Badge, Button, Card } from '@/components/ui'
import { MENTOR_PRIORITY_ORDER, MENTOR_STATUS_LABELS } from '../constants'
import type { MentorInsight, MentorPerformanceAnalysis, MentorRecommendation, UserLearningProfile } from '../types'
import { MentorInsightCard } from './MentorInsightCard'
import { MentorMetricCard, type MetricStatus } from './MentorMetricCard'
import { MentorRecommendationCard } from './MentorRecommendationCard'

interface MentorInsightsProps {
  profile: UserLearningProfile | null
  analysis: MentorPerformanceAnalysis | null
  insights: MentorInsight[]
  recommendations: MentorRecommendation[]
  onAcknowledgeInsight: (id: string) => void
  onAskMentor: (prompt: string) => void
}

interface InterpretedMetric {
  label: string
  value: string
  interpretation: string
  detail?: string
  status: MetricStatus
  icon: typeof Activity
}

const insightImpacts: Record<string, string> = {
  'topic-errors-primary': 'Se esse tema seguir instavel, cada novo conteudo apoiado nele tende a ficar mais confuso e exigir retrabalho.',
  'consistency-drop': 'Quando o ritmo cai, o custo para retomar sobe e o mentor passa a gastar mais energia com recuperacao do que com progresso.',
  'flashcards-backlog': 'A fila de revisao atrasada aumenta a chance de esquecer justamente o que mais precisa de reforco.',
  'dominated-topic': 'Reconhecer um tema consolidado evita estudo repetitivo e abre espaco para desafios mais inteligentes.',
  'missing-goal': 'Sem contexto claro, as recomendacoes ficam menos especificas e o mentor perde precisao nas prioridades.',
  'positive-momentum': 'Manter esse equilibrio ajuda voce a avancar sem perder a retencao do que ja foi construindo.',
}

export function MentorInsights({
  profile,
  analysis,
  insights,
  recommendations,
  onAcknowledgeInsight,
  onAskMentor,
}: MentorInsightsProps) {
  const sortedInsights = [...insights].sort(
    (a, b) => MENTOR_PRIORITY_ORDER[b.priority] - MENTOR_PRIORITY_ORDER[a.priority],
  )

  const secondaryRecommendations = [...recommendations]
    .sort((a, b) => MENTOR_PRIORITY_ORDER[b.priority] - MENTOR_PRIORITY_ORDER[a.priority])
    .slice(1)

  const metrics: InterpretedMetric[] = profile && analysis ? [
    {
      label: 'Consistencia',
      value: `${profile.consistency.consistencyScore}%`,
      interpretation:
        profile.consistency.consistencyScore < 25
          ? 'Muito abaixo do ideal para consolidar memoria.'
          : profile.consistency.consistencyScore < 55
            ? 'Oscilando mais do que o recomendado.'
            : 'Boa base para manter ritmo e evolucao.',
      detail: `${profile.consistency.activeDaysLast7} dias ativos na ultima semana.`,
      status:
        profile.consistency.consistencyScore < 25
          ? 'critical'
          : profile.consistency.consistencyScore < 55
            ? 'attention'
            : 'good',
      icon: Activity,
    },
    {
      label: 'Acuracia recente',
      value: `${Math.round(profile.studyVelocity.recentAccuracy * 100)}%`,
      interpretation:
        profile.studyVelocity.recentAccuracy < 0.35
          ? 'Precisa reforco imediato antes de avancar.'
          : profile.studyVelocity.recentAccuracy < 0.65
            ? 'Ainda ha atrito em topicos importantes.'
            : 'Mostra assimilacao suficiente para seguir.',
      detail:
        analysis.status === 'critical'
          ? 'Seu historico mostra risco de acumular lacunas.'
          : analysis.status === 'attention'
            ? 'Vale validar os temas em risco antes de subir o nivel.'
            : 'O mentor identifica um momento de consolidacao positiva.',
      status:
        profile.studyVelocity.recentAccuracy < 0.35
          ? 'critical'
          : profile.studyVelocity.recentAccuracy < 0.65
            ? 'attention'
            : 'good',
      icon: Target,
    },
    {
      label: 'Flashcards pendentes',
      value: String(profile.recentEngagement.pendingFlashcards),
      interpretation:
        profile.recentEngagement.pendingFlashcards >= 8
          ? 'Revisao acumulada alta.'
          : profile.recentEngagement.pendingFlashcards > 0
            ? 'Fila controlavel, mas pedindo atencao.'
            : 'Revisao em dia no momento.',
      detail: `${profile.recentEngagement.overdueFlashcards} em atraso e ${profile.recentEngagement.totalFlashcards} no total.`,
      status:
        profile.recentEngagement.pendingFlashcards >= 8
          ? 'critical'
          : profile.recentEngagement.pendingFlashcards > 0
            ? 'attention'
            : 'good',
      icon: BookOpenCheck,
    },
    {
      label: 'Leitura do mentor',
      value: MENTOR_STATUS_LABELS[analysis.status],
      interpretation:
        analysis.status === 'critical'
          ? 'Seu momento pede intervencao mais direta.'
          : analysis.status === 'attention'
            ? 'O progresso existe, mas esta disperso.'
            : 'O sistema percebe base para avancar com criterio.',
      detail: `${Math.round(analysis.confidence * 100)}% de confianca no diagnostico atual.`,
      status: analysis.status,
      icon: Brain,
    },
  ] : []

  return (
    <div className="flex flex-col gap-10">
      <section className="space-y-4">
        <div className="max-w-3xl space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary">
            Leitura resumida
          </p>
          <h2 className="text-2xl font-bold tracking-[-0.03em] text-foreground">
            Indicadores com interpretacao
          </h2>
          <p className="text-sm leading-7 text-text-secondary">
            Numeros so entram quando ajudam voce a decidir o que fazer agora.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <MentorMetricCard key={metric.label} {...metric} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="max-w-3xl space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary">
            O que esta travando seu avanco
          </p>
          <h2 className="text-2xl font-bold tracking-[-0.03em] text-foreground">
            Insights criticos
          </h2>
          <p className="text-sm leading-7 text-text-secondary">
            O mentor resume apenas os sinais que realmente mudam sua proxima decisao.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {sortedInsights.length > 0 ? sortedInsights.map((insight) => (
            <MentorInsightCard
              key={insight.id}
              insight={insight}
              impact={insightImpacts[insight.id] ?? 'Esse ponto altera a qualidade das proximas sessoes e merece decisao explicita agora.'}
              onDismiss={onAcknowledgeInsight}
            />
          )) : (
            <Card padding="md" className="border border-dashed border-border bg-background-elevated">
              <p className="text-sm leading-7 text-text-secondary">
                Nenhum alerta forte no momento. O mentor continua monitorando seu comportamento para intervir quando surgir um sinal relevante.
              </p>
            </Card>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div className="max-w-3xl space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary">
            Sequencia recomendada
          </p>
          <h2 className="text-2xl font-bold tracking-[-0.03em] text-foreground">
            Recomendacoes detalhadas
          </h2>
          <p className="text-sm leading-7 text-text-secondary">
            Depois da prioridade principal, estas sao as proximas acoes que mantem o plano coerente.
          </p>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          {secondaryRecommendations.length > 0 ? secondaryRecommendations.map((recommendation) => (
            <MentorRecommendationCard
              key={recommendation.id}
              recommendation={recommendation}
              onAskMentor={onAskMentor}
            />
          )) : (
            <Card padding="md" className="xl:col-span-3">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="max-w-2xl">
                  <h3 className="text-base font-semibold text-foreground">
                    O plano ja esta enxuto
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-text-secondary">
                    Neste momento, faz mais sentido executar a prioridade principal e usar a conversa com o mentor para adaptar o restante do plano em tempo real.
                  </p>
                </div>

                <Button
                  variant="outline"
                  onClick={() => onAskMentor('Quero transformar a prioridade principal em um plano de estudo curto para hoje.')}
                >
                  Montar plano com o mentor
                </Button>
              </div>
            </Card>
          )}
        </div>
      </section>

      {profile && (
        <section className="space-y-4">
          <div className="max-w-3xl space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary">
              Perfil e contexto
            </p>
            <h2 className="text-2xl font-bold tracking-[-0.03em] text-foreground">
              Informacoes que deixam o mentor mais preciso
            </h2>
            <p className="text-sm leading-7 text-text-secondary">
              Esse bloco fica por ultimo para apoiar a decisao, sem competir com a prioridade imediata.
            </p>
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
            <Card padding="lg" className="space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="info">{profile.estimatedLevel.label}</Badge>
                {profile.evolutionTrend.direction === 'declining' && (
                  <Badge variant="danger" className="gap-1.5">
                    <TrendingDown size={12} />
                    Tendencia de queda
                  </Badge>
                )}
                <Badge variant="default">
                  {profile.studyMaturity.replace('_', ' ')}
                </Badge>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[1.25rem] bg-success-soft/65 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-success">
                    O que ja sustenta seu progresso
                  </p>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-foreground">
                    {profile.strengths.slice(0, 4).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-[1.25rem] bg-warning-soft/65 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-warning">
                    O que ainda pede reforco
                  </p>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-foreground">
                    {profile.weakPoints.slice(0, 4).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>

            <Card padding="lg" className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary-soft text-secondary">
                  <Goal size={18} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    Contexto informado ao mentor
                  </h3>
                  <p className="text-sm leading-6 text-text-secondary">
                    Quando seu objetivo esta claro, o mentor reduz generalidades e aumenta a qualidade das recomendacoes.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  ['Objetivo', profile.mentorContext?.goal, 'Voce ainda nao definiu seu objetivo. Definir isso melhora a precisao das recomendacoes.'],
                  ['Experiencia', profile.mentorContext?.experience_level, 'Seu nivel de experiencia ainda nao foi informado ao mentor.'],
                  ['Contexto de uso', profile.mentorContext?.use_case, 'Informar como voce aplica o conteudo ajuda o mentor a ajustar profundidade e exemplos.'],
                  ['Desafios', profile.mentorContext?.declared_challenges?.join(', '), 'Seus desafios atuais ainda nao foram declarados.'],
                ].map(([label, value, emptyMessage]) => {
                  const filled = Boolean(value)
                  return (
                    <div
                      key={label}
                      className={`rounded-2xl border p-4 ${filled ? 'border-border bg-background-elevated' : 'border-warning/20 bg-warning-soft/55'}`}
                    >
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        {label}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-foreground">
                        {filled ? value : emptyMessage}
                      </p>
                    </div>
                  )
                })}
              </div>

              <Button
                variant="secondary"
                fullWidth
                onClick={() => onAskMentor('Quero preencher meu objetivo, minha experiencia e meu contexto para melhorar suas recomendacoes.')}
              >
                Atualizar contexto com o mentor
              </Button>
            </Card>
          </div>
        </section>
      )}
    </div>
  )
}
