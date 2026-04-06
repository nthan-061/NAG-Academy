import { Brain, RefreshCcw } from 'lucide-react'
import { Badge, Button } from '@/components/ui'
import type { MentorPerformanceAnalysis } from '../types'

interface MentorHeaderProps {
  analysis: MentorPerformanceAnalysis | null
  onRefresh: () => void
  refreshing?: boolean
}

const statusConfig = {
  good: { variant: 'success' as const, label: 'Em boa evolução' },
  attention: { variant: 'warning' as const, label: 'Pede atenção' },
  critical: { variant: 'danger' as const, label: 'Risco alto' },
}

export function MentorHeader({ analysis, onRefresh, refreshing }: MentorHeaderProps) {
  const status = analysis?.status ?? 'attention'
  const config = statusConfig[status]

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary-soft text-secondary">
          <Brain size={16} />
        </div>
        <span className="text-[15px] font-semibold text-foreground">Mentor IA</span>
        <Badge variant={config.variant} className="min-h-0 py-0.5 px-2.5">{config.label}</Badge>
        <span className="hidden text-xs text-muted-foreground sm:block">· Atualizado agora</span>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        loading={refreshing}
        className="h-9 shrink-0 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95"
      >
        <RefreshCcw size={13} />
        Atualizar
      </Button>
    </div>
  )
}
