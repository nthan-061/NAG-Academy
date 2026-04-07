import { useState, useRef } from 'react'
import { AlertTriangle, ArrowRight, BookOpen, CheckCircle2, ChevronRight, PenLine, Sparkles } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { ReflexaoAvaliacaoResult } from '../types'

interface ReflexaoEtapaProps {
  aulaId: string
  aulaTitle: string
  quizAcertos: number
  quizTotal: number
  onApproved: (result: ReflexaoAvaliacaoResult) => void
  onBackToAula: () => void
}

const MIN_WORDS = 100

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

class RetryLimitError extends Error {
  code = 'RETRY_LIMIT_REACHED'
  constructor(message: string) { super(message) }
}

async function submitReflexao(
  aulaId: string,
  texto: string,
  quizAcertos: number,
  quizTotal: number,
  token: string,
): Promise<ReflexaoAvaliacaoResult> {
  const response = await fetch('/api/avaliar-reflexao', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      aula_id: aulaId,
      texto,
      quiz_acertos: quizAcertos,
      quiz_total: quizTotal,
    }),
  })

  const json = await response.json().catch(() => ({})) as { error?: string; code?: string }

  if (!response.ok) {
    if (json.code === 'RETRY_LIMIT_REACHED') {
      throw new RetryLimitError(json.error ?? 'Limite de tentativas atingido.')
    }
    throw new Error(json.error ?? 'Erro ao avaliar reflexao.')
  }

  return json as unknown as ReflexaoAvaliacaoResult
}

// ── Sub-components ──────────────────────────────────────────────────

function WordCountBar({ count }: { count: number }) {
  const pct = Math.min((count / MIN_WORDS) * 100, 100)
  const reached = count >= MIN_WORDS
  return (
    <div style={{ marginTop: '12px' }}>
      <div
        style={{
          height: '4px',
          borderRadius: '999px',
          backgroundColor: '#E8ECF2',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            borderRadius: '999px',
            backgroundColor: reached ? '#16A34A' : '#2E5FD4',
            transition: 'width 0.2s ease, background-color 0.3s',
          }}
        />
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '6px',
          fontSize: '12px',
          color: reached ? '#16A34A' : '#6B7280',
          fontWeight: 500,
        }}
      >
        <span>{reached ? '✓ Mínimo atingido' : `${count} de ${MIN_WORDS} palavras`}</span>
        {!reached && <span>{MIN_WORDS - count} palavras restantes</span>}
      </div>
    </div>
  )
}

