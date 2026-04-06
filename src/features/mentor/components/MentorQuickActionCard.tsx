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
        className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-secondary-soft px-5 text-xs font-semibold text-secondary transition-all duration-150 hover:bg-secondary hover:text-white active:scale-95"
      >
        {recommendation.actionLabel}
        <ArrowRight size={12} />
      </Link>
    ) : recommendation.action.kind === 'question' && recommendation.action.prompt ? (
      <Button
        size="sm"
        className="h-10 px-5 text-xs"
        onClick={() => onAskMentor(recommendation.action.prompt!)}
      >
        {recommendation.actionLabel}
      </Button>
    ) : (
      <Button
        size="sm"
        variant="outline"
        className="h-10 px-5 text-xs"
        onClick={() => onAskMentor(`Quero executar agora: ${recommendation.title}.`)}
      >
        Abrir no mentor
      </Button>
    )

  return (
    <div
      className={`flex flex-col gap-5 rounded-[20px] border bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-md lg:p-7 ${
        featured
          ? 'border-secondary/30 shadow-[0_12px_32px_rgba(37,99,235,0.12)]'
          : 'border-border shadow-[0_8px_24px_rgba(10,22,40,0.04)]'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          {featured && (
            <span className="inline-flex rounded-full bg-secondary-soft px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-secondary">
              Ação principal
            </span>
          )}
          <h3 className="text-sm font-semibold leading-snug text-foreground">
            {recommendation.title}
          </h3>
        </div>
        <span
          className={`mt-1 h-2 w-2 shrink-0 rounded-full ${priorityDot[recommendation.priority] ?? 'bg-border'}`}
        />
      </div>

      <p className="line-clamp-3 text-sm leading-relaxed text-text-secondary">
        {recommendation.message}
      </p>

      {action}
    </div>
  )
}
