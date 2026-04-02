import { BookOpen, FileText, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { AulaTab } from '../types'

const ICONS = {
  resumo: BookOpen,
  chat: MessageCircle,
  notas: FileText,
} as const

interface AulaTabsProps {
  currentTab: AulaTab
  onChange: (tab: AulaTab) => void
  showNotes: boolean
}

const TABS: Array<{ key: AulaTab; label: string }> = [
  { key: 'resumo', label: 'Resumo' },
  { key: 'chat', label: 'Chat IA' },
  { key: 'notas', label: 'Notas' },
]

export function AulaTabs({ currentTab, onChange, showNotes }: AulaTabsProps) {
  return (
    <div className="flex min-h-[72px] shrink-0 border-b border-[#E8ECF2] bg-white px-1 sm:px-2">
      {TABS.filter((tab) => showNotes || tab.key !== 'notas').map((tab) => {
        const Icon = ICONS[tab.key]
        const active = currentTab === tab.key

        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={cn(
              'mb-[-1px] flex flex-1 flex-col items-center justify-center gap-2 border-b-2 px-2 py-3 text-xs font-semibold transition-colors',
              active
                ? 'border-[#0D1B3E] text-[#0D1B3E]'
                : 'border-transparent text-[#9CA3AF] hover:text-[#0D1B3E]',
            )}
          >
            <Icon size={16} strokeWidth={1.5} />
            <span>{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}
