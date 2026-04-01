import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { RotateCw, CheckCircle, Layers } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { calcularProximaRevisao } from '@/lib/sm2'
import { XP as XP_VALUES } from '@/lib/xp'
import { XPToast } from '@/components/ui/Toast'
import type { Flashcard } from '@/types'
import type { Qualidade } from '@/lib/sm2'

// ---------- Card com flip 3D ----------
function FlashcardFlip({
  card,
  flipped,
  onFlip,
}: {
  card: Flashcard
  flipped: boolean
  onFlip: () => void
}) {
  return (
    <div
      className="perspective w-full cursor-pointer select-none"
      style={{ height: '300px' }}
      onClick={onFlip}
    >
      <div className={`card-flip w-full h-full relative ${flipped ? 'flipped' : ''}`}>
        {/* Frente */}
        <div
          className="card-face absolute inset-0 rounded-2xl flex flex-col"
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E8ECF2',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            padding: '20px 24px 28px 24px',
            borderRadius: '16px',
          }}
        >
          {card.topico && (
            <span style={{
              alignSelf: 'flex-start', marginBottom: '12px',
              fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em',
              backgroundColor: '#EBF0FA', color: '#2E5FD4',
              padding: '3px 10px', borderRadius: '20px',
            }}>
              {card.topico}
            </span>
          )}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <p style={{ fontSize: '18px', lineHeight: 1.6, color: '#1A1F2E', margin: 0 }}>
              {card.frente}
            </p>
            <p style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#9CA3AF', marginTop: '20px' }}>
              <RotateCw size={12} />
              Clique para revelar a resposta
            </p>
          </div>
        </div>

        {/* Verso */}
        <div
          className="card-face card-face-back absolute inset-0 flex flex-col"
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E8ECF2',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            padding: '20px 24px 28px 24px',
            borderRadius: '16px',
          }}
        >
          {card.topico && (
            <span style={{
              alignSelf: 'flex-start', marginBottom: '12px',
              fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em',
              backgroundColor: '#EBF0FA', color: '#2E5FD4',
              padding: '3px 10px', borderRadius: '20px',
            }}>
              {card.topico}
            </span>
          )}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <p style={{ fontSize: '18px', lineHeight: 1.6, color: '#6B7280', margin: 0, whiteSpace: 'pre-line' }}>
              {card.verso}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------- Tela final ----------
function TelaFinal({ revisados, proximaDias }: { revisados: number; proximaDias: number }) {
  return (
    <div className="flex flex-col items-center gap-6 text-center animate-slideUp py-8">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center"
        style={{ backgroundColor: '#F0FDF4' }}
      >
        <CheckCircle size={40} style={{ color: '#16A34A' }} />
      </div>
      <div>
        <h2 className="text-2xl font-semibold mb-2" style={{ color: '#1A1F2E' }}>
          Revisão completa!
        </h2>
        <p className="text-sm" style={{ color: '#6B7280' }}>
          Você revisou {revisados} {revisados === 1 ? 'flashcard' : 'flashcards'} hoje.
        </p>
        {proximaDias > 0 && (
          <p className="text-sm mt-1" style={{ color: '#9CA3AF' }}>
            Próxima revisão em {proximaDias} {proximaDias === 1 ? 'dia' : 'dias'}.
          </p>
        )}
      </div>
      <Link
        to="/"
        className="px-6 py-3 rounded-xl text-sm font-semibold text-white transition-colors"
        style={{ backgroundColor: '#0D1B3E' }}
      >
        Voltar ao dashboard
      </Link>
    </div>
  )
}

