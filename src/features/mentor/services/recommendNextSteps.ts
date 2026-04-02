import type { MentorPerformanceAnalysis, MentorRecommendation, UserLearningProfile } from '../types'

export function recommendNextSteps(
  profile: UserLearningProfile,
  analysis: MentorPerformanceAnalysis,
): MentorRecommendation[] {
  const recommendations: MentorRecommendation[] = []

  if (profile.recentEngagement.pendingFlashcards > 0) {
    recommendations.push({
      id: 'review-flashcards',
      type: 'review_flashcards',
      title: 'Zerar a fila de revisao',
      message: `Voce tem ${profile.recentEngagement.pendingFlashcards} flashcards pendentes. Revisar isso agora melhora a retencao antes do proximo bloco de estudo.`,
      actionLabel: 'Revisar flashcards',
      priority: profile.recentEngagement.pendingFlashcards >= 8 ? 'high' : 'medium',
      action: {
        kind: 'route',
        href: '/flashcards',
      },
    })
  }

  if (profile.recentLowPerformanceLessons[0]) {
    const lesson = profile.recentLowPerformanceLessons[0]
    recommendations.push({
      id: 'retry-low-performance-quiz',
      type: 'retry_quiz',
      title: 'Refazer o quiz mais critico',
      message: `Seu pior resultado recente foi em ${lesson.lessonTitle}. Voltar a esse quiz ajuda a medir se a dificuldade ainda persiste.`,
      actionLabel: 'Refazer quiz',
      priority: 'high',
      action: {
        kind: 'route',
        href: `/aula/${lesson.lessonId}/quiz`,
        lessonId: lesson.lessonId,
        topic: lesson.topic,
      },
    })
  }

  if (profile.topicErrors[0]?.relatedLessonIds[0]) {
    recommendations.push({
      id: 'resume-topic-lesson',
      type: 'resume_lesson',
      title: `Retomar aula de ${profile.topicErrors[0].topic}`,
      message: `Existe erro recorrente nesse topico. Voltar para a aula associada pode destravar seu entendimento com menos friccao do que insistir apenas no quiz.`,
      actionLabel: 'Voltar para a aula',
      priority: 'high',
      action: {
        kind: 'route',
        href: `/aula/${profile.topicErrors[0].relatedLessonIds[0]}`,
        lessonId: profile.topicErrors[0].relatedLessonIds[0],
        topic: profile.topicErrors[0].topic,
      },
    })
  }

  if (!profile.studyGoal) {
    recommendations.push({
      id: 'clarify-goal',
      type: 'clarify_goal',
      title: 'Definir seu objetivo com o mentor',
      message: 'Quanto mais claro for seu objetivo, mais especificas ficam as recomendacoes do mentor.',
      actionLabel: 'Responder no chat',
      priority: 'medium',
      action: {
        kind: 'question',
        prompt: 'Meu objetivo com Google Ads e...',
      },
    })
  }

  if (analysis.status === 'good' && profile.nextSuggestedLesson) {
    recommendations.push({
      id: 'advance-content',
      type: 'advance_content',
      title: 'Avancar para o proximo conteudo',
      message: `Seu momento permite avancar para ${profile.nextSuggestedLesson.titulo} sem perder o controle do aprendizado.`,
      actionLabel: 'Ir para proxima aula',
      priority: 'low',
      action: {
        kind: 'route',
        href: `/aula/${profile.nextSuggestedLesson.id}`,
        lessonId: profile.nextSuggestedLesson.id,
      },
    })
  }

  if (recommendations.length === 0) {
    recommendations.push({
      id: 'mentor-reflection',
      type: 'mentor_reflection',
      title: 'Conversar com o mentor para refinar o diagnostico',
      message: 'Seu perfil ainda esta em consolidacao. Uma conversa curta ajuda a entender contexto, objetivo e travas atuais.',
      actionLabel: 'Abrir conversa',
      priority: 'medium',
      action: {
        kind: 'question',
        prompt: 'Quero entender melhor onde estou travando no meu aprendizado.',
      },
    })
  }

  return recommendations.slice(0, 4)
}
