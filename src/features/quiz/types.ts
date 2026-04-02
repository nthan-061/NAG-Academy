import type { Aula, QuizPergunta } from '@/types'

export type QuizStatus = 'respondendo' | 'confirmado' | 'resultado'

export interface QuizAnswerRecord {
  perguntaId: string
  escolhida: number
  correta: boolean
  topico: string
}

export interface QuizSetupData {
  aula: Aula
  perguntas: QuizPergunta[]
  userId: string | null
}

export interface QuizFinalizeResult {
  acertos: number
  total: number
  xpGanho: number
  flashcardsCount: number
}
