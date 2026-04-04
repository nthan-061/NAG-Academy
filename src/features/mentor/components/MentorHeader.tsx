import { Badge } from '@/components/ui'
import type { MentorPerformanceAnalysis, UserLearningProfile } from '../types'

interface MentorHeaderProps {
  profile: UserLearningProfile | null
  analysis: MentorPerformanceAnalysis | null
}

const statusBadge = {
  good: { variant: 'success' as const, label: 'Progresso' },
  attention: { variant: 'warning' as const, label: 'Atencao' },
  critical: { variant: 'danger' as const, label: 'Risco alto' },
}

export function MentorHeader({ profile, analysis }: MentorHeaderProps) {
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

  return (
    <section className="space-y-3">
      <div className="max-w-3xl space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary">
          Mentor IA
        </p>
        <h1 className="text-3xl font-bold tracking-[-0.04em] text-foreground md:text-4xl">
          Converse e aja no proximo passo certo.
        </h1>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={badge.variant}>{badge.label}</Badge>
        <Badge variant="default">Problema: {mainProblem}</Badge>
        <Badge variant="info">Foco: {focus}</Badge>
      </div>
    </section>
  )
}
