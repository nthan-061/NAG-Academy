import type { Aula } from '@/types'

interface AulaSummaryPanelProps {
  aula: Aula
}

export function AulaSummaryPanel({ aula }: AulaSummaryPanelProps) {
  if (!aula.resumo && (!aula.topicos || aula.topicos.length === 0)) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', fontSize: '13px', color: '#9CA3AF' }}>
        Resumo gerado automaticamente apos o processamento da aula.
      </div>
    )
  }

  return (
    <div
      style={{
        padding: '24px',
        overflowY: 'auto',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
        minHeight: 0,
      }}
    >
      {aula.topicos && aula.topicos.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {aula.topicos.map((topico) => (
            <span
              key={topico}
              style={{
                backgroundColor: '#EBF0FA',
                color: '#2E5FD4',
                fontSize: '12px',
                fontWeight: 600,
                padding: '6px 12px',
                borderRadius: '999px',
              }}
            >
              {topico}
            </span>
          ))}
        </div>
      )}

      {aula.resumo && (
        <p style={{ fontSize: '15px', color: '#4B5563', lineHeight: '1.85', margin: 0 }}>
          {aula.resumo}
        </p>
      )}
    </div>
  )
}
