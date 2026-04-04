import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button, Card } from '@/components/ui'
import type { MentorRecommendation } from '../types'

interface MentorQuickActionCardProps {
  recommendation: MentorRecommendation
  onAskMentor: (prompt: string) => void
}

export function MentorQuickActionCard({
  recommendation,
  onAskMentor,
}: MentorQuickActionCardProps) {
  const action =
    recommendation.action.kind === 'route' && recommendation.action.href ? (
      <Link
        to={recommendation.action.href}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-strong"
      >
        {recommendation.actionLabel}
        <ArrowRight size={14} />
      </Link>
    ) : recommendation.action.kind === 'question' && recommendation.action.prompt ? (
      <Button size="sm" onClick={() => onAskMentor(recommendation.action.prompt!)}>
        {recommendation.actionLabel}
      </Button>
    ) : (
      <Button
        size="sm"
        variant="outline"
        onClick={() => onAskMentor(`Quero executar esta acao agora: ${recommendation.title}.`)}
      >
        Abrir no mentor
      </Button>
    )

  return (
    <Card padding="md" className="flex h-full flex-col gap-4">
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-foreground">
          {recommendation.title}
        </h3>
        <p className="text-sm leading-6 text-text-secondary">
          {recommendation.message}
        </p>
      </div>

      <div className="mt-auto">
        {action}
      </div>
    </Card>
  )
}
