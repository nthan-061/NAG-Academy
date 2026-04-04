import type { MentorRecommendation } from '../types'
import { MentorRecommendationCard } from './MentorRecommendationCard'

interface MentorPriorityActionProps {
  recommendation: MentorRecommendation | null
  onAskMentor: (prompt: string) => void
}

export function MentorPriorityAction({
  recommendation,
  onAskMentor,
}: MentorPriorityActionProps) {
  if (!recommendation) return null

  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary">
          Prioridade do mentor
        </p>
        <div className="max-w-3xl">
          <h2 className="text-2xl font-bold tracking-[-0.03em] text-foreground">
            O proximo passo com maior impacto
          </h2>
          <p className="mt-2 text-sm leading-7 text-text-secondary">
            Em vez de distribuir sua atencao, o mentor destaca primeiro a acao com mais efeito sobre seu aprendizado imediato.
          </p>
        </div>
      </div>

      <MentorRecommendationCard
        recommendation={recommendation}
        featured
        onAskMentor={onAskMentor}
      />
    </section>
  )
}
