import { AlertTriangle, ArrowRight, TrendingUp, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { MentorPerformanceAnalysis, MentorRecommendation, UserLearningProfile } from '../types'

interface MentorNextStepHeroProps {
  primaryRecommendation: MentorRecommendation | null
  analysis: MentorPerformanceAnalysis | null
  profile: UserLearningProfile | null
  onAskMentor: (prompt: string) => void
}

function UrgencyBadge({ score }: { score: number }) {
  if (score >= 7) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.14] px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white/80">
        <AlertTriangle size={10} />
        Urgente agora
      </span>
    )
  }
  if (score >= 4) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.14] px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white/80">
        <Zap size={10} />
        Alta prioridade
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.14] px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white/80">
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

  const hasPrimaryRoute =
    primaryRecommendation?.action.kind === 'route' && primaryRecommendation.action.href

  return (
    /*
      Hero design rules:
      - min-h-[340px] guarantees it never collapses to banner height
      - xl:min-h-[400px] for bigger viewports
      - Two clear zones: top (content) and bottom (actions), separated by border
      - On xl, the two zones become side-by-side columns
      - Title scales from 28px → 36px → 44px across breakpoints
      - Generous padding so text never touches the card edge
    */
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0b1b4d] via-[#1e3a8a] to-[#2563eb] shadow-[0_20px_60px_rgba(37,99,235,0.25)]">

      {/* Subtle decoration — doesn't crowd the content */}
      <div className="pointer-events-none absolute -right-40 -top-40 h-[560px] w-[560px] rounded-full bg-white/[0.04] blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-[300px] w-[300px] rounded-full bg-[#60a5fa]/[0.06] blur-[80px]" />

      <div className="relative">
        {/*
          Layout:
          - < xl  → vertical: content zone, then action bar below with border-t
          - ≥ xl  → horizontal grid: content left (dominant), actions right (contained)
        */}
        <div className="xl:grid xl:min-h-[400px] xl:grid-cols-[1fr_380px] xl:divide-x xl:divide-white/[0.10]">

          {/* ── Zone 1: Eyebrow + Title + Description ── */}
          <div className="flex flex-col justify-center px-10 pb-10 pt-14 lg:px-12 lg:pb-12 lg:pt-16 xl:px-14 xl:py-0">
            <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">
              ⚡ Seu próximo passo agora
            </p>

            <h2 className="mb-6 max-w-[540px] text-[28px] font-bold leading-[1.18] tracking-[-0.03em] text-white lg:text-[36px] xl:max-w-none xl:text-[44px]">
              {title}
            </h2>

            <p className="max-w-[520px] text-[15px] leading-[1.85] text-white/60 xl:max-w-[480px]">
              {message}
            </p>
          </div>

          {/* ── Zone 2: Context badges + Actions ── */}
          <div className="flex flex-col justify-between gap-8 border-t border-white/[0.10] px-10 py-10 lg:px-12 xl:border-l xl:border-t-0 xl:px-12 xl:py-14">

            {/* Badges row */}
            <div className="flex flex-wrap gap-2.5">
              <UrgencyBadge score={urgencyScore} />
              {topic && (
                <span className="inline-flex items-center rounded-full bg-white/[0.10] px-3.5 py-1.5 text-[11px] font-semibold text-white/65">
                  {topic}
                </span>
              )}
            </div>

            {/* Action buttons — stacked, full width in this column */}
            <div className="flex flex-col gap-3">
              {hasPrimaryRoute ? (
                <Link
                  to={(primaryRecommendation!.action as { href: string }).href}
                  className="flex items-center justify-center gap-2.5 rounded-xl bg-white px-7 py-4 text-[14px] font-bold text-[#1a2f6e] shadow-[0_4px_16px_rgba(0,0,0,0.15)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)] active:scale-95"
                >
                  {primaryActionLabel}
                  <ArrowRight size={15} />
                </Link>
              ) : (
                <button
                  type="button"
                  className="flex items-center justify-center gap-2.5 rounded-xl bg-white px-7 py-4 text-[14px] font-bold text-[#1a2f6e] shadow-[0_4px_16px_rgba(0,0,0,0.15)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)] active:scale-95"
                  onClick={() =>
                    onAskMentor(
                      primaryRecommendation?.action.prompt ?? `Quero executar agora: ${title}.`,
                    )
                  }
                >
                  {primaryActionLabel}
                  <ArrowRight size={15} />
                </button>
              )}

              <button
                type="button"
                className="flex items-center justify-center rounded-xl border border-white/[0.22] px-7 py-4 text-[14px] font-semibold text-white/85 transition-all duration-200 hover:bg-white/[0.10] active:scale-95"
                onClick={() => onAskMentor(mentorPrompt)}
              >
                Perguntar ao Mentor
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
