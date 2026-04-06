import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui'
import type { MentorRecommendation } from '../types'

interface MentorQuickActionCardProps {
  recommendation: MentorRecommendation
  featured?: boolean
  onAskMentor: (prompt: string) => void
}

const priorityConfig: Record<string, { dot: string; label: string }> = {
  high:   { dot: 'bg-danger',  label: 'Urgente' },
  medium: { dot: 'bg-warning', label: 'Relevante' },
  low:    { dot: 'bg-border',  label: 'Sugerido' },
}

export function MentorQuickActionCard({
  recommendation,
  featured = false,
  onAskMentor,
}: MentorQuickActionCardProps) {
  const priority = priorityConfig[recommendation.priority] ?? priorityConfig.low

  const action =
    recommendation.action.kind === 'route' && recommendation.action.href ? (
      <Link
        to={recommendation.action.href}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-secondary-soft px-5 py-3 text-[13px] font-semibold text-secondary transition-all duration-150 hover:bg-secondary hover:text-white active:scale-95"
      >
        {recommendation.actionLabel}
        <ArrowRight size={13} />
      </Link>
    ) : recommendation.action.kind === 'question' && recommendation.action.prompt ? (
      <Button
        size="sm"
        fullWidth
        className="justify-center py-3 text-[13px]"
        onClick={() => onAskMentor(recommendation.action.prompt!)}
      >
        {recommendation.actionLabel}
      </Button>
    ) : (
      <Button
        size="sm"
        variant="outline"
        fullWidth
        className="justify-center py-3 text-[13px]"
        onClick={() => onAskMentor(`Quero executar agora: ${recommendation.title}.`)}
      >
        Abrir no mentor
      </Button>
    )

  return (
    <div
      className={`flex flex-col rounded-2xl border bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${
        featured
          ? 'border-secondary/25 shadow-[0_8px_28px_rgba(37,99,235,0.10)]'
          : 'border-border shadow-[0_4px_16px_rgba(10,22,40,0.05)]'
      }`}
    >
      {/* Header — label + title */}
      <div className="px-6 pb-4 pt-6">
        <div className="mb-3 flex items-center gap-2">
          <span className={`h-2 w-2 shrink-0 rounded-full ${priority.dot}`} />
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {featured ? 'Ação principal' : priority.label}
          </span>
        </div>
        <h3 className="text-[14px] font-semibold leading-snug text-foreground">
          {recommendation.title}
        </h3>
      </div>

      {/* Body — description */}
      <div className="px-6 pb-6">
        <p className="text-[13px] leading-[1.75] text-text-secondary">
          {recommendation.message}
        </p>
      </div>

      {/* Footer — CTA */}
      <div className="mt-auto border-t border-border/60 px-6 pb-6 pt-5">
        {action}
      </div>
    </div>
  )
}
