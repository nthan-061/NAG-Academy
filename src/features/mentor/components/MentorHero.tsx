import { AlertTriangle, ArrowRight, CheckCircle2, Sparkles, Siren, TriangleAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge, Button, Card } from '@/components/ui'
import { MENTOR_STATUS_LABELS } from '../constants'
import type { MentorPerformanceAnalysis, MentorRecommendation, UserLearningProfile } from '../types'

interface MentorHeroProps {
  profile: UserLearningProfile | null
  analysis: MentorPerformanceAnalysis | null
  priorityRecommendation: MentorRecommendation | null
  onAskMentor: (prompt: string) => void
}

const statusConfig = {
  good: {
    badge: 'success' as const,
    icon: CheckCircle2,
    panel: 'from-success-soft via-surface to-surface',
    border: 'border-success/20',
    accent: 'text-success',
    label: 'Progresso',
  },
  attention: {
    badge: 'warning' as const,
    icon: AlertTriangle,
    panel: 'from-warning-soft via-surface to-surface',
    border: 'border-warning/20',
    accent: 'text-warning',
    label: 'Atencao',
  },
  critical: {
    badge: 'danger' as const,
    icon: Siren,
    panel: 'from-danger-soft via-surface to-surface',
    border: 'border-danger/20',
    accent: 'text-danger',
    label: 'Critico',
  },
} as const

function priorityRecommendationText(profile: UserLearningProfile, analysis: MentorPerformanceAnalysis) {
  if (analysis.status === 'good' && profile.nextSuggestedLesson) {
    return `Seu historico permite avancar com criterio para ${profile.nextSuggestedLesson.titulo}, mantendo revisao e validacao sob controle.`
  }

  return 'O mentor esta usando seus sinais recentes para equilibrar consolidacao, revisao e progresso sem sobrecarregar sua proxima decisao.'
}

function buildDiagnosis(profile: UserLearningProfile | null, analysis: MentorPerformanceAnalysis | null) {
  if (!profile || !analysis) {
    return {
      diagnosis: 'Estou consolidando sua leitura mais recente para definir sua proxima acao.',
      explanation: 'Assim que seu historico for processado, o mentor vai priorizar o que mais merece sua atencao agora.',
    }
  }

  const topTopic = profile.topicErrors[0]
  const lowLesson = profile.recentLowPerformanceLessons[0]
  const hasDrop = profile.consistency.recentDrop
  const backlog = profile.recentEngagement.pendingFlashcards

  if (analysis.status === 'critical' && topTopic) {
    return {
      diagnosis: `Seu desempenho recente caiu e ${topTopic.topic} virou o principal bloqueio do seu avanco.`,
      explanation: `Voce esta acumulando erros nesse tema${lowLesson ? ` e o pior resultado recente apareceu em ${lowLesson.lessonTitle}` : ''}. Antes de seguir, vale revisar a base e validar o entendimento em um ponto critico.`,
    }
  }

  if (hasDrop) {
    return {
      diagnosis: 'Seu ritmo perdeu consistencia e isso esta enfraquecendo a consolidacao do que voce ja estudou.',
      explanation: `Com ${profile.consistency.activeDaysLast7} dias ativos na ultima semana${backlog > 0 ? ` e ${backlog} revisoes pendentes` : ''}, o mentor recomenda reorganizar sua rotina antes de adicionar mais conteudo.`,
    }
  }

  if (topTopic) {
    return {
      diagnosis: `Seu maior atrito agora esta em ${topTopic.topic}, onde os erros continuam voltando.`,
      explanation: 'Resolver esse ponto primeiro tende a melhorar sua acuracia e reduzir retrabalho nas proximas sessoes.',
    }
  }

  return {
    diagnosis: analysis.summary,
    explanation: priorityRecommendationText(profile, analysis),
  }
}

export function MentorHero({
  profile,
  analysis,
  priorityRecommendation,
  onAskMentor,
}: MentorHeroProps) {
  const status = analysis?.status ?? 'attention'
  const config = statusConfig[status]
  const StatusIcon = config.icon
  const { diagnosis, explanation } = buildDiagnosis(profile, analysis)

  const primaryAction =
    priorityRecommendation?.action.kind === 'route' && priorityRecommendation.action.href ? (
      <Link
        to={priorityRecommendation.action.href}
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-[15px] font-semibold text-white shadow-button transition hover:bg-primary-strong"
      >
        {priorityRecommendation.actionLabel}
        <ArrowRight size={16} />
      </Link>
    ) : priorityRecommendation?.action.kind === 'question' && priorityRecommendation.action.prompt ? (
      <Button size="lg" onClick={() => onAskMentor(priorityRecommendation.action.prompt!)}>
        {priorityRecommendation.actionLabel}
      </Button>
    ) : (
      <Button
        size="lg"
        onClick={() => onAskMentor('Com base no meu momento atual, qual deve ser meu proximo passo agora?')}
      >
        Conversar com o mentor
      </Button>
    )

  return (
    <Card
      padding="lg"
      className={`overflow-hidden border bg-gradient-to-br ${config.panel} ${config.border} shadow-panel`}
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)]">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={config.badge} className="gap-1.5">
              <StatusIcon size={12} />
              {config.label}
            </Badge>
            <Badge variant="info" className="gap-1.5">
              <Sparkles size={12} />
              {MENTOR_STATUS_LABELS[status]}
            </Badge>
            {analysis?.focusTopics.slice(0, 2).map((topic) => (
              <Badge key={topic} variant="default">
                {topic}
              </Badge>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-secondary">
                Seu momento agora
              </p>
              <h1 className="mt-3 max-w-4xl text-4xl font-bold tracking-[-0.05em] text-foreground md:text-5xl">
                {diagnosis}
              </h1>
            </div>

            <p className="max-w-3xl text-base leading-8 text-text-secondary">
              {explanation}
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-border/80 bg-white/70 p-5 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Acao recomendada mais importante
            </p>
            <p className="mt-3 text-lg font-semibold text-foreground">
              {priorityRecommendation?.title ?? 'Abrir a conversa para o mentor definir sua proxima prioridade.'}
            </p>
            <p className="mt-2 text-sm leading-7 text-text-secondary">
              {priorityRecommendation?.message ?? 'Seus dados estao prontos. O proximo passo e transformar o diagnostico em uma acao pratica.'}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              {primaryAction}
              <Button
                variant="outline"
                size="lg"
                onClick={() => onAskMentor('Quero que voce me diga o que devo fazer agora e por qual motivo.')}
              >
                Entender a prioridade
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 self-stretch">
          <div className="rounded-[1.5rem] border border-border/80 bg-white/78 p-5 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-white ${config.accent}`}>
                <TriangleAlert size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Diagnostico principal
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {analysis?.centralProblems[0] ?? analysis?.summary ?? 'Acompanhando seus sinais mais recentes.'}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-border/15 bg-primary-deep p-6 text-white shadow-card">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/70">
              Leitura rapida do sistema
            </p>
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-3xl font-bold tracking-[-0.04em]">
                  {analysis ? Math.round(analysis.confidence * 100) : 0}%
                </p>
                <p className="text-sm leading-6 text-white/70">
                  de confianca no diagnostico atual com base no seu historico recente.
                </p>
              </div>

              <div className="space-y-2 text-sm leading-6 text-white/78">
                {(analysis?.pedagogicalAlerts.slice(0, 2) ?? ['Sem alertas adicionais no momento.']).map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/6 px-4 py-3">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
