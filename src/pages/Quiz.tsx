import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { X, CheckCircle, XCircle, ChevronRight, BookOpen, Layers } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { XPToast } from '@/components/ui/Toast'
import { XP as XP_VALUES } from '@/lib/xp'
import type { QuizPergunta, Aula } from '@/types'

type Estado = 'respondendo' | 'confirmado' | 'resultado'

interface RespostaInfo {
  perguntaId: string
  escolhida: number
  correta: boolean
  topico: string
}

// ---------- Opção do quiz ----------
function OpcaoQuiz({
  texto,
  index,
  estado,
  selecionada,
  correta,
  onSelect,
}: {
  texto: string
  index: number
  estado: Estado
  selecionada: boolean
  correta: boolean
  onSelect: () => void
}) {
  const letras = ['A', 'B', 'C', 'D']
  const confirmado = estado === 'confirmado'

  let bg = '#FFFFFF'
  let borderColor = '#E8ECF2'
  let textColor = '#1A1F2E'
  let icon = null

  if (confirmado && selecionada && correta) {
    bg = '#F0FDF4'; borderColor = '#16A34A'; textColor = '#16A34A'
    icon = <CheckCircle size={18} strokeWidth={1.5} style={{ color: '#16A34A', flexShrink: 0 }} />
  } else if (confirmado && selecionada && !correta) {
    bg = '#FEF2F2'; borderColor = '#DC2626'; textColor = '#DC2626'
    icon = <XCircle size={18} strokeWidth={1.5} style={{ color: '#DC2626', flexShrink: 0 }} />
  } else if (confirmado && correta) {
    bg = '#F0FDF4'; borderColor = '#16A34A'; textColor = '#16A34A'
    icon = <CheckCircle size={18} strokeWidth={1.5} style={{ color: '#16A34A', flexShrink: 0 }} />
  } else if (!confirmado && selecionada) {
    bg = '#EBF0FA'; borderColor = '#2E5FD4'
  }

  const letterBg = selecionada || (confirmado && correta) ? borderColor : '#E8ECF2'
  const letterColor = selecionada || (confirmado && correta) ? '#FFFFFF' : '#9CA3AF'

  return (
    <button
      onClick={confirmado ? undefined : onSelect}
      disabled={confirmado}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
        padding: '16px 20px', borderRadius: '12px', textAlign: 'left',
        border: `1px solid ${borderColor}`, backgroundColor: bg, color: textColor,
        cursor: confirmado ? 'default' : 'pointer', fontFamily: 'inherit',
        transition: 'border-color 0.15s',
      }}
      onMouseEnter={(e) => {
        if (!confirmado && !selecionada)
          (e.currentTarget as HTMLElement).style.borderColor = '#0D1B3E'
      }}
      onMouseLeave={(e) => {
        if (!confirmado && !selecionada)
          (e.currentTarget as HTMLElement).style.borderColor = borderColor
      }}
    >
      <span
        style={{
          width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '12px', fontWeight: 700,
          backgroundColor: letterBg, color: letterColor,
        }}
      >
        {letras[index]}
      </span>
      <span style={{ flex: 1, fontSize: '14px', lineHeight: '1.6' }}>{texto}</span>
      {icon}
    </button>
  )
}

