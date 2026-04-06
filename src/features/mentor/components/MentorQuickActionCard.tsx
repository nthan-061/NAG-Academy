import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui'
import type { MentorRecommendation } from '../types'

interface MentorQuickActionCardProps {
  recommendation: MentorRecommendation
  onAskMentor: (prompt: string) => void
}

const priorityDot: Record<string, string> = {
  high: 'bg-danger',
  medium: 'bg-warning',
  low: 'bg-border',
}

export function MentorQuickActionCard({ recommendation, onAskMentor }: MentorQuickActionCardProps) {
  const action =
    recommendation.action.kind === 'route' && recommendation.action.href ? (
      <Link
        to={recommendation.action.href}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-secondary-soft px-4 text-xs font-semibold text-secondary transition-all duration-150 hover:bg-secondary hover:text-white active:scale-95"
      >
        {recommendation.actionLabel}
        <ArrowRight size={12} />
      </Link>
    ) : recommendation.action.kind === 'question' && recommendation.action.prompt ? (
      <Button
        size="sm"
        className="h-9 px-4 text-xs"
        onClick={() => onAskMentor(recommendation.action.prompt!)}
      >
        {recommendation.actionLabel}
      </Button>
    ) : (
      <Button
        size="sm"
        variant="outline"
        className="h-9 px-4 text-xs"
        onClick={() => onAskMentor(`Quero executar agora: ${recommendation.title}.`)}
      >
        Abrir no mentor
      </Button>
    )

  return (
    <div className="flex flex-col gap-4 rounded-[16px] border border-border bg-white p-5 shadow-[0_8px_24px_rgba(10,22,40,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold leading-snug text-foreground">
          {recommendation.title}
        </h3>
        <span
          className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${priorityDot[recommendation.priority] ?? 'bg-border'}`}
        />
      </div>

      <p className="line-clamp-2 text-xs leading-relaxed text-text-secondary">
        {recommendation.message}
      </p>

      {action}
    </div>
  )
}
