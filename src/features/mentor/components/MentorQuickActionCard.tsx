import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { MentorRecommendation } from '../types'

interface MentorQuickActionCardProps {
  recommendation: MentorRecommendation
  featured?: boolean
  onAskMentor: (prompt: string) => void
}

/*
  Card structure mirrors the Dashboard cards exactly:
  ┌─────────────────────────────┐
  │ Header  (label + title)     │ ← px-6 pt-6 pb-4
  ├─────────────────────────────┤
  │ Body    (description)       │ ← px-6 py-4
  ├─────────────────────────────┤
  │ Footer  (CTA button)        │ ← px-6 pt-4 pb-6
  └─────────────────────────────┘
*/

const priorityConfig: Record<string, { dot: string; label: string }> = {
  high:   { dot: 'bg-red-500',    label: 'Urgente' },
  medium: { dot: 'bg-amber-400',  label: 'Relevante' },
  low:    { dot: 'bg-[#D1D5DB]',  label: 'Sugerido' },
}

export function MentorQuickActionCard({
  recommendation,
  featured = false,
  onAskMentor,
}: MentorQuickActionCardProps) {
  const priority = priorityConfig[recommendation.priority] ?? priorityConfig.low

  const hasPrimaryRoute =
    recommendation.action.kind === 'route' && recommendation.action.href

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-xl border bg-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(10,22,40,0.10)] ${
        featured
          ? 'border-[#2E5FD4]/20 shadow-[0_4px_16px_rgba(46,95,212,0.08)]'
          : 'border-[#E8ECF2] shadow-[0_2px_8px_rgba(10,22,40,0.05)]'
      }`}
    >
      {/* ── Header ── */}
      <div className="px-6 pb-4 pt-6">
        <div className="mb-3 flex items-center gap-2">
          <span className={`h-2 w-2 shrink-0 rounded-full ${priority.dot}`} />
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
            {featured ? 'Ação principal' : priority.label}
          </span>
        </div>
        <h3 className="text-[14px] font-semibold leading-[1.4] text-[#1A1F2E]">
          {recommendation.title}
        </h3>
      </div>

      {/* ── Body ── */}
      <div className="px-6 py-1 pb-4">
        <p className="text-[13px] leading-[1.75] text-[#6B7280]">
          {recommendation.message}
        </p>
      </div>

      {/* ── Footer ── */}
      <div className="mt-auto border-t border-[#E8ECF2] px-6 pb-6 pt-5">
        {hasPrimaryRoute ? (
          <Link
            to={(recommendation.action as { href: string }).href}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#EBF0FA] px-4 py-3 text-[13px] font-semibold text-[#2E5FD4] transition-all duration-150 hover:bg-[#2E5FD4] hover:text-white active:scale-95"
          >
            {recommendation.actionLabel}
            <ArrowRight size={13} />
          </Link>
        ) : (
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#EBF0FA] px-4 py-3 text-[13px] font-semibold text-[#2E5FD4] transition-all duration-150 hover:bg-[#2E5FD4] hover:text-white active:scale-95"
            onClick={() =>
              onAskMentor(
                recommendation.action.kind === 'question' && recommendation.action.prompt
                  ? recommendation.action.prompt
                  : `Quero executar agora: ${recommendation.title}.`,
              )
            }
          >
            {recommendation.actionLabel}
            <ArrowRight size={13} />
          </button>
        )}
      </div>
    </div>
  )
}
