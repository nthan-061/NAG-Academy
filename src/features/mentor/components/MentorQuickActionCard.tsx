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
        className="inline-flex h-11 w-fit items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-button transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-strong hover:brightness-110 hover:shadow-md active:scale-95"
      >
        {recommendation.actionLabel}
        <ArrowRight size={14} />
      </Link>
    ) : recommendation.action.kind === 'question' && recommendation.action.prompt ? (
      <Button
        size="sm"
        className="w-fit px-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:brightness-110 active:scale-95"
        onClick={() => onAskMentor(recommendation.action.prompt!)}
      >
        {recommendation.actionLabel}
      </Button>
    ) : (
      <Button
        size="sm"
        variant="outline"
        className="w-fit px-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:brightness-105 active:scale-95"
        onClick={() => onAskMentor(`Quero executar esta acao agora: ${recommendation.title}.`)}
      >
        Abrir no mentor
      </Button>
    )

  return (
    <Card padding="lg" className="flex h-full flex-col gap-7 rounded-[20px] border border-border bg-white p-7 shadow-[0_12px_32px_rgba(10,22,40,0.04)] transition-all duration-200 hover:-translate-y-1 hover:shadow-md lg:p-8">
      <div className="space-y-5">
        <h3 className="text-base font-semibold text-foreground">
          {recommendation.title}
        </h3>
        <p className="text-sm leading-relaxed text-text-secondary">
          {recommendation.message}
        </p>
      </div>

      <div className="mt-5 flex">
        {action}
      </div>
    </Card>
  )
}
