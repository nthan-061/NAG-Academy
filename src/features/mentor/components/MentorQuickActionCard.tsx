import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { MentorRecommendation } from '../types'

interface MentorQuickActionCardProps {
  recommendation: MentorRecommendation
  featured?: boolean
  onAskMentor: (prompt: string) => void
}

/*
  Matches Dashboard card structure exactly:
  ┌──────────────────────────────────┐
  │  Header: label + title           │  padding: 20px 20px 16px
  ├──────────────────────────────────┤  borderBottom: 1px solid #E8ECF2
  │  Body: description               │  padding: 20px
  ├──────────────────────────────────┤  borderTop: 1px solid #E8ECF2
  │  Footer: CTA                     │  padding: 16px 20px
  └──────────────────────────────────┘
*/

const priorityConfig: Record<string, { dot: string; label: string }> = {
  high:   { dot: '#EF4444', label: 'Urgente' },
  medium: { dot: '#F59E0B', label: 'Relevante' },
  low:    { dot: '#D1D5DB', label: 'Sugerido' },
}

export function MentorQuickActionCard({
  recommendation,
  featured = false,
  onAskMentor,
}: MentorQuickActionCardProps) {
  const priority = priorityConfig[recommendation.priority] ?? priorityConfig.low
  const hasPrimaryRoute = recommendation.action.kind === 'route' && recommendation.action.href

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        border: featured ? '1px solid rgba(46,95,212,0.20)' : '1px solid #E8ECF2',
        boxShadow: featured
          ? '0 4px 16px rgba(46,95,212,0.08)'
          : '0 2px 8px rgba(0,0,0,0.06)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement
        el.style.transform = 'translateY(-2px)'
        el.style.boxShadow = '0 8px 24px rgba(0,0,0,0.10)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement
        el.style.transform = ''
        el.style.boxShadow = featured
          ? '0 4px 16px rgba(46,95,212,0.08)'
          : '0 2px 8px rgba(0,0,0,0.06)'
      }}
    >
      {/* Header */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #E8ECF2' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span
            style={{
              display: 'block',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: priority.dot,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.10em',
              color: '#9CA3AF',
            }}
          >
            {featured ? 'Ação principal' : priority.label}
          </span>
        </div>
        <h3
          style={{
            fontSize: '14px',
            fontWeight: 600,
            lineHeight: 1.4,
            color: '#1A1F2E',
            margin: 0,
          }}
        >
          {recommendation.title}
        </h3>
      </div>

      {/* Body */}
      <div style={{ padding: '16px 20px', flex: 1 }}>
        <p
          style={{
            fontSize: '13px',
            lineHeight: 1.75,
            color: '#6B7280',
            margin: 0,
          }}
        >
          {recommendation.message}
        </p>
      </div>

      {/* Footer */}
      <div style={{ padding: '14px 20px 20px', borderTop: '1px solid #E8ECF2' }}>
        {hasPrimaryRoute ? (
          <Link
            to={(recommendation.action as { href: string }).href}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              width: '100%',
              padding: '10px 16px',
              borderRadius: '8px',
              backgroundColor: '#EBF0FA',
              color: '#2E5FD4',
              fontSize: '13px',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'background-color 0.15s, color 0.15s',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement
              el.style.backgroundColor = '#2E5FD4'
              el.style.color = '#FFFFFF'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement
              el.style.backgroundColor = '#EBF0FA'
              el.style.color = '#2E5FD4'
            }}
          >
            {recommendation.actionLabel}
            <ArrowRight size={13} />
          </Link>
        ) : (
          <button
            type="button"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              width: '100%',
              padding: '10px 16px',
              borderRadius: '8px',
              backgroundColor: '#EBF0FA',
              color: '#2E5FD4',
              fontSize: '13px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.15s, color 0.15s',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement
              el.style.backgroundColor = '#2E5FD4'
              el.style.color = '#FFFFFF'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement
              el.style.backgroundColor = '#EBF0FA'
              el.style.color = '#2E5FD4'
            }}
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
