import type { CSSProperties } from 'react'
import { NavLink } from 'react-router-dom'
import { Brain, Sparkles } from 'lucide-react'
import { useMentorSummary } from '../hooks'

const statusTone: Record<'good' | 'attention' | 'critical', { bg: string; text: string }> = {
  good: { bg: '#E8F7EE', text: '#14804A' },
  attention: { bg: '#FFF5D9', text: '#B76E00' },
  critical: { bg: '#FDECEC', text: '#D14343' },
}

interface MentorSidebarProps {
  navItemStyle: (isActive: boolean) => CSSProperties
}

export function MentorSidebar({ navItemStyle }: MentorSidebarProps) {
  const { status, alertCount, recommendationCount } = useMentorSummary()
  const tone = statusTone[status]

  return (
    <NavLink to="/mentor">
      {({ isActive }) => (
        <div
          style={navItemStyle(isActive)}
          onMouseEnter={(event) => {
            if (!isActive) {
              event.currentTarget.style.backgroundColor = '#F5F6FA'
              event.currentTarget.style.boxShadow = '0 10px 24px rgba(10,22,40,0.04)'
            }
          }}
          onMouseLeave={(event) => {
            if (!isActive) {
              event.currentTarget.style.backgroundColor = 'transparent'
              event.currentTarget.style.boxShadow = 'none'
            }
          }}
        >
          <Brain size={18} strokeWidth={1.5} color={isActive ? '#0D1B3E' : '#9CA3AF'} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ flex: 1 }}>Mentor IA</span>
              {alertCount > 0 && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '20px',
                    height: '20px',
                    borderRadius: '999px',
                    padding: '0 6px',
                    backgroundColor: tone.text,
                    color: '#FFFFFF',
                    fontSize: '11px',
                    fontWeight: 700,
                  }}
                >
                  {alertCount > 9 ? '9+' : alertCount}
                </span>
              )}
            </div>
            {!isActive && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    borderRadius: '999px',
                    padding: '3px 8px',
                    backgroundColor: tone.bg,
                    color: tone.text,
                    fontSize: '10px',
                    fontWeight: 700,
                  }}
                >
                  <Sparkles size={10} />
                  {recommendationCount} acoes
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </NavLink>
  )
}
