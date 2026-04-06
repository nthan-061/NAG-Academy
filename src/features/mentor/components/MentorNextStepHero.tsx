import { AlertTriangle, ArrowRight, TrendingUp, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui'
import type { MentorPerformanceAnalysis, MentorRecommendation, UserLearningProfile } from '../types'

interface MentorNextStepHeroProps {
  primaryRecommendation: MentorRecommendation | null
  analysis: MentorPerformanceAnalysis | null
  profile: UserLearningProfile | null
  onAskMentor: (prompt: string) => void
}

function UrgencyChip({ score }: { score: number }) {
  if (score >= 7) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-white/90">
        <AlertTriangle size={11} />
        Urgente agora
      </span>
    )
  }
  if (score >= 4) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-white/90">
        <Zap size={11} />
        Alta prioridade
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-white/90">
      <TrendingUp size={11} />
      Próximo passo
    </span>
  )
}

export function MentorNextStepHero({
  primaryRecommendation,
  analysis,
  profile,
  onAskMentor,
}: MentorNextStepHeroProps) {
  const title = primaryRecommendation?.title ?? 'Conversar com o mentor para definir o foco'
  const message =
    primaryRecommendation?.message ??
    analysis?.summary ??
    'O mentor está pronto para analisar seu momento e definir o próximo passo com precisão.'
  const urgencyScore = analysis?.urgencyScore ?? 5
  const topic = analysis?.focusTopics[0] ?? profile?.topicErrors[0]?.topic

  const mentorPrompt =
    primaryRecommendation?.action.prompt ??
    `Explica por que "${title}" é meu próximo passo mais importante agora.`

  const primaryActionNode =
    primaryRecommendation?.action.kind === 'route' && primaryRecommendation.action.href ? (
      <Link
        to={primaryRecommendation.action.href}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-[#1a2f6e] shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl active:scale-95 sm:w-auto"
      >
        {primaryRecommendation.actionLabel}
        <ArrowRight size={15} />
      </Link>
    ) : (
      <Button
        size="lg"
        className="w-full justify-center bg-white py-3.5 text-sm font-bold text-[#1a2f6e] shadow-lg hover:-translate-y-0.5 hover:bg-white/95 hover:shadow-xl active:scale-95 sm:w-auto"
        onClick={() =>
          onAskMentor(
            primaryRecommendation?.action.prompt ?? `Quero executar agora: ${title}.`,
          )
        }
      >
        {primaryRecommendation?.actionLabel ?? 'Definir próximo passo'}
        <ArrowRight size={15} />
      </Button>
    )

  return (
    <div className="relative overflow-hidden rounded-[20px] bg-[linear-gradient(135deg,#1a2f6e_0%,#2563eb_60%,#3b82f6_100%)] shadow-[0_24px_56px_rgba(37,99,235,0.28)]">
      {/* Background decoration */}
      <div
        className="pointer-events-none absolute right-0 top-0 h-full w-1/2 opacity-[0.07]"
        style={{ background: 'radial-gradient(circle at 75% 30%, white 0%, transparent 65%)' }}
      />

      {/* Zone 1 — Eyebrow + Title (full width, top) */}
      <div className="relative border-b border-white/10 px-8 pb-7 pt-10 lg:px-12 lg:pb-8 lg:pt-12">
        <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white/50">
          ⚡ Seu próximo passo agora
        </p>
        <h2 className="max-w-3xl text-[22px] font-bold leading-[1.2] tracking-[-0.02em] text-white md:text-[28px] lg:text-[32px]">
          {title}
        </h2>
      </div>

      {/* Zone 2 — Description + Context (left) | CTAs (right) */}
      <div className="relative flex flex-col gap-8 px-8 pb-10 pt-8 lg:flex-row lg:items-center lg:justify-between lg:px-12 lg:pb-12 lg:pt-8">
        {/* Left: description + chips */}
        <div className="max-w-2xl space-y-6">
          <p className="text-[15px] leading-[1.75] text-white/70">
            {message}
          </p>
          <div className="flex flex-wrap items-center gap-2.5">
            <UrgencyChip score={urgencyScore} />
            {topic && (
              <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-[11px] font-semibold text-white/75">
                {topic}
              </span>
            )}
          </div>
        </div>

        {/* Right: CTA stack — vertically stacked for clarity */}
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col lg:items-stretch xl:flex-row xl:items-center">
          {primaryActionNode}
          <Button
            variant="ghost"
            size="lg"
            className="w-full justify-center border border-white/20 py-3.5 text-sm font-semibold text-white hover:bg-white/10 hover:text-white active:scale-95 sm:w-auto lg:w-auto"
            onClick={() => onAskMentor(mentorPrompt)}
          >
            Perguntar ao Mentor
          </Button>
        </div>
      </div>
    </div>
  )
}
