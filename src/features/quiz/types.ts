import type { Aula, QuizPergunta } from '@/types'

export type QuizStatus = 'respondendo' | 'confirmado' | 'resultado' | 'reflexao'

export interface ReflexaoAvaliacaoResult {
  approved: boolean
  score: number
  summary: string
  strengths: string[]
  gaps: string[]
  recommended_action: string
  topic_match: 'baixo' | 'medio' | 'alto'
  specificity_assessment: string
  extracted_learning_signals: string[]
  extracted_risk_signals: string[]
  reflexao_id: string
  xp_ganho: number
}

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
