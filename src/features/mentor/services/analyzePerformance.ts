import type { MentorPerformanceAnalysis, UserLearningProfile } from '../types'

export function analyzePerformance(profile: UserLearningProfile): MentorPerformanceAnalysis {
  const centralProblems: string[] = []
  const pedagogicalAlerts: string[] = []
  const shortTermRisks: string[] = []
  const opportunities: string[] = []
  const focusTopics = profile.criticalTopics.slice(0, 3)

  let urgencyScore = 18

  if (profile.criticalTopics.length >= 2) {
    centralProblems.push(`Erros recorrentes em ${profile.criticalTopics.slice(0, 2).join(' e ')}.`)
    urgencyScore += 28
  }

  if (profile.consistency.recentDrop) {
    pedagogicalAlerts.push('Queda de consistencia recente em comparacao com o padrao anterior.')
    urgencyScore += 18
  }

  if (profile.recentEngagement.pendingFlashcards >= 8) {
    pedagogicalAlerts.push('Fila de revisao alta, o que reduz retencao de curto prazo.')
    urgencyScore += 16
  }

  if (profile.studyVelocity.completionRate < 0.55) {
    centralProblems.push('Consumo de aulas mais rapido do que validacao por quiz.')
    urgencyScore += 14
  }

  if ((profile.consistency.daysSinceLastActivity ?? 0) >= 5) {
    shortTermRisks.push('Risco de perder continuidade do conteudo por afastamento recente.')
    urgencyScore += 14
  }

  if (profile.recentLowPerformanceLessons.length > 0) {
    shortTermRisks.push(`Baixo desempenho recente em ${profile.recentLowPerformanceLessons[0].lessonTitle}.`)
    urgencyScore += 12
  }

  if (profile.dominatedTopics.length > 0) {
    opportunities.push(`Ja existe base para avancar em ${profile.dominatedTopics.slice(0, 2).join(' e ')}.`)
  }

  if (profile.studyVelocity.trend === 'improving') {
    opportunities.push('Seu desempenho recente mostra melhora e pode sustentar um proximo passo mais desafiador.')
    urgencyScore -= 10
  }

  if (!profile.studyGoal) {
    pedagogicalAlerts.push('Falta contexto declarado de objetivo, o que limita a personalizacao do mentor.')
    urgencyScore += 8
  }

  const status =
    urgencyScore >= 55 ? 'critical'
      : urgencyScore >= 32 ? 'attention'
        : 'good'

  const summary =
    status === 'critical'
      ? 'Seu momento pede intervencao mais direta do mentor para evitar acumulo de lacunas.'
      : status === 'attention'
        ? 'Existe progresso, mas alguns sinais indicam que voce precisa reorganizar a forma de estudar.'
        : 'Seu aprendizado esta em boa evolucao e o foco agora e consolidar e avancar com criterio.'

  return {
    status,
    summary,
    urgencyScore,
    confidence: Math.min(0.95, 0.45 + profile.topicErrors.length * 0.05 + profile.recentEngagement.quizzesCompletedLast28Days * 0.04),
    centralProblems,
    pedagogicalAlerts,
    shortTermRisks,
    opportunities,
    focusTopics,
  }
}
