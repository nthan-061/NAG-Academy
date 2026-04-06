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
      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white/90">
        <AlertTriangle size={10} />
        Urgente agora
      </span>
    )
  }
  if (score >= 4) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white/90">
        <Zap size={10} />
        Alta prioridade
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white/90">
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
        className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-[15px] font-bold text-[#1a2f6e] shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl active:scale-95"
      >
        {primaryRecommendation.actionLabel}
        <ArrowRight size={16} />
      </Link>
    ) : (
      <Button
        size="lg"
        className="bg-white px-8 py-3.5 text-[15px] font-bold text-[#1a2f6e] shadow-lg hover:-translate-y-0.5 hover:bg-white/95 hover:shadow-xl active:scale-95"
        onClick={() =>
          onAskMentor(
            primaryRecommendation?.action.prompt ?? `Quero executar agora: ${title}.`,
          )
        }
      >
        {primaryRecommendation?.actionLabel ?? 'Definir próximo passo'}
        <ArrowRight size={16} />
      </Button>
    )

  return (
    <div className="relative overflow-hidden rounded-[24px] bg-[linear-gradient(140deg,#0f1f52_0%,#1d4ed8_55%,#3b82f6_100%)] shadow-[0_32px_72px_rgba(29,78,216,0.35)]">

      {/* Decorative highlight — top-right glow */}
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full opacity-[0.08]"
        style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)' }}
      />
      {/* Decorative highlight — bottom-left subtle */}
      <div
        className="pointer-events-none absolute -bottom-16 -left-16 h-[280px] w-[280px] rounded-full opacity-[0.05]"
        style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)' }}
      />

      {/* ── Zone 1: Content — full width, generous vertical padding ── */}
      <div className="relative px-10 pb-10 pt-14 lg:px-14 lg:pb-12 lg:pt-16">

        {/* Eyebrow */}
        <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.22em] text-white/45">
          ⚡ Seu próximo passo agora
        </p>

        {/* Title — large, dominant, constrained for readability */}
        <h2 className="mb-6 max-w-[720px] text-[26px] font-bold leading-[1.18] tracking-[-0.025em] text-white md:text-[34px] lg:text-[40px]">
          {title}
        </h2>

        {/* Description — breathing room, capped width for comfortable line-length */}
        <p className="mb-8 max-w-[600px] text-[15px] leading-[1.85] text-white/65">
          {message}
        </p>

        {/* Context chips */}
        <div className="flex flex-wrap items-center gap-2.5">
          <UrgencyChip score={urgencyScore} />
          {topic && (
            <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-[11px] font-semibold tracking-[0.06em] text-white/70">
              {topic}
            </span>
          )}
        </div>
      </div>

      {/* ── Zone 2: Action bar — own zone, border-top, no competition with content ── */}
      <div className="relative border-t border-white/10 px-10 py-8 lg:px-14">
        <div className="flex flex-wrap items-center gap-3">
          {primaryActionNode}
          <Button
            variant="ghost"
            size="lg"
            className="border border-white/20 px-8 py-3.5 text-[15px] font-semibold text-white hover:bg-white/10 hover:text-white active:scale-95"
            onClick={() => onAskMentor(mentorPrompt)}
          >
            Perguntar ao Mentor
          </Button>
        </div>
      </div>
    </div>
  )
}
