import type { Flashcard, Profile, QuizPergunta, Trilha, UserDominio, UserProgresso } from '@/types'

export type MentorEstimatedLevel = 'iniciante' | 'intermediario' | 'avancado'
export type MentorAnalysisStatus = 'good' | 'attention' | 'critical'
export type MentorTrendDirection = 'improving' | 'stable' | 'declining'
export type MentorInsightPriority = 'low' | 'medium' | 'high'
export type MentorInsightTone = 'encouragement' | 'focus' | 'warning' | 'opportunity'
export type MentorRecommendationType =
  | 'resume_lesson'
  | 'retry_quiz'
  | 'review_flashcards'
  | 'study_topic'
  | 'advance_content'
  | 'clarify_goal'
  | 'mentor_reflection'

export interface MentorUserContext {
  user_id: string
  goal: string | null
  experience_level: 'nenhuma' | 'iniciante' | 'intermediaria' | 'avancada' | null
  use_case: 'uso-proprio' | 'profissional' | 'cliente' | 'equipe' | null
  ad_budget_range: string | null
  prior_experience: string | null
  declared_challenges: string[]
  notes: string | null
  created_at: string
  updated_at: string
}

export interface MentorChatMessage {
  id: string
  user_id: string
  role: 'user' | 'assistant'
  content: string
  metadata: Record<string, unknown>
  created_at: string
}

export interface MentorResolvedLesson {
  id: string
  titulo: string
  topicos: string[]
  ordem: number
  modulo: {
    id: string
    titulo: string
    ordem: number
  } | null
  trilha: {
    id: string
    titulo: string
    ordem: number
  } | null
}

export interface MentorQuizAnswer {
  id: string
  correta: boolean
  created_at: string
  pergunta: Pick<QuizPergunta, 'id' | 'pergunta' | 'topico' | 'aula_id' | 'explicacao'>
  aula: MentorResolvedLesson | null
}

export interface MentorProgressEntry extends UserProgresso {
  aula: MentorResolvedLesson | null
}

export interface MentorDataSnapshot {
  profile: Profile
  mentorContext: MentorUserContext | null
  progress: MentorProgressEntry[]
  answers: MentorQuizAnswer[]
  dominio: UserDominio[]
  flashcards: Flashcard[]
  chatHistory: MentorChatMessage[]
  publishedLessons: MentorResolvedLesson[]
  publishedTrilhas: Trilha[]
}

export interface UserTopicErrorStat {
  topic: string
  errorRate: number
  errorCount: number
  totalAnswers: number
  recentErrorCount: number
  trend: MentorTrendDirection
  relatedLessonIds: string[]
  relatedLessonTitles: string[]
}

export interface UserBehaviorPattern {
  id: string
  label: string
  description: string
  severity: MentorInsightPriority
}

export interface UserLearningProfile {
  userId: string
  userName: string
  estimatedLevel: {
    label: MentorEstimatedLevel
    confidence: number
    reason: string
  }
  studyGoal?: string | null
  objective?: string | null
  strengths: string[]
  weakPoints: string[]
  topicErrors: UserTopicErrorStat[]
  dominatedTopics: string[]
  criticalTopics: string[]
  consistency: {
    streakDays: number
    activeDaysLast7: number
    activeDaysLast28: number
    consistencyScore: number
    daysSinceLastActivity: number | null
    recentDrop: boolean
  }
  recentEngagement: {
    lessonsCompletedLast7Days: number
    lessonsCompletedLast28Days: number
    quizzesCompletedLast7Days: number
    quizzesCompletedLast28Days: number
    pendingFlashcards: number
    overdueFlashcards: number
    totalFlashcards: number
  }
  studyVelocity: {
    completionRate: number
    quizAccuracy: number
    recentAccuracy: number
    trend: MentorTrendDirection
  }
  behavioralPatterns: UserBehaviorPattern[]
  evolutionTrend: {
    direction: MentorTrendDirection
    deltaAccuracy: number
    deltaActivity: number
  }
  studyMaturity: 'inicial' | 'em_desenvolvimento' | 'consistente' | 'avancada'
  recentLowPerformanceLessons: Array<{
    lessonId: string
    lessonTitle: string
    accuracy: number
    topic: string
  }>
  nextSuggestedLesson: MentorResolvedLesson | null
  mentorContext: MentorUserContext | null
}

export interface MentorPerformanceAnalysis {
  status: MentorAnalysisStatus
  summary: string
  urgencyScore: number
  confidence: number
  centralProblems: string[]
  pedagogicalAlerts: string[]
  shortTermRisks: string[]
  opportunities: string[]
  focusTopics: string[]
}

export interface MentorInsight {
  id: string
  title: string
  message: string
  tone: MentorInsightTone
  priority: MentorInsightPriority
  relatedTopic?: string
  actionHint?: string
}

export interface MentorRecommendation {
  id: string
  type: MentorRecommendationType
  title: string
  message: string
  actionLabel: string
  priority: MentorInsightPriority
  action: {
    kind: 'route' | 'question' | 'refresh'
    href?: string
    topic?: string
    prompt?: string
    lessonId?: string
  }
}

export interface MentorChatResponse {
  reply: MentorChatMessage
  capturedContext: Partial<MentorUserContext> | null
  missingContext: string[]
}
