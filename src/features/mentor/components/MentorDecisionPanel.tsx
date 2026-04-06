import type { MentorRecommendation } from '../types'
import { MentorQuickActionCard } from './MentorQuickActionCard'

interface MentorDecisionPanelProps {
  recommendations: MentorRecommendation[]
  onAskMentor: (prompt: string) => void
}

export function MentorDecisionPanel({ recommendations, onAskMentor }: MentorDecisionPanelProps) {
  const items = recommendations.slice(0, 3)

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Outras ações
      </p>

      {items.length === 0 ? (
        <div className="rounded-[16px] border border-dashed border-border bg-surface p-6">
          <p className="text-sm leading-relaxed text-text-secondary">
            Inicie a conversa com o mentor para revelar mais ações prioritárias.
          </p>
        </div>
      ) : (
        items.map((recommendation) => (
          <MentorQuickActionCard
            key={recommendation.id}
            recommendation={recommendation}
            onAskMentor={onAskMentor}
          />
        ))
      )}
    </div>
  )
}
