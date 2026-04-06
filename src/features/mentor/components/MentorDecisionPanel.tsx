import type { MentorRecommendation } from '../types'
import { MentorQuickActionCard } from './MentorQuickActionCard'

interface MentorDecisionPanelProps {
  recommendations: MentorRecommendation[]
  onAskMentor: (prompt: string) => void
}

export function MentorDecisionPanel({ recommendations, onAskMentor }: MentorDecisionPanelProps) {
  const items = recommendations.slice(0, 3)

  return (
    <div className="flex flex-col gap-5">
      {/* Section label — matches Chat section label style exactly */}
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B7280]">
        Outras ações
      </p>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#E8ECF2] bg-white p-7 shadow-sm">
          <p className="text-[13px] leading-[1.75] text-[#9CA3AF]">
            Inicie a conversa com o mentor para revelar mais ações prioritárias.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {items.map((recommendation) => (
            <MentorQuickActionCard
              key={recommendation.id}
              recommendation={recommendation}
              onAskMentor={onAskMentor}
            />
          ))}
        </div>
      )}
    </div>
  )
}
