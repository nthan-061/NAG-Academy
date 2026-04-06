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
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-secondary-soft text-secondary">
          <Brain size={15} />
        </div>
        <span className="text-sm font-semibold text-foreground">Mentor IA</span>
        <Badge variant={config.variant}>{config.label}</Badge>
        <span className="hidden text-xs text-muted-foreground sm:block">· Atualizado agora</span>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        loading={refreshing}
        className="shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:brightness-105 active:scale-95"
      >
        <RefreshCcw size={13} />
        Atualizar
      </Button>
    </div>
  )
}
