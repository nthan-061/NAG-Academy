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
      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white/90">
        <AlertTriangle size={10} />
        Urgente agora
      </span>
    )
  }
  if (score >= 4) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white/90">
        <Zap size={10} />
        Alta prioridade
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white/90">
      <TrendingUp size={10} />
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
        className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-[14px] font-bold text-[#1a2f6e] shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
      >
        {primaryRecommendation.actionLabel}
        <ArrowRight size={14} />
      </Link>
    ) : (
      <Button
        size="md"
        className="bg-white px-6 py-3 text-[14px] font-bold text-[#1a2f6e] shadow-md hover:-translate-y-0.5 hover:bg-white/95 hover:shadow-lg active:scale-95"
        onClick={() =>
          onAskMentor(
            primaryRecommendation?.action.prompt ?? `Quero executar agora: ${title}.`,
          )
        }
      >
        {primaryRecommendation?.actionLabel ?? 'Definir próximo passo'}
        <ArrowRight size={14} />
      </Button>
    )

  return (
    <div className="relative overflow-hidden rounded-[16px] bg-[linear-gradient(140deg,#0f1f52_0%,#1d4ed8_55%,#3b82f6_100%)] shadow-[0_16px_48px_rgba(29,78,216,0.30)]">

      {/* Decorative glow — top right */}
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-[360px] w-[360px] rounded-full opacity-[0.08]"
        style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)' }}
      />

      {/* ── Zone 1: Content ──────────────────────────────────────────
          Padding calibrated to real usable widths:
          - lg (736px usable): px-6 → 688px content. Title max 580px = 84% width ✓
          - xl (992px usable): px-8 → 928px content. Title max 640px = 69% width ✓
      */}
      <div className="relative px-6 pb-8 pt-10 lg:px-8 lg:pb-9 lg:pt-11 xl:px-10 xl:pb-10 xl:pt-12">

        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-white/45">
          ⚡ Seu próximo passo agora
        </p>

        {/* Title — responsive, never fills past ~70% of container width */}
        <h2 className="mb-4 max-w-[520px] text-[22px] font-bold leading-[1.22] tracking-[-0.02em] text-white md:text-[28px] xl:max-w-[640px] xl:text-[34px]">
          {title}
        </h2>

        {/* Description — stays well within line-length comfort zone */}
        <p className="max-w-[480px] text-[14px] leading-[1.8] text-white/65 xl:max-w-[560px] xl:text-[15px]">
          {message}
        </p>
      </div>

      {/* ── Zone 2: Action bar ───────────────────────────────────────
          Left: context chips   Right: action buttons
          Chips and buttons in the same row = balanced, no wasted space
      */}
      <div className="relative border-t border-white/10 px-6 py-5 lg:px-8 xl:px-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          {/* Context — urgency + topic */}
          <div className="flex flex-wrap items-center gap-2">
            <UrgencyChip score={urgencyScore} />
            {topic && (
              <span className="inline-flex items-center rounded-full bg-white/10 px-3.5 py-1.5 text-[11px] font-semibold text-white/70">
                {topic}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            {primaryActionNode}
            <Button
              variant="ghost"
              size="md"
              className="border border-white/20 px-5 py-3 text-[14px] font-semibold text-white hover:bg-white/10 hover:text-white active:scale-95"
              onClick={() => onAskMentor(mentorPrompt)}
            >
              Perguntar ao Mentor
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
