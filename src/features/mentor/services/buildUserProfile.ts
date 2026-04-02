import type { MentorDataSnapshot, UserBehaviorPattern, UserLearningProfile, UserTopicErrorStat } from '../types'
import {
  average,
  buildConsistencyScore,
  countDistinctStudyDays,
  determineTrend,
  differenceInDays,
  estimateLearningLevel,
  getTodayDateKey,
  isDateWithinWindow,
} from '../utils'

function buildTopicErrors(snapshot: MentorDataSnapshot): UserTopicErrorStat[] {
  const topicMap = new Map<string, UserTopicErrorStat>()
  const now = new Date()

  snapshot.answers.forEach((answer) => {
    const topic = answer.pergunta.topico ?? 'Geral'
    const existing = topicMap.get(topic) ?? {
      topic,
      errorRate: 0,
      errorCount: 0,
      totalAnswers: 0,
      recentErrorCount: 0,
      trend: 'stable',
      relatedLessonIds: [],
      relatedLessonTitles: [],
    }

    existing.totalAnswers += 1
    if (!answer.correta) existing.errorCount += 1

    const answerDate = new Date(answer.created_at)
    const diffDays = Math.floor((now.getTime() - answerDate.getTime()) / 86400000)
    if (!answer.correta && diffDays <= 14) existing.recentErrorCount += 1

    if (answer.aula?.id && !existing.relatedLessonIds.includes(answer.aula.id)) {
      existing.relatedLessonIds.push(answer.aula.id)
    }
    if (answer.aula?.titulo && !existing.relatedLessonTitles.includes(answer.aula.titulo)) {
      existing.relatedLessonTitles.push(answer.aula.titulo)
    }

    topicMap.set(topic, existing)
  })

  return [...topicMap.values()]
    .map((topic) => {
      const recentRate = topic.recentErrorCount / Math.max(topic.totalAnswers, 1)
      const historicalRate = topic.errorCount / Math.max(topic.totalAnswers, 1)
      return {
        ...topic,
        errorRate: historicalRate,
        trend: determineTrend(historicalRate, Math.max(historicalRate - recentRate, 0), 0.08),
      }
    })
    .sort((left, right) => right.errorRate - left.errorRate)
}

function buildBehaviorPatterns(profile: UserLearningProfile): UserBehaviorPattern[] {
  const patterns: UserBehaviorPattern[] = []

  if (profile.consistency.consistencyScore >= 72) {
    patterns.push({
      id: 'consistent-study',
      label: 'Constancia alta',
      description: 'Voce manteve frequencia boa de estudo recentemente e isso favorece retencao.',
      severity: 'low',
    })
  }

  if (profile.recentEngagement.pendingFlashcards >= 8) {
    patterns.push({
      id: 'flashcard-backlog',
      label: 'Acumulo de revisoes',
      description: 'Sua fila de flashcards esta crescendo e pode impactar a fixacao do conteudo.',
      severity: 'high',
    })
  }

  const quizCoverage = profile.studyVelocity.completionRate
  if (quizCoverage < 0.55) {
    patterns.push({
      id: 'content-without-validation',
      label: 'Consome conteudo sem validar aprendizado',
      description: 'Voce assistiu aulas, mas concluiu poucos quizzes em relacao ao progresso total.',
      severity: 'medium',
    })
  }

  if (profile.topicErrors.some((topic) => topic.errorRate >= 0.55 && topic.totalAnswers >= 3)) {
    patterns.push({
      id: 'repeated-topic-errors',
      label: 'Erros recorrentes em topicos-chave',
      description: 'Existe repeticao de erros nos mesmos topicos, indicando dificuldade persistente.',
      severity: 'high',
    })
  }

  if (profile.consistency.recentDrop) {
    patterns.push({
      id: 'recent-drop',
      label: 'Queda recente de ritmo',
      description: 'Seu volume recente de estudo caiu quando comparado com o ciclo anterior.',
      severity: 'high',
    })
  }

  return patterns
}

