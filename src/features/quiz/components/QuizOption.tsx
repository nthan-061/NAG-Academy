import { CheckCircle2, XCircle } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { QuizStatus } from '../types'

interface QuizOptionProps {
  texto: string
  index: number
  status: QuizStatus
  selecionada: boolean
  correta: boolean
  onSelect: () => void
}

const LETTERS = ['A', 'B', 'C', 'D']

export function QuizOption({
  texto,
  index,
  status,
  selecionada,
  correta,
  onSelect,
}: QuizOptionProps) {
  const confirmado = status === 'confirmado'

  const stateClass =
    confirmado && selecionada && correta
      ? 'border-[#16A34A] bg-[#F0FDF4] text-[#16A34A]'
      : confirmado && selecionada && !correta
        ? 'border-[#DC2626] bg-[#FEF2F2] text-[#DC2626]'
        : confirmado && correta
          ? 'border-[#16A34A] bg-[#F0FDF4] text-[#16A34A]'
          : !confirmado && selecionada
            ? 'border-[#2E5FD4] bg-[#EBF0FA] text-[#1A1F2E]'
            : 'border-[#E8ECF2] bg-white text-[#1A1F2E]'

  const letterClass =
    selecionada || (confirmado && correta)
      ? confirmado && !correta && selecionada
        ? 'bg-[#DC2626] text-white'
        : confirmado && correta
          ? 'bg-[#16A34A] text-white'
          : 'bg-[#2E5FD4] text-white'
      : 'bg-[#E8ECF2] text-[#9CA3AF]'

  return (
    <button
      type="button"
      onClick={confirmado ? undefined : onSelect}
      disabled={confirmado}
      className={cn(
        'flex w-full items-center gap-3 rounded-2xl border px-5 py-4 text-left text-sm leading-[1.65] transition',
        stateClass,
        !confirmado && 'hover:border-[#C9D7F7] hover:shadow-[0_12px_28px_rgba(46,95,212,0.08)]',
      )}
    >
      <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold', letterClass)}>
        {LETTERS[index]}
      </span>
      <span className="flex-1">{texto}</span>
      {confirmado && correta && <CheckCircle2 size={18} strokeWidth={1.5} className="shrink-0 text-[#16A34A]" />}
      {confirmado && selecionada && !correta && <XCircle size={18} strokeWidth={1.5} className="shrink-0 text-[#DC2626]" />}
    </button>
  )
}