// ---------- Tela de resultado ----------
function TelaResultado({
  acertos,
  total,
  xpGanho,
  flashcardsCount,
  aulaId,
  onShowToast,
}: {
  acertos: number
  total: number
  xpGanho: number
  flashcardsCount: number
  aulaId: string
  onShowToast: () => void
}) {
  const [score, setScore] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    onShowToast()
    const step = Math.ceil(acertos / 30)
    let current = 0
    const interval = setInterval(() => {
      current = Math.min(current + step, acertos)
      setScore(current)
      if (current >= acertos) clearInterval(interval)
    }, 40)
    return () => clearInterval(interval)
  }, [acertos, onShowToast])

  const pct = Math.round((acertos / total) * 100)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', padding: '32px 0', textAlign: 'center' }} className="animate-slideUp">
      {/* Score animado */}
      <div
        className="w-32 h-32 rounded-full flex flex-col items-center justify-center"
        style={{ background: `conic-gradient(#0D1B3E ${pct * 3.6}deg, #E8ECF2 0deg)` }}
      >
        <div className="w-24 h-24 rounded-full flex flex-col items-center justify-center bg-white">
          <span className="text-2xl font-bold" style={{ color: '#1A1F2E' }}>
            {score}
          </span>
          <span className="text-xs" style={{ color: '#9CA3AF' }}>de {total}</span>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-1" style={{ color: '#1A1F2E' }}>
          {pct >= 80 ? 'Excelente trabalho!' : pct >= 60 ? 'Bom resultado!' : 'Continue praticando!'}
        </h2>
        <p className="text-sm" style={{ color: '#6B7280' }}>
          Você acertou {acertos} de {total} questões
        </p>
      </div>

      {/* Stats */}
      <div className="flex gap-6">
        <div
          className="flex flex-col items-center gap-1 px-6 py-4 rounded-xl"
          style={{ backgroundColor: '#FEF9C3' }}
        >
          <span className="text-2xl font-bold" style={{ color: '#D4A017' }}>
            +{xpGanho}
          </span>
          <span className="text-xs" style={{ color: '#D97706' }}>XP ganhos</span>
        </div>
        {flashcardsCount > 0 && (
          <div
            className="flex flex-col items-center gap-1 px-6 py-4 rounded-xl"
            style={{ backgroundColor: '#EBF0FA' }}
          >
            <span className="text-2xl font-bold" style={{ color: '#2E5FD4' }}>
              {flashcardsCount}
            </span>
            <span className="text-xs" style={{ color: '#2E5FD4' }}>flashcards criados</span>
          </div>
        )}
      </div>

      {/* Ações */}
      <div className="flex gap-3 flex-wrap justify-center">
        {flashcardsCount > 0 && (
          <button
            onClick={() => navigate('/flashcards')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
            style={{ backgroundColor: '#EBF0FA', color: '#2E5FD4', border: '1px solid #2E5FD4' }}
          >
            <Layers size={16} strokeWidth={1.5} />
            Revisar flashcards agora
          </button>
        )}
        <Link
          to={`/aula/${aulaId}`}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors"
          style={{ backgroundColor: '#0D1B3E' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1E3A6E' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#0D1B3E' }}
        >
          <BookOpen size={16} strokeWidth={1.5} />
          Voltar para a aula
          <ChevronRight size={16} strokeWidth={1.5} />
        </Link>
      </div>
    </div>
  )
}

