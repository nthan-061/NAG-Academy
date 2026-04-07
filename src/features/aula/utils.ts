import type { UserProgresso } from '@/types'
import type { AulaChatMessage, AulaTabItem } from './types'

export function isAulaCompleta(progresso: UserProgresso | null | undefined): boolean {
  if (!progresso) return false
  return Boolean(progresso.assistida && progresso.quiz_completado && progresso.reflexao_completada)
}

export interface AulaChatLine {
  kind: 'paragraph' | 'bullet' | 'space'
  content: string
}

export const AULA_TABS: AulaTabItem[] = [
  { key: 'resumo', label: 'Resumo' },
  { key: 'chat', label: 'Chat IA' },
  { key: 'notas', label: 'Notas' },
]

export function formatAulaChatMessage(content: string): AulaChatLine[] {
  return content.split('\n').map((line) => {
    const trimmed = line.trim()

    if (!trimmed) {
      return { kind: 'space', content: '' }
    }

    if (/^[-*•]\s/.test(trimmed)) {
      return { kind: 'bullet', content: trimmed.replace(/^[-*•]\s/, '') }
    }

    return { kind: 'paragraph', content: line }
  })
}

export function appendChatMessage(history: AulaChatMessage[], next: AulaChatMessage) {
  return [...history, next]
}
