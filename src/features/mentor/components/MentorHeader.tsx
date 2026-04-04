import { ArrowRight, Gauge, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui'
import type { MentorPerformanceAnalysis, MentorRecommendation, UserLearningProfile } from '../types'

interface MentorHeaderProps {
  profile: UserLearningProfile | null
  analysis: MentorPerformanceAnalysis | null
  primaryRecommendation: MentorRecommendation | null
}

const statusBadge = {
  good: { variant: 'success' as const, label: 'Progresso' },
  attention: { variant: 'warning' as const, label: 'Atencao' },
  critical: { variant: 'danger' as const, label: 'Risco alto' },
}

export function MentorHeader({ profile, analysis, primaryRecommendation }: MentorHeaderProps) {
  const status = analysis?.status ?? 'attention'
  const badge = statusBadge[status]
  const mainProblem =
    analysis?.centralProblems[0]
    ?? profile?.topicErrors[0]?.topic
    ?? 'Sem gargalo principal definido ainda.'
  const focus =
    analysis?.focusTopics[0]
    ?? profile?.topicErrors[0]?.topic
    ?? 'Abrir a conversa para definir o foco.'
  const nextAction = primaryRecommendation?.title ?? 'Abrir conversa com o mentor'
  const progressLabel =
    analysis?.status === 'critical'
      ? 'Pedindo intervencao imediata'
      : analysis?.status === 'attention'
        ? 'Momento de reorganizar o estudo'
        : 'Base suficiente para avancar'

  return (
    <section className="grid w-full gap-6 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start">
      <div className="max-w-[700px] space-y-6">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary">
            Mentor IA
          </p>
          <h1 className="text-[32px] font-bold leading-[1.02] tracking-[-0.05em] text-foreground md:text-[40px]">
            Converse e aja no proximo passo certo.
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3.5">
          <Badge variant={badge.variant}>{badge.label}</Badge>
          <Badge variant="default">Problema: {mainProblem}</Badge>
          <Badge variant="info">Foco: {focus}</Badge>
        </div>
      </div>

      <div className="rounded-[16px] border border-border bg-[linear-gradient(180deg,#fcfdff_0%,#f8faff_100%)] p-6 shadow-[0_18px_40px_rgba(10,22,40,0.06)]">
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary-soft text-secondary">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Painel do momento
              </p>
              <p className="text-sm font-semibold text-foreground">
                Seu proximo passo em um bloco
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Maior gargalo atual
              </p>
              <p className="text-sm leading-relaxed text-foreground">
                {mainProblem}
              </p>
            </div>

            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Proxima acao recomendada
              </p>
              <div className="inline-flex w-fit items-center gap-2 rounded-full bg-secondary-soft px-3 py-2 text-sm font-semibold text-secondary">
                <ArrowRight size={14} />
                {nextAction}
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Status
              </p>
              <div className="inline-flex w-fit items-center gap-2 rounded-full bg-background-elevated px-3 py-2 text-sm font-medium text-foreground">
                <Gauge size={14} />
                {progressLabel}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