// ---------- Página principal ----------
export function Quiz() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [aula, setAula] = useState<Aula | null>(null)
  const [perguntas, setPerguntas] = useState<QuizPergunta[]>([])
  const [indice, setIndice] = useState(0)
  const [selecionada, setSelecionada] = useState<number | null>(null)
  const [estado, setEstado] = useState<Estado>('respondendo')
  const [respostas, setRespostas] = useState<RespostaInfo[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showToast, setShowToast] = useState(false)
  const [xpGanho, setXpGanho] = useState(0)
  const [flashcardsCount, setFlashcardsCount] = useState(0)

  useEffect(() => {
    if (!id) return

    async function load() {
      const [{ data: aulaData }, { data: { user } }] = await Promise.all([
        supabase.from('aulas').select('*').eq('id', id!).single(),
        supabase.auth.getUser(),
      ])

      if (!aulaData) { setLoading(false); return }
      setAula(aulaData)

      const { data: pData } = await supabase
        .from('quiz_perguntas')
        .select('*')
        .eq('aula_id', id!)

      const shuffled = (pData ?? []).sort(() => Math.random() - 0.5).slice(0, 10)
      setPerguntas(shuffled)

      if (user) setUserId(user.id)
      setLoading(false)
    }

    load()
  }, [id])

  const perguntaAtual = perguntas[indice]
  const totalPerguntas = perguntas.length

  function confirmar() {
    if (selecionada === null || !perguntaAtual) return
    const correta = selecionada === perguntaAtual.resposta_correta
    setRespostas((prev) => [
      ...prev,
      {
        perguntaId: perguntaAtual.id,
        escolhida: selecionada,
        correta,
        topico: perguntaAtual.topico ?? 'Geral',
      },
    ])
    setEstado('confirmado')
  }

  async function proxima() {
    if (indice < totalPerguntas - 1) {
      setIndice((i) => i + 1)
      setSelecionada(null)
      setEstado('respondendo')
    } else {
      await finalizarQuiz()
      setEstado('resultado')
    }
  }

  async function finalizarQuiz() {
    if (!userId || !id) return

    const acertos = respostas.filter((r) => r.correta).length
    const total = respostas.length
    const pct = total > 0 ? Math.round((acertos / total) * 100) : 0
    const perfeito = acertos === total

    const xp =
      XP_VALUES.quiz_completado +
      acertos * XP_VALUES.por_acerto +
      (perfeito ? XP_VALUES.quiz_perfeito : 0)

    setXpGanho(xp)

    await supabase.from('user_respostas').insert(
      respostas.map((r) => ({
        user_id: userId,
        pergunta_id: r.perguntaId,
        resposta_escolhida: r.escolhida,
        correta: r.correta,
      }))
    )

    await supabase.from('user_progresso').upsert(
      {
        user_id: userId,
        aula_id: id,
        assistida: true,
        quiz_completado: true,
        acertos,
        total_perguntas: total,
        percentual_acerto: pct,
        xp_ganho: xp,
        completed_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,aula_id' }
    )

    const { data: profile } = await supabase
      .from('profiles')
      .select('xp, streak_days, last_activity_date')
      .eq('id', userId)
      .single()

    const hoje = new Date().toISOString().split('T')[0]
    const ultimaAtividade = profile?.last_activity_date
    const novoStreak =
      ultimaAtividade === hoje
        ? profile?.streak_days ?? 1
        : ultimaAtividade === new Date(Date.now() - 86400000).toISOString().split('T')[0]
        ? (profile?.streak_days ?? 0) + 1
        : 1

    await supabase
      .from('profiles')
      .update({ xp: (profile?.xp ?? 0) + xp, streak_days: novoStreak, last_activity_date: hoje })
      .eq('id', userId)

    const topicosMap: Record<string, { acertos: number; total: number }> = {}
    respostas.forEach((r) => {
      const t = r.topico
      if (!topicosMap[t]) topicosMap[t] = { acertos: 0, total: 0 }
      topicosMap[t].total++
      if (r.correta) topicosMap[t].acertos++
    })

    for (const [topico, vals] of Object.entries(topicosMap)) {
      const { data: existing } = await supabase
        .from('user_dominio')
        .select('*')
        .eq('user_id', userId)
        .eq('topico', topico)
        .maybeSingle()

      const novoTotal = (existing?.total ?? 0) + vals.total
      const novosAcertos = (existing?.acertos ?? 0) + vals.acertos
      const novoPct = novoTotal > 0 ? Math.round((novosAcertos / novoTotal) * 100) : 0

      await supabase.from('user_dominio').upsert(
        {
          user_id: userId,
          topico,
          acertos: novosAcertos,
          total: novoTotal,
          percentual: novoPct,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,topico' }
      )
    }

    const erros = respostas.filter((r) => !r.correta)
    if (erros.length > 0) {
      const perguntasMap: Record<string, QuizPergunta> = {}
      perguntas.forEach((p) => { perguntasMap[p.id] = p })

      const flashcards = erros
        .map((r) => {
          const p = perguntasMap[r.perguntaId]
          if (!p) return null
          return {
            user_id: userId,
            pergunta_id: p.id,
            frente: p.pergunta,
            verso: `${p.opcoes[p.resposta_correta]}\n\n${p.explicacao}`,
            topico: p.topico ?? 'Geral',
            proxima_revisao: new Date().toISOString().split('T')[0],
          }
        })
        .filter(Boolean)

      if (flashcards.length > 0) {
        await supabase.from('flashcards').insert(flashcards)
        setFlashcardsCount(flashcards.length)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F6FA' }}>
        <div className="w-8 h-8 border-2 border-[#0D1B3E] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!aula || perguntas.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ backgroundColor: '#F5F6FA' }}>
        <p className="text-base font-medium" style={{ color: '#1A1F2E' }}>
          Nenhuma pergunta disponível para esta aula.
        </p>
        <Link to={`/aula/${id}`} className="text-sm" style={{ color: '#2E5FD4' }}>
          Voltar para a aula
        </Link>
      </div>
    )
  }

  return (
    <div style={{ marginLeft: '240px', paddingTop: '56px', minHeight: 'calc(100vh - 56px)', backgroundColor: '#F5F6FA' }}>
      {/* Header do quiz */}
      <div
        style={{
          position: 'sticky', top: '56px', zIndex: 10,
          height: '56px', padding: '0 24px',
          display: 'flex', alignItems: 'center', gap: '16px',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E8ECF2',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}
      >
        <button
          onClick={() => {
            if (confirm('Sair do quiz? Seu progresso será perdido.')) navigate(`/aula/${id}`)
          }}
          className="p-1.5 rounded-lg transition-colors hover:bg-[#EBF0FA]"
        >
          <X size={20} strokeWidth={1.5} style={{ color: '#6B7280' }} />
        </button>

        <div className="flex-1 flex flex-col gap-1">
          <p className="text-xs font-medium" style={{ color: '#9CA3AF' }}>
            {estado !== 'resultado'
              ? `Pergunta ${indice + 1} de ${totalPerguntas}`
              : 'Resultado final'}
          </p>
          {estado !== 'resultado' && (
            <div className="w-full rounded-full overflow-hidden" style={{ height: '4px', backgroundColor: '#E8ECF2' }}>
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${((indice + (estado === 'confirmado' ? 1 : 0)) / totalPerguntas) * 100}%`,
                  backgroundColor: '#0D1B3E',
                }}
              />
            </div>
          )}
        </div>

        <span className="text-xs font-medium" style={{ color: '#9CA3AF' }}>
          {aula.titulo.slice(0, 30)}{aula.titulo.length > 30 ? '...' : ''}
        </span>
      </div>

      {/* Conteúdo */}
      <div style={{ padding: '32px 16px', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', minHeight: 'calc(100vh - 112px)' }}>
        <div
          className="animate-slideUp"
          style={{
            width: '100%', maxWidth: '672px',
            borderRadius: '16px', padding: '40px',
            backgroundColor: '#FFFFFF',
            boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
          }}
        >
          {estado === 'resultado' ? (
            <TelaResultado
              acertos={respostas.filter((r) => r.correta).length}
              total={respostas.length}
              xpGanho={xpGanho}
              flashcardsCount={flashcardsCount}
              aulaId={id!}
              onShowToast={() => setShowToast(true)}
            />
          ) : (
            <>
              <p style={{ fontSize: '18px', fontWeight: 600, color: '#1A1F2E', margin: '0 0 32px 0', lineHeight: '1.5' }}>
                {perguntaAtual?.pergunta}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                {perguntaAtual?.opcoes.map((opcao, i) => (
                  <OpcaoQuiz
                    key={i}
                    texto={opcao}
                    index={i}
                    estado={estado}
                    selecionada={selecionada === i}
                    correta={i === perguntaAtual.resposta_correta}
                    onSelect={() => setSelecionada(i)}
                  />
                ))}
              </div>

              {/* Feedback */}
              {estado === 'confirmado' && (
                <div
                  className="animate-slideUp"
                  style={{
                    backgroundColor: respostas.at(-1)?.correta ? '#F0FDF4' : '#FEF2F2',
                    border: `1px solid ${respostas.at(-1)?.correta ? '#86EFAC' : '#FECACA'}`,
                    padding: '16px 20px', borderRadius: '10px', marginBottom: '24px',
                  }}
                >
                  <p
                    className="font-semibold text-sm mb-1"
                    style={{ color: respostas.at(-1)?.correta ? '#16A34A' : '#DC2626' }}
                  >
                    <span className="flex items-center gap-1.5">
                      {respostas.at(-1)?.correta
                        ? <><CheckCircle size={15} strokeWidth={1.5} /> Correto!</>
                        : <><XCircle size={15} strokeWidth={1.5} /> Incorreto</>
                      }
                    </span>
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: '#6B7280' }}>
                    {perguntaAtual?.explicacao}
                  </p>
                  {!respostas.at(-1)?.correta && (
                    <p className="flex items-center gap-1.5 text-xs mt-2 font-medium" style={{ color: '#2E5FD4' }}>
                      <BookOpen size={13} strokeWidth={1.5} />
                      Este flashcard foi adicionado à sua revisão
                    </p>
                  )}
                </div>
              )}

              {/* Botão */}
              <button
                onClick={estado === 'respondendo' ? confirmar : proxima}
                disabled={selecionada === null && estado === 'respondendo'}
                style={{
                  width: '100%', height: '48px', borderRadius: '12px', border: 'none',
                  backgroundColor: (selecionada === null && estado === 'respondendo') ? '#E8ECF2' : '#0D1B3E',
                  color: (selecionada === null && estado === 'respondendo') ? '#9CA3AF' : '#FFFFFF',
                  fontSize: '15px', fontWeight: 600, cursor: (selecionada === null && estado === 'respondendo') ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                  transition: 'background-color 0.15s',
                }}
                onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = '#1E3A6E' }}
                onMouseLeave={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = '#0D1B3E' }}
              >
                {estado === 'respondendo'
                  ? 'Confirmar resposta'
                  : indice < totalPerguntas - 1
                  ? 'Próxima pergunta'
                  : 'Ver resultado'}
              </button>
            </>
          )}
        </div>
      </div>

      {showToast && (
        <XPToast xp={xpGanho} onDone={() => setShowToast(false)} />
      )}
    </div>
  )
}
