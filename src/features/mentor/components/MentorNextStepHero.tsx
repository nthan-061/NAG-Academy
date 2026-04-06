import { AlertTriangle, ArrowRight, TrendingUp, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
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
      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white/90">
        <AlertTriangle size={10} />
        Urgente agora
      </span>
    )
  }
  if (score >= 4) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white/90">
        <Zap size={10} />
        Alta prioridade
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white/90">
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

  const primaryActionLabel = primaryRecommendation?.actionLabel ?? 'Definir próximo passo'

  const primaryAction =
    primaryRecommendation?.action.kind === 'route' && primaryRecommendation.action.href ? (
      <Link
        to={primaryRecommendation.action.href}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-[14px] font-bold text-[#1a2f6e] shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
      >
        {primaryActionLabel}
        <ArrowRight size={14} />
      </Link>
    ) : (
      <button
        type="button"
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-[14px] font-bold text-[#1a2f6e] shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
        onClick={() =>
          onAskMentor(
            primaryRecommendation?.action.prompt ?? `Quero executar agora: ${title}.`,
          )
        }
      >
        {primaryActionLabel}
        <ArrowRight size={14} />
      </button>
    )

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0c1c50] via-[#1e3a8a] to-[#2563eb] shadow-[0_20px_56px_rgba(37,99,235,0.22)]">
      {/* Decorative orb */}
      <div className="pointer-events-none absolute -right-32 -top-32 h-[480px] w-[480px] rounded-full bg-white/[0.05] blur-[80px]" />

      {/*
        Below xl  → single column: content on top, actions below (separated by border-t)
        At xl     → two columns: content left (3fr) | actions right (2fr), divided by border
      */}
      <div className="relative xl:grid xl:grid-cols-[3fr_2fr] xl:divide-x xl:divide-white/[0.12]">

        {/* ── LEFT: Eyebrow + Title + Description ─────────────────────── */}
        <div className="px-8 pb-10 pt-10 lg:px-10 lg:pb-12 lg:pt-12 xl:px-12 xl:pb-14 xl:pt-14">
          <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">
            ⚡ Seu próximo passo
          </p>

          <h2 className="mb-6 text-[24px] font-bold leading-[1.2] tracking-[-0.025em] text-white lg:text-[30px] xl:text-[38px]">
            {title}
          </h2>

          <p className="text-[15px] leading-[1.8] text-white/65 xl:max-w-[440px]">
            {message}
          </p>
        </div>

        {/* ── RIGHT: Urgency chips + Action buttons ──────────────────── */}
        {/*
          Mobile/lg  → horizontal strip: chips left, buttons right (flex-row with justify-between)
          xl         → vertical stack: chips on top, buttons at bottom (flex-col with justify-between)
        */}
        <div className="flex flex-col justify-between gap-7 border-t border-white/[0.12] px-8 py-8 sm:flex-row sm:items-center xl:flex-col xl:items-stretch xl:border-l xl:border-t-0 xl:px-10 xl:py-12">

          {/* Chips */}
          <div className="flex flex-wrap gap-2">
            <UrgencyChip score={urgencyScore} />
            {topic && (
              <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-white/70">
                {topic}
              </span>
            )}
          </div>

          {/* Buttons — stacked vertically */}
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:min-w-[200px] xl:w-full">
            {primaryAction}
            <button
              type="button"
              className="flex w-full items-center justify-center rounded-xl border border-white/20 px-6 py-3.5 text-[14px] font-semibold text-white/90 transition-all duration-200 hover:bg-white/10 active:scale-95"
              onClick={() => onAskMentor(mentorPrompt)}
            >
              Perguntar ao Mentor
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
