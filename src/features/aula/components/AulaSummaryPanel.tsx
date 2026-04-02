import { Badge } from '@/components/ui/Badge'
import type { Aula } from '@/types'

interface AulaSummaryPanelProps {
  aula: Aula
}

export function AulaSummaryPanel({ aula }: AulaSummaryPanelProps) {
  if (!aula.resumo && (!aula.topicos || aula.topicos.length === 0)) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-10 text-center text-sm text-[#9CA3AF]">
        Resumo gerado automaticamente apos o processamento da aula.
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-6">
      {aula.topicos && aula.topicos.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {aula.topicos.map((topico) => (
            <Badge key={topico} variant="info" className="normal-case tracking-normal">
              {topico}
            </Badge>
          ))}
        </div>
      )}

      {aula.resumo && (
        <p className="text-[15px] leading-8 text-[#4B5563]">
          {aula.resumo}
        </p>
      )}
    </div>
  )
}
