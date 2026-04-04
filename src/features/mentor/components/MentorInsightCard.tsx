import { AlertTriangle, CheckCircle2, Lightbulb, Target, X } from 'lucide-react'
import { Badge, Button, Card } from '@/components/ui'
import { cn } from '@/lib/cn'
import type { MentorInsight } from '../types'

interface MentorInsightCardProps {
  insight: MentorInsight
  impact: string
  onDismiss: (id: string) => void
}

const toneConfig = {
  encouragement: {
    icon: CheckCircle2,
    tone: 'bg-success-soft text-success',
    badge: 'success' as const,
  },
  focus: {
    icon: Target,
    tone: 'bg-secondary-soft text-secondary',
    badge: 'info' as const,
  },
  warning: {
    icon: AlertTriangle,
    tone: 'bg-danger-soft text-danger',
    badge: 'danger' as const,
  },
  opportunity: {
    icon: Lightbulb,
    tone: 'bg-warning-soft text-warning',
    badge: 'warning' as const,
  },
} as const

const priorityLabel = {
  low: 'Baixa prioridade',
  medium: 'Prioridade media',
  high: 'Prioridade alta',
} as const

export function MentorInsightCard({ insight, impact, onDismiss }: MentorInsightCardProps) {
  const config = toneConfig[insight.tone]
  const Icon = config.icon

  return (
    <Card padding="md" className="border border-border bg-surface/95">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 gap-4">
          <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl', config.tone)}>
            <Icon size={18} />
          </div>

          <div className="min-w-0 space-y-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={config.badge}>{priorityLabel[insight.priority]}</Badge>
                {insight.relatedTopic && (
                  <Badge variant="default">{insight.relatedTopic}</Badge>
                )}
              </div>
              <h3 className="text-base font-semibold text-foreground">
                {insight.title}
              </h3>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl bg-background-elevated p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  O que esta acontecendo
                </p>
                <p className="mt-2 text-sm leading-6 text-foreground">
                  {insight.message}
                </p>
              </div>

              <div className="rounded-2xl bg-background-elevated p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Por que isso importa
                </p>
                <p className="mt-2 text-sm leading-6 text-foreground">
                  {impact}
                </p>
              </div>

              <div className="rounded-2xl bg-background-elevated p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  O que fazer agora
                </p>
                <p className="mt-2 text-sm leading-6 text-foreground">
                  {insight.actionHint ?? 'Continue monitorando esse ponto e use a conversa com o mentor para detalhar o proximo passo.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="shrink-0 rounded-full px-3"
          onClick={() => onDismiss(insight.id)}
          aria-label="Dispensar insight"
        >
          <X size={14} />
        </Button>
      </div>
    </Card>
  )
}