function buildStrengths(snapshot: MentorDataSnapshot, topicErrors: UserTopicErrorStat[], recentAccuracy: number, consistencyScore: number) {
  const strengths: string[] = []

  if (recentAccuracy >= 0.75) {
    strengths.push('Bom aproveitamento recente em quizzes.')
  }

  if (consistencyScore >= 70) {
    strengths.push('Ritmo de estudo consistente nas ultimas semanas.')
  }

  const dominatedTopics = snapshot.dominio.filter((item) => Number(item.percentual) >= 75)
  if (dominatedTopics.length > 0) {
    strengths.push(`Dominio consolidado em ${dominatedTopics.slice(0, 2).map((item) => item.topico).join(' e ')}.`)
  }

  if (topicErrors.length > 0 && topicErrors[0].errorRate <= 0.3) {
    strengths.push('Baixa taxa de erro nos topicos mais recorrentes.')
  }

  return strengths
}

function buildWeakPoints(profile: Omit<UserLearningProfile, 'behavioralPatterns'>) {
  const weakPoints: string[] = []

  profile.topicErrors
    .filter((topic) => topic.errorRate >= 0.45 && topic.totalAnswers >= 3)
    .slice(0, 3)
    .forEach((topic) => {
      weakPoints.push(`Dificuldade recorrente em ${topic.topic}.`)
    })

  if (profile.consistency.recentDrop) {
    weakPoints.push('Queda recente de consistencia no estudo.')
  }

  if (profile.recentEngagement.pendingFlashcards >= 6) {
    weakPoints.push('Revisoes pendentes altas para o momento atual.')
  }

  return weakPoints
}

