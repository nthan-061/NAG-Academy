import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui'
import type { MentorRecommendation } from '../types'

interface MentorQuickActionCardProps {
  recommendation: MentorRecommendation
  featured?: boolean
  onAskMentor: (prompt: string) => void
}

const priorityDot: Record<string, string> = {
  high: 'bg-danger',
  medium: 'bg-warning',
  low: 'bg-border',
}

export function MentorQuickActionCard({
  recommendation,
  featured = false,
  onAskMentor,
}: MentorQuickActionCardProps) {
  const action =
    recommendation.action.kind === 'route' && recommendation.action.href ? (
      <Link
        to={recommendation.action.href}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-secondary-soft px-5 py-3 text-sm font-semibold text-secondary transition-all duration-150 hover:bg-secondary hover:text-white active:scale-95"
      >
        {recommendation.actionLabel}
        <ArrowRight size={13} />
      </Link>
    ) : recommendation.action.kind === 'question' && recommendation.action.prompt ? (
      <Button
        size="sm"
        fullWidth
        className="justify-center py-3 text-sm"
        onClick={() => onAskMentor(recommendation.action.prompt!)}
      >
        {recommendation.actionLabel}
      </Button>
    ) : (
      <Button
        size="sm"
        variant="outline"
        fullWidth
        className="justify-center py-3 text-sm"
        onClick={() => onAskMentor(`Quero executar agora: ${recommendation.title}.`)}
      >
        Abrir no mentor
      </Button>
    )

  return (
    <div
      className={`flex flex-col gap-6 rounded-[20px] border bg-white p-7 transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${
        featured
          ? 'border-secondary/30 shadow-[0_12px_32px_rgba(37,99,235,0.12)]'
          : 'border-border shadow-[0_8px_24px_rgba(10,22,40,0.04)]'
      }`}
    >
      {/* Header: label (if featured) + title + priority dot */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-2">
          {featured && (
            <span className="inline-flex rounded-full bg-secondary-soft px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-secondary">
              Ação principal
            </span>
          )}
          <h3 className="text-[15px] font-semibold leading-snug text-foreground">
            {recommendation.title}
          </h3>
        </div>
        <span
          className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${priorityDot[recommendation.priority] ?? 'bg-border'}`}
        />
      </div>

      {/* Description — natural text, no clamp on narrow sidebar */}
      <p className="text-sm leading-[1.75] text-text-secondary">
        {recommendation.message}
      </p>

      {/* CTA — full-width for proper breathing in narrow column */}
      {action}
    </div>
  )
}