// ---------- Página principal ----------
export function Flashcards() {
  const [cards, setCards] = useState<Flashcard[]>([])
  const [indice, setIndice] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [loading, setLoading] = useState(true)
  const [concluido, setConcluido] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [revisados, setRevisados] = useState(0)
  const [proximaDias, setProximaDias] = useState(1)
  const [showToast, setShowToast] = useState(false)
  const [xpTotal, setXpTotal] = useState(0)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUserId(user.id)
      const hoje = new Date().toISOString().split('T')[0]

      const { data } = await supabase
        .from('flashcards')
        .select('*')
        .eq('user_id', user.id)
        .lte('proxima_revisao', hoje)
        .order('proxima_revisao')

      setCards(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const avaliar = useCallback(async (qualidade: Qualidade) => {
    if (!userId) return
    const card = cards[indice]

    const resultado = calcularProximaRevisao(
      { intervalo: card.intervalo_dias, facilidade: card.facilidade, repeticoes: card.repeticoes },
      qualidade
    )

    const proximaData = resultado.proxima_data.toISOString().split('T')[0]

    await supabase
      .from('flashcards')
      .update({
        intervalo_dias: resultado.intervalo,
        facilidade: resultado.facilidade,
        repeticoes: resultado.repeticoes,
        proxima_revisao: proximaData,
        ultima_revisao: new Date().toISOString().split('T')[0],
      })
      .eq('id', card.id)

    // XP por flashcard revisado
    await supabase
      .from('profiles')
      .select('xp')
      .eq('id', userId)
      .single()
      .then(async ({ data }) => {
        await supabase
          .from('profiles')
          .update({ xp: (data?.xp ?? 0) + XP_VALUES.flashcard_revisado })
          .eq('id', userId)
      })

    setXpTotal((prev) => prev + XP_VALUES.flashcard_revisado)
    setRevisados((prev) => prev + 1)
    setProximaDias(resultado.intervalo)

    if (indice < cards.length - 1) {
      setFlipped(false)
      setTimeout(() => setIndice((i) => i + 1), 300)
    } else {
      setConcluido(true)
      setShowToast(true)
    }
  }, [cards, indice, userId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-[#0D1B3E] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (cards.length === 0) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Layers size={48} style={{ color: '#9CA3AF' }} />
        <h2 className="text-xl font-semibold" style={{ color: '#1A1F2E' }}>
          Nenhum flashcard para revisar hoje
        </h2>
        <p className="text-sm text-center max-w-xs" style={{ color: '#6B7280' }}>
          Continue fazendo quizzes para gerar flashcards automaticamente ao errar questões.
        </p>
        <Link
          to="/trilhas"
          className="px-5 py-2.5 rounded-lg text-sm font-medium text-white mt-2"
          style={{ backgroundColor: '#0D1B3E' }}
        >
          Ver trilhas
        </Link>
      </div>
    )
  }

  const card = cards[indice]

  return (
    <div style={{ maxWidth: '560px', margin: '0 auto', padding: '40px 24px' }}>
      {/* Header + progress bar */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1A1F2E', margin: '0 0 6px 0' }}>
          {concluido ? 'Revisão concluída' : 'Revisão de flashcards'}
        </h1>
        {!concluido && (
          <p style={{ fontSize: '14px', color: '#9CA3AF', margin: '0 0 16px 0' }}>
            {indice + 1} de {cards.length} flashcards
          </p>
        )}
        {!concluido && (
          <div style={{ height: '4px', backgroundColor: '#E8ECF2', borderRadius: '99px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', backgroundColor: '#0D1B3E', borderRadius: '99px',
              width: `${(indice / cards.length) * 100}%`,
              transition: 'width 0.3s ease',
            }} />
          </div>
        )}
      </div>

      {/* Área central */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {concluido ? (
          <TelaFinal revisados={revisados} proximaDias={proximaDias} />
        ) : (
          <>
            <FlashcardFlip card={card} flipped={flipped} onFlip={() => setFlipped((v) => !v)} />

            {/* Botões de avaliação — só aparecem após virar */}
            <div style={{ opacity: flipped ? 1 : 0, pointerEvents: flipped ? 'auto' : 'none', transition: 'opacity 0.3s', marginTop: '24px' }}>
              <p style={{ fontSize: '12px', color: '#9CA3AF', textAlign: 'center', marginBottom: '12px' }}>
                Como foi lembrar?
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                {[
                  { label: 'Difícil', cor: '#DC2626', bg: '#FEF2F2', q: 0 },
                  { label: 'Médio',   cor: '#D97706', bg: '#FFFBEB', q: 1 },
                  { label: 'Fácil',   cor: '#16A34A', bg: '#F0FDF4', q: 2 },
                ].map(({ label, cor, bg, q }) => (
                  <button
                    key={label}
                    onClick={() => avaliar(q as 0 | 1 | 2)}
                    style={{
                      height: '44px', padding: '0 28px', borderRadius: '8px',
                      border: `1px solid ${cor}`, backgroundColor: bg,
                      color: cor, fontSize: '14px', fontWeight: 500, cursor: 'pointer',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {showToast && xpTotal > 0 && (
        <XPToast xp={xpTotal} onDone={() => setShowToast(false)} />
      )}
    </div>
  )
}
