import { useAulaNotes } from '../hooks/useAulaNotes'

interface AulaNotesPanelProps {
  aulaId: string
  userId: string | null
}

export function AulaNotesPanel({ aulaId, userId }: AulaNotesPanelProps) {
  const { notes, saving, handleChange } = useAulaNotes(aulaId, userId)

  if (!userId) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', fontSize: '13px', color: '#9CA3AF' }}>
        Faca login novamente para salvar anotacoes.
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <div
        style={{
          padding: '14px 18px',
          borderBottom: '1px solid #E8ECF2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>
          Suas anotacoes sao salvas automaticamente
        </p>
        {saving && (
          <span style={{ fontSize: '11px', color: '#9CA3AF' }}>Salvando...</span>
        )}
      </div>

      <textarea
        value={notes}
        onChange={(event) => handleChange(event.target.value)}
        placeholder="Escreva suas anotacoes aqui..."
        style={{
          flex: 1,
          border: 'none',
          outline: 'none',
          resize: 'none',
          padding: '20px',
          fontSize: '15px',
          color: '#1A1F2E',
          lineHeight: '1.85',
          backgroundColor: '#FFFFFF',
          fontFamily: 'inherit',
          minHeight: '280px',
        }}
      />
    </div>
  )
}
