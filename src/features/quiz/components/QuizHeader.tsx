import { X } from 'lucide-react'

interface QuizHeaderProps {
  aulaTitulo: string
  indice: number
  totalPerguntas: number
  statusLabel: string
  progressPercent: number
  showProgress: boolean
  onExit: () => void
}

export function QuizHeader({
  aulaTitulo,
  indice,
  totalPerguntas,
  statusLabel,
  progressPercent,
  showProgress,
  onExit,
}: QuizHeaderProps) {
  return (
    <div
      style={{
        position: 'sticky',
        top: '64px',
        zIndex: 10,
        height: '64px',
        padding: '0 28px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E8ECF2',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}
    >
      <button
        onClick={onExit}
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          border: 'none',
          backgroundColor: '#F8FAFC',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'inherit',
        }}
      >
        <X size={20} strokeWidth={1.5} style={{ color: '#6B7280' }} />
      </button>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <p style={{ fontSize: '12px', fontWeight: 600, color: '#9CA3AF', margin: 0 }}>
          {statusLabel || `Pergunta ${indice + 1} de ${totalPerguntas}`}
        </p>

        {showProgress && (
          <div style={{ width: '100%', borderRadius: '999px', overflow: 'hidden', height: '6px', backgroundColor: '#E8ECF2' }}>
            <div
              style={{
                width: `${progressPercent}%`,
                height: '100%',
                borderRadius: '999px',
                backgroundColor: '#0D1B3E',
                transition: 'width 0.3s',
              }}
            />
          </div>
        )}
      </div>

      <span style={{ fontSize: '12px', fontWeight: 600, color: '#9CA3AF' }}>
        {aulaTitulo.slice(0, 36)}{aulaTitulo.length > 36 ? '...' : ''}
      </span>
    </div>
  )
}
