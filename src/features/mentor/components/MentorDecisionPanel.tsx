import type { MentorRecommendation } from '../types'
import { MentorQuickActionCard } from './MentorQuickActionCard'

interface MentorDecisionPanelProps {
  recommendations: MentorRecommendation[]
  onAskMentor: (prompt: string) => void
}

export function MentorDecisionPanel({ recommendations, onAskMentor }: MentorDecisionPanelProps) {
  const items = recommendations.slice(0, 3)

  return (
    <div>
      {/* Section label — matches Chat section label exactly */}
      <p
        style={{
          fontSize: '13px',
          fontWeight: 600,
          color: '#6B7280',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          margin: '0 0 16px 0',
        }}
      >
        Outras ações
      </p>

      {items.length === 0 ? (
        <div
          style={{
            borderRadius: '12px',
            border: '1px dashed #E8ECF2',
            backgroundColor: '#FFFFFF',
            padding: '28px 24px',
          }}
        >
          <p style={{ fontSize: '13px', lineHeight: 1.75, color: '#9CA3AF', margin: 0 }}>
            Inicie a conversa com o mentor para revelar mais ações prioritárias.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
