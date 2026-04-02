import { getNivel } from '@/lib/xp'
import { MENTOR_MEDIUM_WINDOW_DAYS, MENTOR_RECENT_WINDOW_DAYS } from './constants'
import type { MentorEstimatedLevel, MentorTrendDirection } from './types'

export function getTodayDateKey() {
  return new Date().toISOString().split('T')[0]
}

export function differenceInDays(dateLike?: string | null) {
  if (!dateLike) return null
  const current = new Date(getTodayDateKey())
  const value = new Date(dateLike.includes('T') ? dateLike : `${dateLike}T00:00:00`)
  const diff = current.getTime() - value.getTime()
  return Math.max(0, Math.floor(diff / 86400000))
}

export function countDistinctStudyDays(dates: string[], windowInDays: number) {
  const threshold = new Date()
  threshold.setDate(threshold.getDate() - (windowInDays - 1))

  const keys = new Set(
    dates
      .map((value) => value.split('T')[0])
      .filter((value) => new Date(`${value}T00:00:00`) >= threshold)
  )

  return keys.size
}

export function average(values: number[]) {
  if (values.length === 0) return 0
  return values.reduce((acc, value) => acc + value, 0) / values.length
}

export function determineTrend(current: number, previous: number, tolerance = 0.05): MentorTrendDirection {
  const delta = current - previous
  if (delta > tolerance) return 'improving'
  if (delta < -tolerance) return 'declining'
  return 'stable'
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function estimateLearningLevel(xp: number, accuracy: number, answeredQuestions: number): {
  label: MentorEstimatedLevel
  confidence: number
  reason: string
} {
  const nivel = getNivel(xp)

  let label: MentorEstimatedLevel = 'iniciante'
  if (xp >= 900 || (accuracy >= 0.78 && answeredQuestions >= 24)) {
    label = 'avancado'
  } else if (xp >= 300 || (accuracy >= 0.58 && answeredQuestions >= 10)) {
    label = 'intermediario'
  }

  const confidence = clamp(
    (answeredQuestions / 24) * 0.55 + Math.min(xp / 1000, 1) * 0.45,
    0.35,
    0.96,
  )

  return {
    label,
    confidence,
    reason: `Nivel ${nivel.nome.toLowerCase()} com ${Math.round(accuracy * 100)}% de acerto medio e ${answeredQuestions} respostas registradas.`,
  }
}

export function buildConsistencyScore(activeDaysLast7: number, activeDaysLast28: number, streakDays: number) {
  const weekly = activeDaysLast7 / MENTOR_RECENT_WINDOW_DAYS
  const monthly = activeDaysLast28 / MENTOR_MEDIUM_WINDOW_DAYS
  const streak = Math.min(streakDays / 14, 1)

  return Math.round(clamp((weekly * 0.45 + monthly * 0.35 + streak * 0.2) * 100, 0, 100))
}

export function isDateWithinWindow(dateLike: string | null | undefined, days: number) {
  if (!dateLike) return false
  const threshold = new Date()
  threshold.setDate(threshold.getDate() - days)
  return new Date(dateLike) >= threshold
}