export async function buildUserProfile(snapshot: MentorDataSnapshot): Promise<UserLearningProfile> {
  const allStudyDates = [
    ...snapshot.progress.map((item) => item.completed_at).filter(Boolean) as string[],
    ...snapshot.answers.map((item) => item.created_at),
    ...snapshot.flashcards.map((item) => item.ultima_revisao).filter(Boolean) as string[],
  ]

  const quizzesCompleted = snapshot.progress.filter((item) => item.quiz_completado)
  const lessonsCompleted = snapshot.progress.filter((item) => item.assistida)
  const answeredQuestions = snapshot.answers.length
  const overallAccuracy = average(snapshot.answers.map((answer) => (answer.correta ? 1 : 0)))
  const recentAnswers = snapshot.answers.filter((answer) => isDateWithinWindow(answer.created_at, 14))
  const previousAnswers = snapshot.answers.filter((answer) => {
    const diff = differenceInDays(answer.created_at)
    return diff !== null && diff > 14 && diff <= 28
  })
  const recentAccuracy = average(recentAnswers.map((answer) => (answer.correta ? 1 : 0)))
  const previousAccuracy = average(previousAnswers.map((answer) => (answer.correta ? 1 : 0)))
  const activeDaysLast7 = countDistinctStudyDays(allStudyDates, 7)
  const activeDaysLast28 = countDistinctStudyDays(allStudyDates, 28)
  const consistencyScore = buildConsistencyScore(activeDaysLast7, activeDaysLast28, snapshot.profile.streak_days)
  const daysSinceLastActivity = differenceInDays(snapshot.profile.last_activity_date)
  const recentDrop = activeDaysLast7 <= 1 && activeDaysLast28 >= 5
  const topicErrors = buildTopicErrors(snapshot)
  const criticalTopics = topicErrors.filter((topic) => topic.errorRate >= 0.5 && topic.totalAnswers >= 3).map((topic) => topic.topic)
  const dominatedTopics = snapshot.dominio.filter((item) => Number(item.percentual) >= 75).map((item) => item.topico)
  const pendingFlashcards = snapshot.flashcards.filter((item) => item.proxima_revisao <= getTodayDateKey()).length
  const overdueFlashcards = snapshot.flashcards.filter((item) => item.proxima_revisao < getTodayDateKey()).length
  const completionRate = lessonsCompleted.length === 0 ? 0 : quizzesCompleted.length / lessonsCompleted.length
  const level = estimateLearningLevel(snapshot.profile.xp, overallAccuracy, answeredQuestions)

  const completedLessonIds = new Set(lessonsCompleted.map((item) => item.aula_id))
  const nextSuggestedLesson = snapshot.publishedLessons.find((lesson) => !completedLessonIds.has(lesson.id)) ?? null

  const recentLowPerformanceLessons = quizzesCompleted
    .filter((item) => (item.percentual_acerto ?? 0) < 60 && item.aula)
    .slice(0, 3)
    .map((item) => ({
      lessonId: item.aula!.id,
      lessonTitle: item.aula!.titulo,
      accuracy: item.percentual_acerto ?? 0,
      topic: item.aula!.topicos?.[0] ?? topicErrors[0]?.topic ?? 'Geral',
    }))

  const evolutionDirection = determineTrend(recentAccuracy, previousAccuracy, 0.08)
  const deltaActivity = activeDaysLast7 - Math.max(activeDaysLast28 / 4, 0)

  const baseProfile = {
    userId: snapshot.profile.id,
    userName: snapshot.profile.full_name?.split(' ')[0] ?? 'voce',
    estimatedLevel: level,
    studyGoal: snapshot.mentorContext?.goal ?? null,
    objective: snapshot.mentorContext?.goal ?? null,
    strengths: buildStrengths(snapshot, topicErrors, recentAccuracy, consistencyScore),
    weakPoints: [] as string[],
    topicErrors,
    dominatedTopics,
    criticalTopics,
    consistency: {
      streakDays: snapshot.profile.streak_days,
      activeDaysLast7,
      activeDaysLast28,
      consistencyScore,
      daysSinceLastActivity,
      recentDrop,
    },
    recentEngagement: {
      lessonsCompletedLast7Days: lessonsCompleted.filter((item) => isDateWithinWindow(item.completed_at, 7)).length,
      lessonsCompletedLast28Days: lessonsCompleted.filter((item) => isDateWithinWindow(item.completed_at, 28)).length,
      quizzesCompletedLast7Days: quizzesCompleted.filter((item) => isDateWithinWindow(item.completed_at, 7)).length,
      quizzesCompletedLast28Days: quizzesCompleted.filter((item) => isDateWithinWindow(item.completed_at, 28)).length,
      pendingFlashcards,
      overdueFlashcards,
      totalFlashcards: snapshot.flashcards.length,
    },
    studyVelocity: {
      completionRate,
      quizAccuracy: overallAccuracy,
      recentAccuracy,
      trend: evolutionDirection,
    },
    evolutionTrend: {
      direction: determineTrend(recentAccuracy, previousAccuracy, 0.08),
      deltaAccuracy: recentAccuracy - previousAccuracy,
      deltaActivity,
    },
    studyMaturity:
      consistencyScore >= 72 && overallAccuracy >= 0.72
        ? 'avancada'
        : consistencyScore >= 55 || overallAccuracy >= 0.58
          ? 'consistente'
          : quizzesCompleted.length >= 3
            ? 'em_desenvolvimento'
            : 'inicial',
    recentLowPerformanceLessons,
    nextSuggestedLesson,
    mentorContext: snapshot.mentorContext,
  } satisfies Omit<UserLearningProfile, 'behavioralPatterns'>

  const weakPoints = buildWeakPoints(baseProfile)
  const profile: UserLearningProfile = {
    ...baseProfile,
    weakPoints,
    behavioralPatterns: buildBehaviorPatterns({
      ...baseProfile,
      weakPoints,
      behavioralPatterns: [],
    }),
  }

  if (profile.strengths.length === 0) {
    profile.strengths.push('Base inicial de estudo ja registrada na plataforma.')
  }

  if (profile.weakPoints.length === 0) {
    profile.weakPoints.push('Nao ha fragilidades graves, mas ainda existe espaco para consolidar o aprendizado recente.')
  }

  return profile
}
