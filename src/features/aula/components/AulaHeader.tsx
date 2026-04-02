import { CheckCircle2, ChevronLeft, ChevronRight, Circle, BookOpen } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { AulaPageData } from '../types'

interface AulaHeaderProps {
  data: AulaPageData
  userId: string | null
  togglingProgress: boolean
  onToggleAssistida: () => Promise<void>
}

export function AulaHeader({ data, userId, togglingProgress, onToggleAssistida }: AulaHeaderProps) {
  const { aula, trilha, modulo, aulaAnterior, proximaAula, progresso } = data
  const assistida = progresso?.assistida ?? false
  const quizCompletado = progresso?.quiz_completado ?? false

  return (
    <Card className="border border-[#E8ECF2] bg-white/90 backdrop-blur-[14px]" padding="0">
      <div className="flex flex-col gap-6 p-6 md:p-8">
        {trilha && modulo && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#9CA3AF]">
            <Link to="/trilhas" className="text-[#2E5FD4] hover:opacity-80">Trilhas</Link>
            <ChevronRight size={12} />
            <Link to={`/trilhas/${trilha.id}`} className="text-[#2E5FD4] hover:opacity-80">{trilha.titulo}</Link>
            <ChevronRight size={12} />
            <span>{modulo.titulo}</span>
          </div>
        )}

        <h1 className="text-[clamp(26px,3vw,34px)] font-extrabold leading-[1.18] tracking-[-0.03em] text-[#1A1F2E]">
          {aula.titulo}
        </h1>

        <div className="flex flex-wrap items-center gap-3 border-t border-[#E8ECF2] pt-5">
          {aulaAnterior && (
            <Link to={`/aula/${aulaAnterior.id}`}>
              <Button variant="outline" className="rounded-xl text-[13px] text-[#6B7280]">
                <ChevronLeft size={14} strokeWidth={1.5} />
                Anterior
              </Button>
            </Link>
          )}

          {userId && (
            <Button
              type="button"
              variant={assistida ? 'secondary' : 'outline'}
              onClick={() => { void onToggleAssistida() }}
              disabled={togglingProgress}
              className={assistida ? 'rounded-xl border-[#BBF7D0] bg-[#F0FDF4] text-[#16A34A] hover:bg-[#DCFCE7]' : 'rounded-xl text-[#6B7280]'}
            >
              {assistida ? <CheckCircle2 size={14} strokeWidth={1.5} /> : <Circle size={14} strokeWidth={1.5} />}
              {assistida ? 'Assistida' : 'Marcar como assistida'}
            </Button>
          )}

          {proximaAula && (
            <Link to={`/aula/${proximaAula.id}`} className="ml-auto">
              <Button className="rounded-xl text-[13px]">
                Proxima
                <ChevronRight size={14} strokeWidth={1.5} />
              </Button>
            </Link>
          )}
        </div>

        {assistida && (
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[rgba(46,95,212,0.32)] bg-[linear-gradient(135deg,#EDF3FF_0%,#F8FBFF_100%)] px-5 py-5">
            <div>
              <p className="text-base font-bold text-[#0D1B3E]">
                {quizCompletado ? 'Quiz concluido' : 'Quiz disponivel'}
              </p>
              <p className="mt-1 text-sm text-[#6B7280]">
                {quizCompletado
                  ? `Voce acertou ${progresso?.acertos ?? 0} de ${progresso?.total_perguntas ?? 0}, clique para refazer`
                  : 'Teste seu conhecimento sobre esta aula'}
              </p>
            </div>

            <Link to={`/aula/${aula.id}/quiz`}>
              <Button className="rounded-xl px-5">
                <BookOpen size={16} strokeWidth={1.5} />
                {quizCompletado ? 'Refazer quiz' : 'Fazer quiz'}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </Card>
  )
}
