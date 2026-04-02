import { useEffect, useEffectEvent, useState } from 'react'
import { BookOpen, ChevronRight, Layers, Sparkles } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import type { QuizFinalizeResult } from '../types'
import { getQuizResultTitle } from '../utils'

interface QuizResultProps {
  aulaId: string
  result: QuizFinalizeResult
  onShowToast: () => void
}

export function QuizResult({ aulaId, result, onShowToast }: QuizResultProps) {
  const [score, setScore] = useState(0)
  const navigate = useNavigate()
  const triggerToast = useEffectEvent(onShowToast)

  useEffect(() => {
    triggerToast()

    const step = Math.max(1, Math.ceil(result.acertos / 24))
    let current = 0

    const interval = setInterval(() => {
      current = Math.min(current + step, result.acertos)
      setScore(current)

      if (current >= result.acertos) clearInterval(interval)
    }, 32)

    return () => clearInterval(interval)
  }, [result.acertos])

  const percentual = result.total > 0 ? Math.round((result.acertos / result.total) * 100) : 0
  const titulo = getQuizResultTitle(percentual)

  return (
    <div className="animate-slideUp flex w-full flex-col items-center gap-7 py-1 text-center">
      <div className="relative flex h-36 w-36 items-center justify-center rounded-full bg-[conic-gradient(#0D1B3E_var(--progress),#D9E1F0_0deg)] shadow-[0_18px_44px_rgba(13,27,62,0.14)]" style={{ ['--progress' as string]: `${percentual * 3.6}deg` }}>
        <div className="absolute inset-[-10px] rounded-full bg-[radial-gradient(circle,rgba(46,95,212,0.12)_0%,rgba(46,95,212,0)_70%)]" />
        <div className="relative z-10 flex h-[96px] w-[96px] flex-col items-center justify-center rounded-full bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
          <span className="text-[34px] font-extrabold leading-none text-[#1A1F2E]">{score}</span>
          <span className="mt-1 text-[13px] font-medium text-[#9CA3AF]">de {result.total}</span>
        </div>
      </div>

      <div className="flex max-w-[440px] flex-col gap-2">
        <Badge variant="info" className="mx-auto min-h-[30px] px-3.5 normal-case text-[11px] tracking-[0.04em]">
          Resultado Final
        </Badge>
        <h2 className="text-[32px] font-extrabold leading-[1.04] tracking-[-0.04em] text-[#1A1F2E]">
          {titulo}
        </h2>
        <p className="text-[16px] leading-[1.55] text-[#6B7280]">
          Voce acertou {result.acertos} de {result.total} questoes.
        </p>
      </div>

      <div className={`grid w-full gap-4 ${result.flashcardsCount > 0 ? 'max-w-[560px] grid-cols-1 md:grid-cols-2' : 'max-w-[280px] grid-cols-1'}`}>
        <div className="flex min-h-[132px] flex-col items-center justify-center gap-2 rounded-[20px] border border-[#FDE68A] bg-[linear-gradient(135deg,#FFF8DB_0%,#FFF0B5_100%)] px-5 py-5 shadow-[0_16px_30px_rgba(212,160,23,0.10)]">
          <Sparkles size={20} className="text-[#D97706]" />
          <span className="text-[32px] font-extrabold leading-none text-[#D4A017]">+{result.xpGanho}</span>
          <span className="text-[13px] font-bold text-[#B45309]">XP ganhos</span>
          <span className="text-[12px] leading-[1.45] text-[#B45309]/80">Recompensa pela sua performance</span>
        </div>

        {result.flashcardsCount > 0 && (
          <div className="flex min-h-[132px] flex-col items-center justify-center gap-2 rounded-[20px] border border-[#BFD1FF] bg-[linear-gradient(135deg,#EEF4FF_0%,#E4EEFF_100%)] px-5 py-5 shadow-[0_16px_30px_rgba(46,95,212,0.09)]">
            <Layers size={20} className="text-[#2E5FD4]" />
            <span className="text-[32px] font-extrabold leading-none text-[#2E5FD4]">{result.flashcardsCount}</span>
            <span className="text-[13px] font-bold text-[#2E5FD4]">Flashcards criados</span>
            <span className="text-[12px] leading-[1.45] text-[#2E5FD4]/80">Erros convertidos em revisao pratica</span>
          </div>
        )}
      </div>

      <div className="flex w-full max-w-[560px] flex-wrap items-stretch justify-center gap-3">
        {result.flashcardsCount > 0 && (
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/flashcards')}
            className="min-h-[56px] min-w-[220px] flex-1 rounded-[14px] border-[#2E5FD4] bg-[linear-gradient(180deg,#F7FAFF_0%,#EAF1FF_100%)] px-5 text-sm font-bold text-[#2E5FD4] shadow-[0_12px_26px_rgba(46,95,212,0.10)] hover:bg-[linear-gradient(180deg,#F2F7FF_0%,#E1EBFF_100%)]"
          >
            <Layers size={16} strokeWidth={1.5} />
            Revisar flashcards agora
          </Button>
        )}

        <Link to={`/aula/${aulaId}`} className="min-w-[220px] flex-1">
          <Button className="min-h-[56px] w-full rounded-[14px] bg-[linear-gradient(135deg,#16254F_0%,#0D1B3E_100%)] px-5 text-sm font-bold shadow-[0_18px_34px_rgba(13,27,62,0.22)]">
            <BookOpen size={16} strokeWidth={1.5} />
            Voltar para a aula
            <ChevronRight size={16} strokeWidth={1.5} />
          </Button>
        </Link>
      </div>
    </div>
  )
}
