import { BookOpen, CheckCircle2, XCircle } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { QuizPergunta } from '@/types'
import type { QuizAnswerRecord } from '../types'

interface QuizFeedbackProps {
  resposta: QuizAnswerRecord | null
  pergunta: QuizPergunta | null
}

export function QuizFeedback({ resposta, pergunta }: QuizFeedbackProps) {
  if (!resposta || !pergunta) return null

  const correta = resposta.correta

  return (
    <div
      className={cn(
        'animate-slideUp rounded-2xl border px-5 py-4',
        correta ? 'border-[#86EFAC] bg-[#F0FDF4]' : 'border-[#FECACA] bg-[#FEF2F2]',
      )}
    >
      <p className={cn('mb-2 flex items-center gap-2 text-sm font-bold', correta ? 'text-[#16A34A]' : 'text-[#DC2626]')}>
        {correta ? <CheckCircle2 size={15} strokeWidth={1.5} /> : <XCircle size={15} strokeWidth={1.5} />}
        {correta ? 'Correto' : 'Incorreto'}
      </p>

      <p className="text-sm leading-7 text-[#6B7280]">
        {pergunta.explicacao}
      </p>

      {!correta && (
        <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-[#2E5FD4]">
          <BookOpen size={13} strokeWidth={1.5} />
          Este flashcard foi adicionado a sua revisao
        </p>
      )}
    </div>
  )
}
