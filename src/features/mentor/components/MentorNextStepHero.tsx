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
      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-white/90">
        <AlertTriangle size={11} />
        Urgente agora
      </span>
    )
  }
  if (score >= 4) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-white/90">
        <Zap size={11} />
        Alta prioridade
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-white/90">
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

  const primaryAction =
    primaryRecommendation?.action.kind === 'route' && primaryRecommendation.action.href ? (
      <Link
        to={primaryRecommendation.action.href}
        className="inline-flex h-12 items-center gap-2 rounded-xl bg-white px-7 text-sm font-bold text-[#1a2f6e] shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl active:scale-95"
      >
        {primaryRecommendation.actionLabel}
        <ArrowRight size={15} />
      </Link>
    ) : (
      <Button
        size="lg"
        className="h-12 bg-white px-7 text-sm font-bold text-[#1a2f6e] shadow-lg hover:-translate-y-0.5 hover:bg-white/95 hover:shadow-xl active:scale-95"
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
    <div className="relative overflow-hidden rounded-[20px] bg-[linear-gradient(135deg,#1a2f6e_0%,#2563eb_60%,#3b82f6_100%)] px-8 py-8 shadow-[0_24px_56px_rgba(37,99,235,0.28)] lg:px-10 lg:py-10">
      <div
        className="pointer-events-none absolute right-0 top-0 h-full w-1/2 opacity-[0.07]"
        style={{ background: 'radial-gradient(circle at 75% 30%, white 0%, transparent 65%)' }}
      />

      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        {/* Left: context + urgency */}
        <div className="max-w-2xl space-y-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/55">
            ⚡ Seu próximo passo agora
          </p>

          <h2 className="text-[22px] font-bold leading-[1.1] tracking-[-0.03em] text-white md:text-[28px]">
            {title}
          </h2>

          <p className="max-w-xl text-sm leading-relaxed text-white/70 md:text-[15px]">
            {message}
          </p>

          <div className="flex flex-wrap items-center gap-2.5">
            <UrgencyChip score={urgencyScore} />
            {topic && (
              <span className="inline-flex items-center rounded-full bg-white/10 px-3.5 py-2 text-[11px] font-semibold text-white/75">
                {topic}
              </span>
            )}
          </div>
        </div>

        {/* Right: CTAs */}
        <div className="flex shrink-0 flex-wrap items-center gap-3">
          {primaryAction}
          <Button
            variant="ghost"
            size="lg"
            className="h-12 border border-white/20 px-6 text-sm font-semibold text-white hover:bg-white/10 hover:text-white active:scale-95"
            onClick={() => onAskMentor(mentorPrompt)}
          >
            Perguntar ao Mentor
          </Button>
        </div>
      </div>
    </div>
  )
}
