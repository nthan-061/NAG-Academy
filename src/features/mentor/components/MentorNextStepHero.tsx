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
  const base = 'inline-flex items-center gap-1.5 rounded-full bg-white/[0.14] px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white/80'
  if (score >= 7) return <span className={base}><AlertTriangle size={10} />Urgente agora</span>
  if (score >= 4) return <span className={base}><Zap size={10} />Alta prioridade</span>
  return <span className={base}><TrendingUp size={10} />Próximo passo</span>
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
    <div
      style={{
        background: 'linear-gradient(140deg, #0B1B4D 0%, #1E3A8A 55%, #2563EB 100%)',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(37,99,235,0.22)',
        position: 'relative',
      }}
    >
      {/* Subtle glow — doesn't compete with text */}
      <div
        style={{
          position: 'absolute',
          right: '-80px',
          top: '-80px',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />

      {/* ── Content zone ── */}
      {/*
        Simple vertical layout: eyebrow → title → description.
        No grid tricks. Height = content + explicit padding.
        px-12 py-14 gives 48px / 56px — never compresses.
      */}
      <div style={{ padding: '56px 48px 48px', position: 'relative' }}>
        <p
          style={{
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.38)',
            margin: '0 0 20px 0',
          }}
        >
          ⚡ Seu próximo passo agora
        </p>

        <h2
          style={{
            fontSize: 'clamp(28px, 3.5vw, 42px)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            color: '#FFFFFF',
            margin: '0 0 20px 0',
            maxWidth: '640px',
          }}
        >
          {title}
        </h2>

        <p
          style={{
            fontSize: '15px',
            lineHeight: 1.85,
            color: 'rgba(255,255,255,0.6)',
            margin: 0,
            maxWidth: '520px',
          }}
        >
          {message}
        </p>
      </div>

      {/* ── Action bar ── */}
      {/*
        Separated from content by a subtle border.
        Badges on the left, CTAs on the right.
        Never stacks content against buttons.
      */}
      <div
        style={{
          borderTop: '1px solid rgba(255,255,255,0.10)',
          padding: '28px 48px 36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
          position: 'relative',
        }}
      >
        {/* Left: context badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          <UrgencyBadge score={urgencyScore} />
          {topic && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                borderRadius: '999px',
                background: 'rgba(255,255,255,0.10)',
                padding: '6px 14px',
                fontSize: '11px',
                fontWeight: 600,
                color: 'rgba(255,255,255,0.65)',
              }}
            >
              {topic}
            </span>
          )}
        </div>

        {/* Right: action buttons */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          {hasPrimaryRoute ? (
            <Link
              to={(primaryRecommendation!.action as { href: string }).href}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                borderRadius: '10px',
                background: '#FFFFFF',
                color: '#1A2F6E',
                fontSize: '14px',
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 20px rgba(0,0,0,0.22)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 14px rgba(0,0,0,0.18)' }}
            >
              {primaryActionLabel}
              <ArrowRight size={14} />
            </Link>
          ) : (
            <button
              type="button"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                borderRadius: '10px',
                background: '#FFFFFF',
                color: '#1A2F6E',
                fontSize: '14px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 20px rgba(0,0,0,0.22)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 14px rgba(0,0,0,0.18)' }}
              onClick={() => onAskMentor(primaryRecommendation?.action.prompt ?? `Quero executar agora: ${title}.`)}
            >
              {primaryActionLabel}
              <ArrowRight size={14} />
            </button>
          )}

          <button
            type="button"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '12px 24px',
              borderRadius: '10px',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.22)',
              color: 'rgba(255,255,255,0.85)',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.10)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            onClick={() => onAskMentor(mentorPrompt)}
          >
            Perguntar ao Mentor
          </button>
        </div>
      </div>
    </div>
  )
}
