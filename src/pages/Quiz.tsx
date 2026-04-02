import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { X, CheckCircle, XCircle, ChevronRight, BookOpen, Layers, Target, Sparkles } from 'lucide-react'
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
    bg = '#F0FDF4'
    borderColor = '#16A34A'
    textColor = '#16A34A'
    icon = <CheckCircle size={18} strokeWidth={1.5} style={{ color: '#16A34A', flexShrink: 0 }} />
  } else if (confirmado && selecionada && !correta) {
    bg = '#FEF2F2'
    borderColor = '#DC2626'
    textColor = '#DC2626'
    icon = <XCircle size={18} strokeWidth={1.5} style={{ color: '#DC2626', flexShrink: 0 }} />
  } else if (confirmado && correta) {
    bg = '#F0FDF4'
    borderColor = '#16A34A'
    textColor = '#16A34A'
    icon = <CheckCircle size={18} strokeWidth={1.5} style={{ color: '#16A34A', flexShrink: 0 }} />
  } else if (!confirmado && selecionada) {
    bg = '#EBF0FA'
    borderColor = '#2E5FD4'
  }

  const letterBg = selecionada || (confirmado && correta) ? borderColor : '#E8ECF2'
  const letterColor = selecionada || (confirmado && correta) ? '#FFFFFF' : '#9CA3AF'

  return (
    <button
      onClick={confirmado ? undefined : onSelect}
      disabled={confirmado}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '16px 20px',
        borderRadius: '14px',
        textAlign: 'left',
        border: `1px solid ${borderColor}`,
        backgroundColor: bg,
        color: textColor,
        cursor: confirmado ? 'default' : 'pointer',
        fontFamily: 'inherit',
        transition: 'border-color 0.15s, transform 0.15s',
      }}
    >
      <span
        style={{
          width: '34px',
          height: '34px',
          borderRadius: '10px',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          fontWeight: 700,
          backgroundColor: letterBg,
          color: letterColor,
        }}
      >
        {letras[index]}
      </span>
      <span style={{ flex: 1, fontSize: '14px', lineHeight: '1.65' }}>{texto}</span>
      {icon}
    </button>
  )
}

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
    setScore(0)
    onShowToast()

    const step = Math.max(1, Math.ceil(acertos / 24))
    let current = 0
    const interval = setInterval(() => {
      current = Math.min(current + step, acertos)
      setScore(current)
      if (current >= acertos) clearInterval(interval)
    }, 32)

    return () => clearInterval(interval)
    // O resultado deve animar apenas ao entrar nesta tela, sem reiniciar a cada re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [acertos])

  const pct = total > 0 ? Math.round((acertos / total) * 100) : 0
  const titulo =
    pct >= 80 ? 'Excelente resultado' :
    pct >= 60 ? 'Bom resultado' :
    'Continue praticando'

  return (
    <div
      className="animate-slideUp"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '32px',
        width: '100%',
        padding: '12px 0',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '188px',
          height: '188px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `conic-gradient(#0D1B3E ${pct * 3.6}deg, #D9E1F0 0deg)`,
          boxShadow: '0 24px 60px rgba(13,27,62,0.16)',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: '-14px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(46,95,212,0.12) 0%, rgba(46,95,212,0) 70%)',
            zIndex: 0,
          }}
        />
        <div
          style={{
            width: '136px',
            height: '136px',
            borderRadius: '50%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#FFFFFF',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9)',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <span style={{ fontSize: '48px', fontWeight: 800, color: '#1A1F2E', lineHeight: 1 }}>
            {score}
          </span>
          <span style={{ fontSize: '14px', color: '#9CA3AF', marginTop: '6px', fontWeight: 500 }}>
            de {total}
          </span>
        </div>
      </div>

      <div style={{ maxWidth: '520px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <span
          style={{
            alignSelf: 'center',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '34px',
            padding: '0 16px',
            borderRadius: '999px',
            backgroundColor: '#EEF4FF',
            color: '#2E5FD4',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          Resultado Final
        </span>
        <h2 style={{ fontSize: '44px', fontWeight: 800, margin: 0, lineHeight: 1.02, letterSpacing: '-0.04em' }}>
          {titulo}
        </h2>
        <p style={{ fontSize: '19px', color: '#6B7280', margin: 0, lineHeight: 1.6 }}>
          Voce acertou {acertos} de {total} questoes.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: flashcardsCount > 0 ? 'repeat(auto-fit, minmax(220px, 1fr))' : 'minmax(240px, 1fr)',
          gap: '18px',
          width: '100%',
          maxWidth: flashcardsCount > 0 ? '620px' : '280px',
        }}
      >
        <div
          style={{
            padding: '22px 22px',
            borderRadius: '22px',
            background: 'linear-gradient(135deg, #FFF8DB 0%, #FFF0B5 100%)',
            border: '1px solid #FDE68A',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 20px 36px rgba(212, 160, 23, 0.12)',
          }}
        >
          <Sparkles size={22} style={{ color: '#D97706' }} />
          <span style={{ fontSize: '40px', fontWeight: 800, color: '#D4A017', lineHeight: 1 }}>
            +{xpGanho}
          </span>
          <span style={{ fontSize: '14px', color: '#B45309', fontWeight: 700 }}>XP ganhos</span>
          <span style={{ fontSize: '12px', color: '#B45309', opacity: 0.84 }}>
            Recompensa pela sua performance
          </span>
        </div>

        {flashcardsCount > 0 && (
          <div
            style={{
              padding: '22px 22px',
              borderRadius: '22px',
              background: 'linear-gradient(135deg, #EEF4FF 0%, #E4EEFF 100%)',
              border: '1px solid #BFD1FF',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 20px 36px rgba(46,95,212,0.10)',
            }}
          >
            <Layers size={22} style={{ color: '#2E5FD4' }} />
            <span style={{ fontSize: '40px', fontWeight: 800, color: '#2E5FD4', lineHeight: 1 }}>
              {flashcardsCount}
            </span>
            <span style={{ fontSize: '14px', color: '#2E5FD4', fontWeight: 700 }}>Flashcards criados</span>
            <span style={{ fontSize: '12px', color: '#2E5FD4', opacity: 0.82 }}>
              Erros convertidos em revisao pratica
            </span>
          </div>
        )}
      </div>

      <div
        style={{
          width: '100%',
          maxWidth: '640px',
          display: 'flex',
          gap: '14px',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {flashcardsCount > 0 && (
          <button
            onClick={() => navigate('/flashcards')}
            style={{
              flex: '1 1 260px',
              minHeight: '56px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '0 22px',
              borderRadius: '16px',
              border: '1px solid #2E5FD4',
              background: 'linear-gradient(180deg, #F7FAFF 0%, #EAF1FF 100%)',
              color: '#2E5FD4',
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 12px 26px rgba(46,95,212,0.10)',
            }}
          >
            <Layers size={16} strokeWidth={1.5} />
            Revisar flashcards agora
          </button>
        )}

        <Link
          to={`/aula/${aulaId}`}
          style={{
            flex: '1 1 260px',
            minHeight: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            padding: '0 22px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #16254F 0%, #0D1B3E 100%)',
            color: '#FFFFFF',
            fontSize: '15px',
            fontWeight: 700,
            textDecoration: 'none',
            boxShadow: '0 18px 34px rgba(13,27,62,0.22)',
          }}
        >
          <BookOpen size={16} strokeWidth={1.5} />
          Voltar para a aula
          <ChevronRight size={16} strokeWidth={1.5} />
        </Link>
      </div>
    </div>
  )
}

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
        supabase.from('aulas').select('*').eq('id', id).single(),
        supabase.auth.getUser(),
      ])

      if (!aulaData) {
        setLoading(false)
        return
      }

      setAula(aulaData)

      const { data: perguntasData } = await supabase
        .from('quiz_perguntas')
        .select('*')
        .eq('aula_id', id)

      const shuffled = (perguntasData ?? []).sort(() => Math.random() - 0.5).slice(0, 10)
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
      setIndice((value) => value + 1)
      setSelecionada(null)
      setEstado('respondendo')
    } else {
      await finalizarQuiz()
      setEstado('resultado')
    }
  }

  async function finalizarQuiz() {
    if (!userId || !id) return

    const acertos = respostas.filter((resposta) => resposta.correta).length
    const total = respostas.length
    const pct = total > 0 ? Math.round((acertos / total) * 100) : 0
    const perfeito = acertos === total

    const xp =
      XP_VALUES.quiz_completado +
      acertos * XP_VALUES.por_acerto +
      (perfeito ? XP_VALUES.quiz_perfeito : 0)

    setXpGanho(xp)

    await supabase.from('user_respostas').insert(
      respostas.map((resposta) => ({
        user_id: userId,
        pergunta_id: resposta.perguntaId,
        resposta_escolhida: resposta.escolhida,
        correta: resposta.correta,
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
    const ontem = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    const novoStreak =
      ultimaAtividade === hoje
        ? profile?.streak_days ?? 1
        : ultimaAtividade === ontem
        ? (profile?.streak_days ?? 0) + 1
        : 1

    await supabase
      .from('profiles')
      .update({ xp: (profile?.xp ?? 0) + xp, streak_days: novoStreak, last_activity_date: hoje })
      .eq('id', userId)

    const topicosMap: Record<string, { acertos: number; total: number }> = {}
    respostas.forEach((resposta) => {
      const topico = resposta.topico
      if (!topicosMap[topico]) topicosMap[topico] = { acertos: 0, total: 0 }
      topicosMap[topico].total++
      if (resposta.correta) topicosMap[topico].acertos++
    })

    for (const [topico, valores] of Object.entries(topicosMap)) {
      const { data: existing } = await supabase
        .from('user_dominio')
        .select('*')
        .eq('user_id', userId)
        .eq('topico', topico)
        .maybeSingle()

      const novoTotal = (existing?.total ?? 0) + valores.total
      const novosAcertos = (existing?.acertos ?? 0) + valores.acertos
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

    const erros = respostas.filter((resposta) => !resposta.correta)
    if (erros.length > 0) {
      const perguntasMap: Record<string, QuizPergunta> = {}
      perguntas.forEach((pergunta) => { perguntasMap[pergunta.id] = pergunta })

      const flashcards = erros
        .map((resposta) => {
          const pergunta = perguntasMap[resposta.perguntaId]
          if (!pergunta) return null

          return {
            user_id: userId,
            pergunta_id: pergunta.id,
            frente: pergunta.pergunta,
            verso: `${pergunta.opcoes[pergunta.resposta_correta]}\n\n${pergunta.explicacao}`,
            topico: pergunta.topico ?? 'Geral',
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
          Nenhuma pergunta disponivel para esta aula.
        </p>
        <Link to={`/aula/${id}`} className="text-sm" style={{ color: '#2E5FD4' }}>
          Voltar para a aula
        </Link>
      </div>
    )
  }

  return (
    <div style={{ marginLeft: '236px', paddingTop: '64px', minHeight: '100vh', backgroundColor: '#F5F6FA' }}>
      <div
        style={{
          position: 'sticky',
          top: '64px',
          zIndex: 10,
          height: '64px',
          padding: '0 28px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E8ECF2',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}
      >
        <button
          onClick={() => {
            if (confirm('Sair do quiz? Seu progresso sera perdido.')) navigate(`/aula/${id}`)
          }}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: '#F8FAFC',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={20} strokeWidth={1.5} style={{ color: '#6B7280' }} />
        </button>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <p style={{ fontSize: '12px', fontWeight: 600, color: '#9CA3AF', margin: 0 }}>
            {estado !== 'resultado' ? `Pergunta ${indice + 1} de ${totalPerguntas}` : 'Resultado final'}
          </p>

          {estado !== 'resultado' && (
            <div style={{ width: '100%', borderRadius: '999px', overflow: 'hidden', height: '6px', backgroundColor: '#E8ECF2' }}>
              <div
                style={{
                  width: `${((indice + (estado === 'confirmado' ? 1 : 0)) / totalPerguntas) * 100}%`,
                  height: '100%',
                  borderRadius: '999px',
                  backgroundColor: '#0D1B3E',
                  transition: 'width 0.3s',
                }}
              />
            </div>
          )}
        </div>

        <span style={{ fontSize: '12px', fontWeight: 600, color: '#9CA3AF' }}>
          {aula.titulo.slice(0, 36)}{aula.titulo.length > 36 ? '...' : ''}
        </span>
      </div>

      <div style={{ padding: '36px 20px', display: 'flex', justifyContent: 'center' }}>
        <div
          className="animate-slideUp"
          style={{
            width: '100%',
            maxWidth: estado === 'resultado' ? '860px' : '760px',
            borderRadius: '24px',
            padding: estado === 'resultado' ? '52px 48px' : '40px',
            backgroundColor: '#FFFFFF',
            boxShadow: '0 20px 50px rgba(10,22,40,0.08)',
            border: '1px solid #E8ECF2',
          }}
        >
          {estado === 'resultado' ? (
            <TelaResultado
              acertos={respostas.filter((resposta) => resposta.correta).length}
              total={respostas.length}
              xpGanho={xpGanho}
              flashcardsCount={flashcardsCount}
              aulaId={id!}
              onShowToast={() => setShowToast(true)}
            />
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                <Target size={18} strokeWidth={1.5} style={{ color: '#2E5FD4' }} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#6B7280' }}>
                  Responda com calma e foque no entendimento
                </span>
              </div>

              <p style={{ fontSize: '24px', fontWeight: 700, color: '#1A1F2E', margin: '0 0 32px 0', lineHeight: '1.45', letterSpacing: '-0.02em' }}>
                {perguntaAtual?.pergunta}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                {perguntaAtual?.opcoes.map((opcao, index) => (
                  <OpcaoQuiz
                    key={index}
                    texto={opcao}
                    index={index}
                    estado={estado}
                    selecionada={selecionada === index}
                    correta={index === perguntaAtual.resposta_correta}
                    onSelect={() => setSelecionada(index)}
                  />
                ))}
              </div>

              {estado === 'confirmado' && (
                <div
                  className="animate-slideUp"
                  style={{
                    backgroundColor: respostas.at(-1)?.correta ? '#F0FDF4' : '#FEF2F2',
                    border: `1px solid ${respostas.at(-1)?.correta ? '#86EFAC' : '#FECACA'}`,
                    padding: '18px 20px',
                    borderRadius: '14px',
                    marginBottom: '24px',
                  }}
                >
                  <p style={{ fontWeight: 700, fontSize: '14px', margin: '0 0 8px 0', color: respostas.at(-1)?.correta ? '#16A34A' : '#DC2626' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      {respostas.at(-1)?.correta
                        ? <><CheckCircle size={15} strokeWidth={1.5} /> Correto</>
                        : <><XCircle size={15} strokeWidth={1.5} /> Incorreto</>
                      }
                    </span>
                  </p>
                  <p style={{ fontSize: '14px', lineHeight: '1.75', color: '#6B7280', margin: 0 }}>
                    {perguntaAtual?.explicacao}
                  </p>
                  {!respostas.at(-1)?.correta && (
                    <p style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', marginTop: '10px', fontWeight: 600, color: '#2E5FD4' }}>
                      <BookOpen size={13} strokeWidth={1.5} />
                      Este flashcard foi adicionado a sua revisao
                    </p>
                  )}
                </div>
              )}

              <button
                onClick={estado === 'respondendo' ? confirmar : proxima}
                disabled={selecionada === null && estado === 'respondendo'}
                style={{
                  width: '100%',
                  height: '52px',
                  borderRadius: '14px',
                  border: 'none',
                  backgroundColor: (selecionada === null && estado === 'respondendo') ? '#E8ECF2' : '#0D1B3E',
                  color: (selecionada === null && estado === 'respondendo') ? '#9CA3AF' : '#FFFFFF',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: (selecionada === null && estado === 'respondendo') ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {estado === 'respondendo'
                  ? 'Confirmar resposta'
                  : indice < totalPerguntas - 1
                  ? 'Proxima pergunta'
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
