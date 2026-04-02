import { XP as XP_VALUES } from '@/lib/xp'

export function getQuizResultTitle(percentual: number) {
  if (percentual >= 80) return 'Excelente resultado'
  if (percentual >= 60) return 'Bom resultado'
  return 'Continue praticando'
}

export function getQuizProgressPercent(indice: number, totalPerguntas: number, confirmado: boolean) {
  if (totalPerguntas <= 0) return 0
  return ((indice + (confirmado ? 1 : 0)) / totalPerguntas) * 100
}

export function calculateQuizXp(acertos: number, total: number) {
  const perfeito = total > 0 && acertos === total

  return (
    XP_VALUES.quiz_completado +
    acertos * XP_VALUES.por_acerto +
    (perfeito ? XP_VALUES.quiz_perfeito : 0)
  )
}
