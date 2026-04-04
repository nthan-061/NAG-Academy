import { ArrowRight, Bot, Compass, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge, Button, Card } from '@/components/ui'
import { cn } from '@/lib/cn'
import type { MentorRecommendation } from '../types'

interface MentorRecommendationCardProps {
  recommendation: MentorRecommendation
  featured?: boolean
  onAskMentor: (prompt: string) => void
}

const priorityConfig = {
  low: {
    badge: 'default' as const,
    border: 'border-border',
    accent: 'bg-background-elevated text-foreground',
    label: 'Baixa',
  },
  medium: {
    badge: 'warning' as const,
    border: 'border-warning/20',
    accent: 'bg-warning-soft text-warning',
    label: 'Media',
  },
  high: {
    badge: 'danger' as const,
    border: 'border-danger/20',
    accent: 'bg-danger-soft text-danger',
    label: 'Alta',
  },
} as const

export function MentorRecommendationCard({
  recommendation,
  featured = false,
  onAskMentor,
}: MentorRecommendationCardProps) {
  const config = priorityConfig[recommendation.priority]
  const actionClass = featured ? 'min-h-12 rounded-lg px-6 text-[15px]' : 'h-11 rounded-md px-5 text-sm'

  const actionButton =
    recommendation.action.kind === 'route' && recommendation.action.href ? (
      <Link
        to={recommendation.action.href}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-semibold transition',
          'bg-primary text-white shadow-button hover:bg-primary-strong',
          actionClass,
        )}
      >
        {recommendation.actionLabel}
        <ArrowRight size={16} />
      </Link>
    ) : recommendation.action.kind === 'question' && recommendation.action.prompt ? (
      <Button
        size={featured ? 'lg' : 'md'}
        onClick={() => onAskMentor(recommendation.action.prompt!)}
      >
        {recommendation.actionLabel}
      </Button>
    ) : (
      <Button
        variant="outline"
        size={featured ? 'lg' : 'md'}
        onClick={() => onAskMentor('Quero transformar essa recomendacao em um plano pratico para hoje.')}
      >
        Conversar com o mentor
      </Button>
    )

  return (
    <Card
      padding={featured ? 'lg' : 'md'}
      className={cn(
        'border bg-surface/95',
        config.border,
        featured && 'shadow-panel',
      )}
    >
      <div className="flex h-full flex-col gap-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={config.badge}>Prioridade {config.label}</Badge>
          <span className={cn('inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold', config.accent)}>
            {featured ? <Sparkles size={12} /> : <Compass size={12} />}
            {featured ? 'Recomendacao principal' : 'Proximo passo'}
          </span>
        </div>

        <div className="space-y-2">
          <h3 className={cn('font-semibold text-foreground', featured ? 'text-2xl leading-8' : 'text-base')}>
            {recommendation.title}
          </h3>
          <p className="text-sm leading-7 text-text-secondary">
            {recommendation.message}
          </p>
        </div>

        <div className="rounded-2xl bg-background-elevated p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Como isso ajuda agora
          </p>
          <p className="mt-2 text-sm leading-6 text-foreground">
            {featured
              ? 'Esta acao foi destacada porque tem o maior potencial de destravar seu progresso imediato com o menor atrito.'
              : 'Use esta recomendacao como sequencia da prioridade principal, sem competir com o que precisa ser resolvido primeiro.'}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 text-xs text-text-secondary">
            <Bot size={14} />
            O mentor ja usou seu historico para definir esta ordem.
          </div>
          {actionButton}
        </div>
      </div>
    </Card>
  )
}
