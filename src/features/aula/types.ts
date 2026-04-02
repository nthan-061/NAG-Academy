import type { Aula, Modulo, Trilha, UserProgresso } from '@/types'

export type AulaTab = 'resumo' | 'chat' | 'notas'

export interface AulaChatMessage {
  role: 'user' | 'assistant' | 'error'
  content: string
}

export interface AulaPageData {
  aula: Aula
  modulo: Modulo | null
  trilha: Trilha | null
  aulaAnterior: Aula | null
  proximaAula: Aula | null
  progresso: UserProgresso | null
}

export interface AulaTabItem {
  key: AulaTab
  label: string
}
