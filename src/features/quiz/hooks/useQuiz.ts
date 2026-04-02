import { useEffect, useState } from 'react'
import type { Aula, QuizPergunta } from '@/types'
import { finalizeQuizAttempt, getQuizSetupData } from '../services/quizService'
import type { QuizAnswerRecord, QuizFinalizeResult, QuizStatus } from '../types'

export function useQuiz(aulaId?: string) {
  const [aula, setAula] = useState<Aula | null>(null)
  const [perguntas, setPerguntas] = useState<QuizPergunta[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<QuizStatus>('respondendo')
  const [indice, setIndice] = useState(0)
  const [selecionada, setSelecionada] = useState<number | null>(null)
  const [respostas, setRespostas] = useState<QuizAnswerRecord[]>([])
  const [resultado, setResultado] = useState<QuizFinalizeResult | null>(null)
  const [showToast, setShowToast] = useState(false)

  useEffect(() => {
    if (!aulaId) return
    const resolvedAulaId = aulaId

    let active = true

    async function load() {
      setLoading(true)
      const setup = await getQuizSetupData(resolvedAulaId)

      if (!active) return

      setAula(setup?.aula ?? null)
      setPerguntas(setup?.perguntas ?? [])
      setUserId(setup?.userId ?? null)
      setLoading(false)
    }

    void load()

    return () => {
      active = false
    }
  }, [aulaId])

  const perguntaAtual = perguntas[indice] ?? null
  const totalPerguntas = perguntas.length
  const ultimaResposta = respostas.at(-1) ?? null

  function confirmAnswer() {
    if (selecionada === null || !perguntaAtual) return

    const correta = selecionada === perguntaAtual.resposta_correta
    setRespostas((current) => [
      ...current,
      {
        perguntaId: perguntaAtual.id,
        escolhida: selecionada,
        correta,
        topico: perguntaAtual.topico ?? 'Geral',
      },
    ])
    setStatus('confirmado')
  }

  async function advanceQuiz() {
    if (indice < totalPerguntas - 1) {
      setIndice((current) => current + 1)
      setSelecionada(null)
      setStatus('respondendo')
      return
    }

    if (!userId || !aulaId) return

    const finalResult = await finalizeQuizAttempt(userId, aulaId, respostas, perguntas)
    setResultado(finalResult)
    setStatus('resultado')
  }

  return {
    aula,
    perguntas,
    perguntaAtual,
    userId,
    loading,
    status,
    indice,
    selecionada,
    setSelecionada,
    respostas,
    ultimaResposta,
    totalPerguntas,
    resultado,
    showToast,
    setShowToast,
    confirmAnswer,
    advanceQuiz,
  }
}
