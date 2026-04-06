import { Brain, RefreshCcw } from 'lucide-react'
import type { MentorPerformanceAnalysis } from '../types'

interface MentorHeaderProps {
  analysis: MentorPerformanceAnalysis | null
  onRefresh: () => void
  refreshing?: boolean
}

const statusConfig = {
  good:      { bg: '#F0FDF4', color: '#16A34A', label: 'Em boa evolução' },
  attention: { bg: '#FFF8DB', color: '#D97706', label: 'Pede atenção' },
  critical:  { bg: '#FEF2F2', color: '#DC2626', label: 'Risco alto' },
}

export function MentorHeader({ analysis, onRefresh, refreshing }: MentorHeaderProps) {
  const status = analysis?.status ?? 'attention'
  const chip = statusConfig[status]

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>

      {/* ── Left group: icon · title · chip · timestamp ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>

        {/* Icon */}
        <div
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '10px',
            backgroundColor: '#EBF0FA',
            color: '#2E5FD4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Brain size={16} />
        </div>

        {/* Title */}
        <span
          style={{
            fontSize: '15px',
            fontWeight: 600,
            color: '#1A1F2E',
            lineHeight: 1,
          }}
        >
          Mentor IA
        </span>

        {/* Status chip — same height as the title text via explicit line-height + padding */}
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '3px 10px',
            borderRadius: '6px',
            backgroundColor: chip.bg,
            color: chip.color,
            fontSize: '12px',
            fontWeight: 600,
            lineHeight: 1,
            letterSpacing: '0.01em',
            whiteSpace: 'nowrap',
          }}
        >
          {chip.label}
        </span>

        {/* Timestamp — secondary metadata, visually subordinate */}
        <span
          style={{
            fontSize: '12px',
            color: '#9CA3AF',
            lineHeight: 1,
          }}
        >
          · Atualizado agora
        </span>
      </div>

      {/* ── Right: refresh button ── */}
      <button
        type="button"
        disabled={refreshing}
        onClick={onRefresh}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          height: '34px',
          padding: '0 14px',
          borderRadius: '8px',
          border: '1px solid #E8ECF2',
          backgroundColor: '#FFFFFF',
          color: '#374151',
          fontSize: '13px',
          fontWeight: 500,
          cursor: refreshing ? 'not-allowed' : 'pointer',
          opacity: refreshing ? 0.6 : 1,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          transition: 'transform 0.15s, box-shadow 0.15s, border-color 0.15s',
          flexShrink: 0,
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={e => {
          if (refreshing) return
          const el = e.currentTarget as HTMLElement
          el.style.transform = 'translateY(-1px)'
          el.style.boxShadow = '0 4px 10px rgba(0,0,0,0.08)'
          el.style.borderColor = '#D1D5DB'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLElement
          el.style.transform = ''
          el.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'
          el.style.borderColor = '#E8ECF2'
        }}
      >
        <RefreshCcw
          size={13}
          style={refreshing ? { animation: 'spin 1s linear infinite' } : undefined}
        />
        Atualizar
      </button>
    </div>
  )
}
