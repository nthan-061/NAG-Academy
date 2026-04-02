import { BookOpen, CheckCircle2, XCircle } from 'lucide-react'
import type { QuizPergunta } from '@/types'
import type { QuizAnswerRecord } from '../types'

interface QuizFeedbackProps {
  resposta: QuizAnswerRecord | null
  pergunta: QuizPergunta | null
}

export function QuizFeedback({ resposta, pergunta }: QuizFeedbackProps) {
  if (!resposta || !pergunta) return null

  const correta = resposta.correta

  return (
    <div
      className="animate-slideUp"
      style={{
        backgroundColor: correta ? '#F0FDF4' : '#FEF2F2',
        border: `1px solid ${correta ? '#86EFAC' : '#FECACA'}`,
        padding: '18px 20px',
        borderRadius: '14px',
      }}
    >
      <p
        style={{
          fontWeight: 700,
          fontSize: '14px',
          margin: '0 0 8px 0',
          color: correta ? '#16A34A' : '#DC2626',
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          {correta ? <CheckCircle2 size={15} strokeWidth={1.5} /> : <XCircle size={15} strokeWidth={1.5} />}
          {correta ? 'Correto' : 'Incorreto'}
        </span>
      </p>

      <p
        style={{
          fontSize: '14px',
          lineHeight: '1.75',
          color: '#6B7280',
          margin: 0,
        }}
      >
        {pergunta.explicacao}
      </p>

      {!correta && (
        <p
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            margin: '10px 0 0 0',
            fontWeight: 600,
            color: '#2E5FD4',
          }}
        >
          <BookOpen size={13} strokeWidth={1.5} />
          Este flashcard foi adicionado a sua revisao
        </p>
      )}
    </div>
  )
}
