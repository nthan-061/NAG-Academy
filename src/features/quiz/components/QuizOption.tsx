import { CheckCircle, XCircle } from 'lucide-react'
import type { QuizStatus } from '../types'

interface QuizOptionProps {
  texto: string
  index: number
  status: QuizStatus
  selecionada: boolean
  correta: boolean
  onSelect: () => void
}

const LETTERS = ['A', 'B', 'C', 'D']

export function QuizOption({
  texto,
  index,
  status,
  selecionada,
  correta,
  onSelect,
}: QuizOptionProps) {
  const confirmado = status === 'confirmado'

  let bg = '#FFFFFF'
  let borderColor = '#E8ECF2'
  let textColor = '#1A1F2E'
  let icon = null

  if (confirmado && selecionada && correta) {
    bg = '#F0FDF4'
    borderColor = '#16A34A'
    textColor = '#16A34A'
    icon = <CheckCircle size={18} strokeWidth={1.5} style={{ color: '#16A34A', flexShrink: 0 }} />
  } else if (confirmado && selecionada && !correta) {
    bg = '#FEF2F2'
    borderColor = '#DC2626'
    textColor = '#DC2626'
    icon = <XCircle size={18} strokeWidth={1.5} style={{ color: '#DC2626', flexShrink: 0 }} />
  } else if (confirmado && correta) {
    bg = '#F0FDF4'
    borderColor = '#16A34A'
    textColor = '#16A34A'
    icon = <CheckCircle size={18} strokeWidth={1.5} style={{ color: '#16A34A', flexShrink: 0 }} />
  } else if (!confirmado && selecionada) {
    bg = '#EBF0FA'
    borderColor = '#2E5FD4'
  }

  const letterBg = selecionada || (confirmado && correta) ? borderColor : '#E8ECF2'
  const letterColor = selecionada || (confirmado && correta) ? '#FFFFFF' : '#9CA3AF'

  return (
    <button
      type="button"
      onClick={confirmado ? undefined : onSelect}
      disabled={confirmado}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '16px 20px',
        borderRadius: '14px',
        textAlign: 'left',
        border: `1px solid ${borderColor}`,
        backgroundColor: bg,
        color: textColor,
        cursor: confirmado ? 'default' : 'pointer',
        fontFamily: 'inherit',
        transition: 'border-color 0.15s, transform 0.15s',
      }}
    >
      <span
        style={{
          width: '34px',
          height: '34px',
          borderRadius: '10px',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          fontWeight: 700,
          backgroundColor: letterBg,
          color: letterColor,
        }}
      >
        {LETTERS[index]}
      </span>
      <span style={{ flex: 1, fontSize: '14px', lineHeight: '1.65' }}>{texto}</span>
      {icon}
    </button>
  )
}
