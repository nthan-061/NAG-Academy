export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  xp: number
  streak_days: number
  last_activity_date: string | null
  created_at: string
}

export interface Trilha {
  id: string
  titulo: string
  descricao: string | null
  nivel: 'iniciante' | 'intermediario' | 'avancado'
  thumbnail_url: string | null
  categoria: string | null
  ordem: number
  publicada: boolean
  created_at: string
}

export interface Modulo {
  id: string
  trilha_id: string
  titulo: string
  descricao: string | null
  ordem: number
  created_at: string
}

export interface Aula {
  id: string
  modulo_id: string
  titulo: string
  youtube_url: string
  youtube_id: string
  transcricao: string | null
  resumo: string | null
  topicos: string[]
  duracao_segundos: number | null
  thumbnail_url: string | null
  ordem: number
  processada: boolean
  created_at: string
}

export interface QuizPergunta {
  id: string
  aula_id: string
  pergunta: string
  opcoes: string[]
  resposta_correta: number
  explicacao: string
  topico: string | null
  dificuldade: 'facil' | 'medio' | 'dificil'
  created_at: string
}

export interface UserProgresso {
  id: string
  user_id: string
  aula_id: string
  assistida: boolean
  quiz_completado: boolean
  acertos: number
  total_perguntas: number
  percentual_acerto: number | null
  xp_ganho: number
  completed_at: string | null
  notas?: string | null
}

export interface Flashcard {
  id: string
  user_id: string
  pergunta_id: string | null
  frente: string
  verso: string
  topico: string | null
  intervalo_dias: number
  facilidade: number
  repeticoes: number
  proxima_revisao: string
  ultima_revisao: string | null
  created_at: string
}

export interface UserDominio {
  id: string
  user_id: string
  topico: string
  acertos: number
  total: number
  percentual: number
  updated_at: string
}
