import { useAulaNotes } from '../hooks/useAulaNotes'

interface AulaNotesPanelProps {
  aulaId: string
  userId: string | null
}

export function AulaNotesPanel({ aulaId, userId }: AulaNotesPanelProps) {
  const { notes, saving, handleChange } = useAulaNotes(aulaId, userId)

  if (!userId) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-10 text-center text-sm text-[#9CA3AF]">
        Faca login novamente para salvar anotacoes.
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-[#E8ECF2] px-5 py-4">
        <p className="text-xs text-[#9CA3AF]">Suas anotacoes sao salvas automaticamente</p>
        {saving && <span className="text-xs text-[#9CA3AF]">Salvando...</span>}
      </div>

      <textarea
        value={notes}
        onChange={(event) => handleChange(event.target.value)}
        placeholder="Escreva suas anotacoes aqui..."
        className="min-h-[280px] flex-1 resize-none bg-white p-5 text-[15px] leading-8 text-[#1A1F2E] outline-none"
      />
    </div>
  )
}
