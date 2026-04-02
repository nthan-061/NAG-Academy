import { BookOpen, FileText, MessageCircle } from 'lucide-react'
import type { AulaTab } from '../types'

const ICONS = {
  resumo: BookOpen,
  chat: MessageCircle,
  notas: FileText,
} as const

const TABS: Array<{ key: AulaTab; label: string }> = [
  { key: 'resumo', label: 'Resumo' },
  { key: 'chat', label: 'Chat IA' },
  { key: 'notas', label: 'Notas' },
]

interface AulaTabsProps {
  currentTab: AulaTab
  onChange: (tab: AulaTab) => void
  showNotes: boolean
}

export function AulaTabs({ currentTab, onChange, showNotes }: AulaTabsProps) {
  return (
    <div
      style={{
        display: 'flex',
        borderBottom: '1px solid #E8ECF2',
        backgroundColor: '#FFFFFF',
        flexShrink: 0,
        minHeight: '72px',
        padding: '0 10px',
      }}
    >
      {TABS.filter((tab) => showNotes || tab.key !== 'notas').map((tab) => {
        const Icon = ICONS[tab.key]
        const active = currentTab === tab.key

        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '14px 8px',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
              backgroundColor: 'transparent',
              borderBottom: active ? '2px solid #0D1B3E' : '2px solid transparent',
              marginBottom: '-1px',
              color: active ? '#0D1B3E' : '#9CA3AF',
              fontSize: '12px',
              fontWeight: active ? 700 : 500,
              transition: 'color 0.15s',
            }}
          >
            <Icon size={16} strokeWidth={1.5} color={active ? '#0D1B3E' : '#9CA3AF'} />
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
