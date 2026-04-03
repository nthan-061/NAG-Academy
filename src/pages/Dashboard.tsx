import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, ChevronRight, Layers, Flame, Play, BarChart2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Profile, Aula, Modulo, Trilha, UserDominio } from '@/types'

function saudacao() {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

function dataFormatada() {
  return new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
}

function corDominio(pct: number) {
  if (pct < 40) return '#DC2626'
  if (pct < 70) return '#D97706'
  return '#16A34A'
}

interface ContinueCard {
  aula: Aula
  modulo: Modulo
  trilha: Trilha
  progressoPct: number
}

const card: React.CSSProperties = {
  backgroundColor: '#FFFFFF',
  borderRadius: '12px',
  border: '1px solid #E8ECF2',
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
}

export function Dashboard({ profile }: { profile: Profile | null }) {
  const [continueCard, setContinueCard] = useState<ContinueCard | null>(null)
  const [dominio, setDominio] = useState<UserDominio[]>([])
  const [trilhas, setTrilhas] = useState<Trilha[]>([])
  const [flashcardsPendentes, setFlashcardsPendentes] = useState(0)
  const [loading, setLoading] = useState(true)

  const nome = profile?.full_name?.split(' ')[0] ?? 'você'

  useEffect(() => {
    if (!profile) return

    async function load() {
      // Última aula assistida
      const { data: progressos } = await supabase
        .from('user_progresso')
        .select('*')
        .eq('user_id', profile!.id)
        .eq('assistida', true)
        .order('completed_at', { ascending: false })
        .limit(1)

      if (progressos && progressos.length > 0) {
        const p = progressos[0]
        const { data: aulaData } = await supabase.from('aulas').select('*').eq('id', p.aula_id).single()
        if (aulaData) {
          const { data: moduloData } = await supabase.from('modulos').select('*').eq('id', aulaData.modulo_id).single()
          if (moduloData) {
            const { data: trilhaData } = await supabase.from('trilhas').select('*').eq('id', moduloData.trilha_id).single()
            const { count: totalCount } = await supabase
              .from('aulas').select('id', { count: 'exact', head: true }).eq('modulo_id', moduloData.id)
            const aulaIds = (await supabase.from('aulas').select('id').eq('modulo_id', moduloData.id)).data?.map((a) => a.id) ?? []
            const { count: doneCount } = await supabase
              .from('user_progresso').select('id', { count: 'exact', head: true })
              .eq('user_id', profile!.id).eq('assistida', true).in('aula_id', aulaIds)

            setContinueCard({
              aula: aulaData,
              modulo: moduloData,
              trilha: trilhaData!,
              progressoPct: totalCount ? Math.round(((doneCount ?? 0) / totalCount) * 100) : 0,
            })
          }
        }
      }

      // Domínio por tema
      const { data: dominioData } = await supabase
        .from('user_dominio').select('*').eq('user_id', profile!.id).order('percentual', { ascending: false })
      setDominio(dominioData ?? [])

      // Trilhas publicadas
      const { data: trilhasData } = await supabase
        .from('trilhas').select('*').eq('publicada', true).order('ordem').limit(6)
      setTrilhas(trilhasData ?? [])

      // Flashcards pendentes
      const hoje = new Date().toISOString().split('T')[0]
      const { count } = await supabase
        .from('flashcards').select('id', { count: 'exact', head: true })
        .eq('user_id', profile!.id).lte('proxima_revisao', hoje)
      setFlashcardsPendentes(count ?? 0)

      setLoading(false)
    }

    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="w-8 h-8 border-2 border-[#0D1B3E] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">

      {/* ── Bloco 1: Saudação ── */}
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1A1F2E', margin: '0 0 6px 0' }}>
          {saudacao()}, {nome}
        </h1>
        <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 16px 0', textTransform: 'capitalize' }}>
          {dataFormatada()}
        </p>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {(profile?.streak_days ?? 0) > 0 && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              fontSize: '13px', fontWeight: 500,
              padding: '8px 16px', borderRadius: '999px',
              backgroundColor: '#FEF3C7', color: '#D97706',
            }}>
              <Flame size={14} />
              {profile!.streak_days} {profile!.streak_days === 1 ? 'dia seguido' : 'dias seguidos'}
            </span>
          )}
          {flashcardsPendentes > 0 && (
            <Link to="/flashcards" style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              fontSize: '13px', fontWeight: 500,
              padding: '8px 16px', borderRadius: '999px',
              backgroundColor: '#EBF0FA', color: '#2E5FD4',
              textDecoration: 'none',
            }}>
              <Layers size={14} />
              {flashcardsPendentes} para revisar hoje
            </Link>
          )}
        </div>
      </div>

      {/* ── Bloco 2: Continue aprendendo ── */}
      <div style={card}>
        <div style={{ padding: '20px 20px 16px 20px', borderBottom: '1px solid #E8ECF2' }}>
          <p style={{ fontSize: '13px', fontWeight: 600, color: '#6B7280', letterSpacing: '0.05em', margin: 0 }}>
            Continue aprendendo
          </p>
        </div>
        <div style={{ padding: '24px' }}>
          {continueCard ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '96px', height: '64px', borderRadius: '8px',
                backgroundColor: '#EBF0FA', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden',
              }}>
                {continueCard.aula.thumbnail_url
                  ? <img src={continueCard.aula.thumbnail_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <BookOpen size={22} color="#2E5FD4" />
                }
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '11px', color: '#9CA3AF', margin: '0 0 3px 0' }}>
                  {continueCard.trilha.titulo} · {continueCard.modulo.titulo}
                </p>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#1A1F2E', margin: '0 0 8px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {continueCard.aula.titulo}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ flex: 1, height: '4px', borderRadius: '999px', backgroundColor: '#E8ECF2', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: '999px', backgroundColor: '#2E5FD4', width: `${continueCard.progressoPct}%` }} />
                  </div>
                  <span style={{ fontSize: '11px', color: '#6B7280', flexShrink: 0 }}>{continueCard.progressoPct}%</span>
                </div>
              </div>
              <Link to={`/aula/${continueCard.aula.id}`} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '10px 20px', borderRadius: '8px',
                backgroundColor: '#0D1B3E', color: '#FFFFFF',
                fontSize: '13px', fontWeight: 600, textDecoration: 'none',
                flexShrink: 0,
              }}>
                <Play size={14} />
                Continuar
              </Link>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%',
                backgroundColor: '#EBF0FA', display: 'flex',
                alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px',
              }}>
                <BookOpen size={22} color="#2E5FD4" />
              </div>
              <p style={{ fontSize: '14px', fontWeight: 500, color: '#1A1F2E', margin: '0 0 6px 0' }}>
                Comece sua primeira trilha
              </p>
              <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 16px 0' }}>
                Escolha uma trilha e inicie seu aprendizado agora
              </p>
              <Link to="/trilhas" style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '9px 18px', borderRadius: '8px',
                backgroundColor: '#0D1B3E', color: '#FFFFFF',
                fontSize: '13px', fontWeight: 600, textDecoration: 'none',
              }}>
                Ver trilhas <ChevronRight size={15} />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── Bloco 3: Domínio + Flashcards (grid 2 colunas) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Domínio por tema */}
        <div style={card}>
          <div style={{ borderBottom: '1px solid #E8ECF2', padding: '16px 20px' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#6B7280', letterSpacing: '0.05em', margin: 0 }}>
              Seu domínio por tema
            </p>
          </div>
          <div style={{ padding: '20px', minHeight: '88px' }}>
            {dominio.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {dominio.slice(0, 5).map((d) => (
                  <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '12px', color: '#6B7280', width: '100px', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {d.topico}
                    </span>
                    <div style={{ flex: 1, height: '6px', borderRadius: '999px', backgroundColor: '#E8ECF2', overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: '999px', backgroundColor: '#0D1B3E', width: `${d.percentual}%` }} />
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: corDominio(Number(d.percentual)), width: '32px', textAlign: 'right', flexShrink: 0 }}>
                      {Math.round(Number(d.percentual))}%
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0' }}>
                <BarChart2 size={20} color="#9CA3AF" />
                <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
                  Complete quizzes para ver seu domínio
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Flashcards */}
        <div style={card}>
          <div style={{ borderBottom: '1px solid #E8ECF2', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#6B7280', letterSpacing: '0.05em', margin: 0 }}>
              Flashcards para revisar
            </p>
          </div>
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '8px', minHeight: '88px' }}>
            {flashcardsPendentes > 0 ? (
              <>
                <p style={{ fontSize: '32px', fontWeight: 700, color: '#0D1B3E', margin: 0, lineHeight: 1 }}>
                  {flashcardsPendentes}
                </p>
                <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
                  flashcards para revisar
                </p>
                <Link
                  to="/flashcards"
                  style={{
                    marginTop: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    width: '100%', padding: '9px 16px', borderRadius: '8px',
                    backgroundColor: '#0D1B3E', color: '#FFFFFF',
                    fontSize: '13px', fontWeight: 600, textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#1E3A6E' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#0D1B3E' }}
                >
                  Revisar agora
                </Link>
              </>
            ) : (
              <div style={{ padding: '8px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <Layers size={28} color="#D1D5DB" />
                <p style={{ fontSize: '13px', color: '#9CA3AF', margin: 0 }}>
                  Nenhum flashcard pendente
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Bloco 4: Trilhas disponíveis ── */}
      <div style={card}>
        <div style={{ padding: '20px 20px 16px 20px', borderBottom: '1px solid #E8ECF2', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontSize: '13px', fontWeight: 600, color: '#6B7280', letterSpacing: '0.05em', margin: 0 }}>
            Trilhas disponíveis
          </p>
          {trilhas.length > 0 && (
            <Link to="/trilhas" style={{ fontSize: '13px', color: '#2E5FD4', textDecoration: 'none', fontWeight: 500 }}>
              Ver todas
            </Link>
          )}
        </div>
        <div style={{ padding: '20px' }}>
          {trilhas.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
              {trilhas.map((t) => (
                <Link
                  key={t.id}
                  to={`/trilhas/${t.id}`}
                  style={{
                    display: 'block',
                    borderRadius: '10px',
                    border: '1px solid #E8ECF2',
                    overflow: 'hidden',
                    textDecoration: 'none',
                    transition: 'box-shadow 0.15s',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.10)' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = 'none' }}
                >
                  <div style={{
                    height: '120px', backgroundColor: '#0D1B3E',
                    backgroundImage: t.thumbnail_url ? `url(${t.thumbnail_url})` : undefined,
                    backgroundSize: 'cover', backgroundPosition: 'center',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {!t.thumbnail_url && <BookOpen size={32} color="rgba(255,255,255,0.4)" />}
                  </div>
                  <div style={{ padding: '14px' }}>
                    {t.nivel && (
                      <span style={{
                        display: 'inline-block', fontSize: '11px', fontWeight: 600,
                        padding: '2px 8px', borderRadius: '999px', marginBottom: '6px',
                        backgroundColor: '#EBF0FA', color: '#2E5FD4', textTransform: 'capitalize',
                      }}>
                        {t.nivel}
                      </span>
                    )}
                    <p style={{ fontSize: '14px', fontWeight: 600, color: '#1A1F2E', margin: '0 0 4px 0', lineHeight: 1.4 }}>
                      {t.titulo}
                    </p>
                    {t.descricao && (
                      <p style={{
                        fontSize: '12px', color: '#6B7280', margin: 0,
                        display: '-webkit-box', WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      }}>
                        {t.descricao}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%',
                backgroundColor: '#EBF0FA', display: 'flex',
                alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px',
              }}>
                <BookOpen size={22} color="#2E5FD4" />
              </div>
              <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
                Nenhuma trilha disponível ainda
              </p>
            </div>
          )}
        </div>
      </div>


    </div>
  )
}