function ApprovedResult({
  result,
  onContinue,
}: {
  result: ReflexaoAvaliacaoResult
  onContinue: () => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          padding: '20px 24px',
          borderRadius: '14px',
          backgroundColor: '#F0FDF4',
          border: '1px solid rgba(22,163,74,0.20)',
        }}
      >
        <CheckCircle2 size={32} style={{ color: '#16A34A', flexShrink: 0 }} />
        <div>
          <p style={{ fontSize: '16px', fontWeight: 700, color: '#15803D', margin: '0 0 4px 0' }}>
            Reflexão aprovada!
          </p>
          <p style={{ fontSize: '13px', lineHeight: 1.6, color: '#16A34A', margin: 0 }}>
            {result.summary}
          </p>
        </div>
      </div>

      {/* Score + XP */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div
          style={{
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid #E8ECF2',
            backgroundColor: '#F7F9FD',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: '28px', fontWeight: 800, color: '#1A1F2E', margin: '0 0 4px 0' }}>
            {result.score}
            <span style={{ fontSize: '14px', fontWeight: 500, color: '#6B7280' }}>/100</span>
          </p>
          <p style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', margin: 0, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Pontuação
          </p>
        </div>
        {result.xp_ganho > 0 && (
          <div
            style={{
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid #FDE68A',
              background: 'linear-gradient(135deg, #FFF8DB, #FFF0B5)',
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: '28px', fontWeight: 800, color: '#D4A017', margin: '0 0 4px 0' }}>
              +{result.xp_ganho}
            </p>
            <p style={{ fontSize: '12px', fontWeight: 700, color: '#B45309', margin: 0, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              XP ganhos
            </p>
          </div>
        )}
      </div>

      {/* Strengths */}
      {result.strengths.length > 0 && (
        <div>
          <p style={{ fontSize: '12px', fontWeight: 700, color: '#6B7280', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 10px 0' }}>
            Pontos fortes detectados
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {result.strengths.slice(0, 4).map((strength, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <CheckCircle2 size={14} style={{ color: '#16A34A', marginTop: '2px', flexShrink: 0 }} />
                <span style={{ fontSize: '13px', lineHeight: 1.6, color: '#374151' }}>{strength}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended action */}
      {result.recommended_action && (
        <div
          style={{
            padding: '14px 16px',
            borderRadius: '10px',
            backgroundColor: '#EBF0FA',
            border: '1px solid rgba(46,95,212,0.15)',
          }}
        >
          <p style={{ fontSize: '12px', fontWeight: 700, color: '#2E5FD4', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 6px 0' }}>
            Próxima ação
          </p>
          <p style={{ fontSize: '13px', lineHeight: 1.65, color: '#1A1F2E', margin: 0 }}>
            {result.recommended_action}
          </p>
        </div>
      )}

      {/* CTA */}
      <button
        type="button"
        onClick={onContinue}
        style={{
          width: '100%',
          height: '52px',
          borderRadius: '14px',
          border: 'none',
          backgroundColor: '#0D1B3E',
          color: '#FFFFFF',
          fontSize: '15px',
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          fontFamily: 'inherit',
          boxShadow: '0 8px 24px rgba(13,27,62,0.18)',
        }}
      >
        <BookOpen size={16} />
        Concluir e voltar para a aula
        <ChevronRight size={16} />
      </button>
    </div>
  )
}

function RejectedResult({
  result,
  onRetry,
  onBackToAula,
}: {
  result: ReflexaoAvaliacaoResult
  onRetry: () => void
  onBackToAula: () => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '14px',
          padding: '20px 24px',
          borderRadius: '14px',
          backgroundColor: '#FEF2F2',
          border: '1px solid rgba(220,38,38,0.18)',
        }}
      >
        <AlertTriangle size={28} style={{ color: '#DC2626', flexShrink: 0, marginTop: '2px' }} />
        <div>
          <p style={{ fontSize: '16px', fontWeight: 700, color: '#B91C1C', margin: '0 0 4px 0' }}>
            Reflexão não aprovada (score: {result.score}/100)
          </p>
          <p style={{ fontSize: '13px', lineHeight: 1.65, color: '#DC2626', margin: 0 }}>
            {result.summary}
          </p>
        </div>
      </div>

      {/* Specificity */}
      {result.specificity_assessment && (
        <div
          style={{
            padding: '14px 16px',
            borderRadius: '10px',
            backgroundColor: '#FFF7ED',
            border: '1px solid rgba(234,88,12,0.18)',
          }}
        >
          <p style={{ fontSize: '12px', fontWeight: 700, color: '#EA580C', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 6px 0' }}>
            Por que não passou
          </p>
          <p style={{ fontSize: '13px', lineHeight: 1.65, color: '#7C2D12', margin: 0 }}>
            {result.specificity_assessment}
          </p>
        </div>
      )}

      {/* Gaps */}
      {result.gaps.length > 0 && (
        <div>
          <p style={{ fontSize: '12px', fontWeight: 700, color: '#6B7280', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 10px 0' }}>
            Lacunas identificadas
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {result.gaps.slice(0, 4).map((gap, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <AlertTriangle size={13} style={{ color: '#D97706', marginTop: '2px', flexShrink: 0 }} />
                <span style={{ fontSize: '13px', lineHeight: 1.6, color: '#374151' }}>{gap}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended action */}
      {result.recommended_action && (
        <div
          style={{
            padding: '14px 16px',
            borderRadius: '10px',
            backgroundColor: '#EBF0FA',
            border: '1px solid rgba(46,95,212,0.15)',
          }}
        >
          <p style={{ fontSize: '12px', fontWeight: 700, color: '#2E5FD4', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 6px 0' }}>
            O que fazer agora
          </p>
          <p style={{ fontSize: '13px', lineHeight: 1.65, color: '#1A1F2E', margin: 0 }}>
            {result.recommended_action}
          </p>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button
          type="button"
          onClick={onRetry}
          style={{
            width: '100%',
            height: '52px',
            borderRadius: '14px',
            border: 'none',
            backgroundColor: '#0D1B3E',
            color: '#FFFFFF',
            fontSize: '15px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontFamily: 'inherit',
          }}
        >
          <PenLine size={15} />
          Tentar novamente
        </button>
        <button
          type="button"
          onClick={onBackToAula}
          style={{
            width: '100%',
            height: '48px',
            borderRadius: '14px',
            border: '1px solid #E8ECF2',
            backgroundColor: '#FFFFFF',
            color: '#374151',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontFamily: 'inherit',
          }}
        >
          <BookOpen size={14} />
          Rever a aula antes de tentar
        </button>
      </div>
    </div>
  )
}

// ── Main component ──────────────────────────────────────────────────

export function ReflexaoEtapa({
  aulaId,
  aulaTitle,
  quizAcertos,
  quizTotal,
  onApproved,
  onBackToAula,
}: ReflexaoEtapaProps) {
  const [texto, setTexto] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [limitReached, setLimitReached] = useState(false)
  const [result, setResult] = useState<ReflexaoAvaliacaoResult | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const wordCount = countWords(texto)
  const canSubmit = wordCount >= MIN_WORDS && !submitting

  async function handleSubmit() {
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) throw new Error('Sessao invalida. Faca login novamente.')

      const evaluation = await submitReflexao(
        aulaId,
        texto,
        quizAcertos,
        quizTotal,
        session.access_token,
      )
      setResult(evaluation)

      if (evaluation.approved) {
        onApproved(evaluation)
      }
    } catch (err) {
      if (err instanceof RetryLimitError) {
        setLimitReached(true)
      } else {
        setError(err instanceof Error ? err.message : 'Erro ao enviar reflexao. Tente novamente.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  function handleRetry() {
    setResult(null)
    setTexto('')
    setError(null)
    setTimeout(() => textareaRef.current?.focus(), 100)
  }

  // Retry limit reached — no more attempts allowed
  if (limitReached) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px',
            padding: '20px 24px',
            borderRadius: '14px',
            backgroundColor: '#FEF2F2',
            border: '1px solid rgba(220,38,38,0.18)',
          }}
        >
          <AlertTriangle size={28} style={{ color: '#DC2626', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <p style={{ fontSize: '16px', fontWeight: 700, color: '#B91C1C', margin: '0 0 6px 0' }}>
              Limite de tentativas atingido
            </p>
            <p style={{ fontSize: '13px', lineHeight: 1.65, color: '#DC2626', margin: 0 }}>
              Você usou todas as 3 tentativas disponíveis para esta aula sem atingir a aprovação.
              Reveja o conteúdo da aula com atenção antes de tentar novamente.
            </p>
          </div>
        </div>

        <div
          style={{
            padding: '16px 18px',
            borderRadius: '12px',
            backgroundColor: '#F7F9FD',
            border: '1px solid #E8ECF2',
          }}
        >
          <p style={{ fontSize: '13px', lineHeight: 1.7, color: '#374151', margin: 0 }}>
            <strong style={{ color: '#1A1F2E' }}>O que fazer agora:</strong> volte para a aula, assista novamente
            com foco nos conceitos principais e, se precisar de ajuda, converse com o Mentor IA.
            Novas tentativas podem ser liberadas pelo seu mentor.
          </p>
        </div>

        <button
          type="button"
          onClick={onBackToAula}
          style={{
            width: '100%',
            height: '52px',
            borderRadius: '14px',
            border: 'none',
            backgroundColor: '#0D1B3E',
            color: '#FFFFFF',
            fontSize: '15px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontFamily: 'inherit',
          }}
        >
          <BookOpen size={15} />
          Rever a aula
        </button>
      </div>
    )
  }

  // Show result if evaluation is done
  if (result) {
    return result.approved
      ? <ApprovedResult result={result} onContinue={onBackToAula} />
      : <RejectedResult result={result} onRetry={handleRetry} onBackToAula={onBackToAula} />
  }

  // Writing phase
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            borderRadius: '6px',
            backgroundColor: '#EBF0FA',
            color: '#2E5FD4',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.10em',
            textTransform: 'uppercase',
            marginBottom: '16px',
          }}
        >
          <PenLine size={11} />
          Etapa obrigatória
        </div>

        <h2
          style={{
            fontSize: '22px',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: '#1A1F2E',
            margin: '0 0 10px 0',
            lineHeight: 1.2,
          }}
        >
          Reflexão sobre a aula
        </h2>

        <p style={{ fontSize: '14px', lineHeight: 1.75, color: '#6B7280', margin: 0 }}>
          Escreva com suas palavras o que você aprendeu e como pretende aplicar o conteúdo de{' '}
          <strong style={{ color: '#374151', fontWeight: 600 }}>"{aulaTitle}"</strong>.
          A avaliação é baseada no conteúdo real da aula — seja específico.
        </p>
      </div>

      {/* Instructions card */}
      <div
        style={{
          padding: '16px 18px',
          borderRadius: '12px',
          backgroundColor: '#F7F9FD',
          border: '1px solid #E8ECF2',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <Sparkles size={13} style={{ color: '#2E5FD4' }} />
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#2E5FD4', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Como será avaliado
          </span>
        </div>
        <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {[
            'Sua reflexão será lida por uma IA com acesso ao conteúdo real da aula',
            'Textos genéricos sobre o tema amplo não são suficientes',
            'A IA verifica se você abordou os pontos específicos ensinados nesta aula',
            'Mínimo de 100 palavras — qualidade importa mais que quantidade',
          ].map((item, i) => (
            <li key={i} style={{ fontSize: '13px', lineHeight: 1.6, color: '#374151' }}>{item}</li>
          ))}
        </ul>
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '10px',
            backgroundColor: '#FEF2F2',
            border: '1px solid rgba(220,38,38,0.15)',
          }}
        >
          <p style={{ fontSize: '13px', color: '#DC2626', margin: 0 }}>{error}</p>
        </div>
      )}

      {/* Textarea */}
      <div>
        <label
          htmlFor="reflexao-textarea"
          style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: 600,
            color: '#374151',
            marginBottom: '8px',
          }}
        >
          Sua reflexão
        </label>
        <textarea
          id="reflexao-textarea"
          ref={textareaRef}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={8}
          placeholder="Escreva aqui o que você compreendeu desta aula. Seja específico sobre os conceitos ensinados, exemplos discutidos e como você pode aplicar isso..."
          style={{
            display: 'block',
            width: '100%',
            padding: '14px 16px',
            borderRadius: '12px',
            border: '1px solid #E8ECF2',
            backgroundColor: '#F7F9FD',
            fontSize: '14px',
            lineHeight: 1.75,
            color: '#1A1F2E',
            resize: 'vertical',
            outline: 'none',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
            transition: 'border-color 0.15s, background-color 0.15s, box-shadow 0.15s',
            minHeight: '200px',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#2E5FD4'
            e.currentTarget.style.backgroundColor = '#FFFFFF'
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(46,95,212,0.08)'
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#E8ECF2'
            e.currentTarget.style.backgroundColor = '#F7F9FD'
            e.currentTarget.style.boxShadow = 'none'
          }}
        />
        <WordCountBar count={wordCount} />
      </div>

      {/* Submit */}
      <button
        type="button"
        onClick={() => { void handleSubmit() }}
        disabled={!canSubmit}
        style={{
          width: '100%',
          height: '52px',
          borderRadius: '14px',
          border: 'none',
          backgroundColor: canSubmit ? '#0D1B3E' : '#E8ECF2',
          color: canSubmit ? '#FFFFFF' : '#9CA3AF',
          fontSize: '15px',
          fontWeight: 700,
          cursor: canSubmit ? 'pointer' : 'not-allowed',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          fontFamily: 'inherit',
          transition: 'background-color 0.2s',
          boxShadow: canSubmit ? '0 8px 24px rgba(13,27,62,0.18)' : 'none',
        }}
      >
        {submitting ? (
          <>
            <div
              style={{
                width: '16px',
                height: '16px',
                border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: '#FFFFFF',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }}
            />
            Avaliando com IA...
          </>
        ) : (
          <>
            Enviar para avaliação
            <ArrowRight size={16} />
          </>
        )}
      </button>

      <p style={{ fontSize: '11px', color: '#9CA3AF', textAlign: 'center', margin: 0 }}>
        A avaliação leva alguns segundos. Sua resposta fica salva automaticamente após o envio.
      </p>
    </div>
  )
}
