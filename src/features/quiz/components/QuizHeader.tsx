import { X } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface QuizHeaderProps {
  aulaTitulo: string
  indice: number
  totalPerguntas: number
  statusLabel: string
  progressPercent: number
  showProgress: boolean
  onExit: () => void
}

export function QuizHeader({
  aulaTitulo,
  indice,
  totalPerguntas,
  statusLabel,
  progressPercent,
  showProgress,
  onExit,
}: QuizHeaderProps) {
  return (
    <div className="sticky top-16 z-10 flex h-16 items-center gap-4 border-b border-[#E8ECF2] bg-white px-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] md:px-7">
      <Button type="button" variant="ghost" onClick={onExit} className="h-10 w-10 rounded-xl bg-[#F8FAFC] p-0 text-[#6B7280] hover:bg-[#EEF2F7]">
        <X size={20} strokeWidth={1.5} />
      </Button>

      <div className="flex flex-1 flex-col gap-1.5">
        <p className="text-xs font-semibold text-[#9CA3AF]">
          {statusLabel || `Pergunta ${indice + 1} de ${totalPerguntas}`}
        </p>

        {showProgress && (
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#E8ECF2]">
            <div
              className="h-full rounded-full bg-[#0D1B3E] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </div>

      <span className="hidden text-xs font-semibold text-[#9CA3AF] md:block">
        {aulaTitulo.slice(0, 36)}{aulaTitulo.length > 36 ? '...' : ''}
      </span>
    </div>
  )
}
