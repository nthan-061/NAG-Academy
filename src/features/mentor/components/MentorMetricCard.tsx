import type { LucideIcon } from 'lucide-react'
import { AlertTriangle, ArrowDownRight, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Badge, Card } from '@/components/ui'
import { cn } from '@/lib/cn'

export type MetricStatus = 'good' | 'attention' | 'critical'

interface MentorMetricCardProps {
  label: string
  value: string
  interpretation: string
  detail?: string
  status: MetricStatus
  icon: LucideIcon
}

const metricStatusMap = {
  good: {
    badge: 'success' as const,
    icon: CheckCircle2,
    tone: 'border-success/20 bg-success-soft/70',
    iconTone: 'bg-success-soft text-success',
    label: 'Bom',
  },
  attention: {
    badge: 'warning' as const,
    icon: ArrowRight,
    tone: 'border-warning/20 bg-warning-soft/60',
    iconTone: 'bg-warning-soft text-warning',
    label: 'Atencao',
  },
  critical: {
    badge: 'danger' as const,
    icon: AlertTriangle,
    tone: 'border-danger/20 bg-danger-soft/70',
    iconTone: 'bg-danger-soft text-danger',
    label: 'Critico',
  },
} as const

export function MentorMetricCard({
  label,
  value,
  interpretation,
  detail,
  status,
  icon: Icon,
}: MentorMetricCardProps) {
  const config = metricStatusMap[status]
  const StatusIcon = config.icon

  return (
    <Card
      padding="md"
      className={cn(
        'flex h-full flex-col gap-4 border',
        config.tone,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {label}
          </p>
          <p className="text-[2rem] font-bold leading-none text-foreground">
            {value}
          </p>
        </div>

        <div className={cn('flex h-11 w-11 items-center justify-center rounded-2xl', config.iconTone)}>
          <Icon size={20} />
        </div>
      </div>

      <div className="space-y-3">
        <Badge variant={config.badge} className="gap-1.5">
          <StatusIcon size={12} />
          {config.label}
        </Badge>
        <p className="text-sm font-semibold leading-6 text-foreground">
          {interpretation}
        </p>
        {detail && (
          <div className="flex items-start gap-2 text-xs leading-6 text-text-secondary">
            <ArrowDownRight size={14} className="mt-1 shrink-0" />
            <span>{detail}</span>
          </div>
        )}
      </div>
    </Card>
  )
}
