import type { MentorInsight, MentorPerformanceAnalysis, UserLearningProfile } from '../types'

export function generateInsights(
  profile: UserLearningProfile,
  analysis: MentorPerformanceAnalysis,
): MentorInsight[] {
  const insights: MentorInsight[] = []

  if (profile.topicErrors[0] && profile.topicErrors[0].errorRate >= 0.45) {
    insights.push({
      id: 'topic-errors-primary',
      title: `Erros repetidos em ${profile.topicErrors[0].topic}`,
      message: `Voce esta repetindo erros em ${profile.topicErrors[0].topic} e isso esta travando seu avanco nas aulas relacionadas. A taxa de erro nesse tema ja esta em ${Math.round(profile.topicErrors[0].errorRate * 100)}%.`,
      tone: 'warning',
      priority: 'high',
      relatedTopic: profile.topicErrors[0].topic,
      actionHint: 'Retome a aula ou refaca o quiz desse topico antes de seguir para novos conteudos.',
    })
  }

  if (profile.consistency.recentDrop) {
    insights.push({
      id: 'consistency-drop',
      title: 'Seu ritmo caiu nos ultimos dias',
      message: 'Seu volume recente de estudo caiu em relacao ao ciclo anterior. Isso costuma afetar retencao e aumentar a chance de voltar a errar temas que voce ja tinha visto.',
      tone: 'warning',
      priority: 'high',
      actionHint: 'Um bloco curto de revisao hoje ja ajuda a recuperar o ritmo.',
    })
  }

  if (profile.recentEngagement.pendingFlashcards > 0) {
    insights.push({
      id: 'flashcards-backlog',
      title: 'Sua revisao esta acumulando',
      message: `Ha ${profile.recentEngagement.pendingFlashcards} flashcards pendentes. Quando essa fila cresce, voce tende a revisar menos os erros que mais importam.`,
      tone: 'focus',
      priority: profile.recentEngagement.pendingFlashcards >= 8 ? 'high' : 'medium',
      actionHint: 'Priorize a fila de flashcards antes de consumir muito conteudo novo.',
    })
  }

  if (profile.dominatedTopics[0]) {
    insights.push({
      id: 'dominated-topic',
      title: `Base consolidada em ${profile.dominatedTopics[0]}`,
      message: `Voce ja demonstra dominio funcional em ${profile.dominatedTopics[0]}. Isso indica que pode comecar a subir o nivel ou aplicar esse tema em cenarios mais complexos.`,
      tone: 'opportunity',
      priority: 'medium',
      relatedTopic: profile.dominatedTopics[0],
      actionHint: 'Busque uma aula mais avancada ou um quiz mais desafiador no mesmo eixo.',
    })
  }

  if (!profile.studyGoal) {
    insights.push({
      id: 'missing-goal',
      title: 'O mentor ainda conhece pouco seu objetivo',
      message: 'Sem saber se voce estuda para uso proprio, trabalho, cliente ou crescimento profissional, eu consigo orientar menos do que poderia.',
      tone: 'focus',
      priority: 'medium',
      actionHint: 'Conte ao mentor qual resultado voce quer atingir com a plataforma.',
    })
  }

  if (analysis.status === 'good') {
    insights.push({
      id: 'positive-momentum',
      title: 'Seu momento e de consolidacao com avanco controlado',
      message: 'Seu historico recente nao mostra alerta grave. O mentor enxerga espaco para manter consistencia e avancar sem pular etapas essenciais.',
      tone: 'encouragement',
      priority: 'low',
    })
  }

  return insights.slice(0, 5)
}
