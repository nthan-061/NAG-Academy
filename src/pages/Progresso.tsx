import { useEffect, useState } from 'react'
import { Flame, Star } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getNivel, NIVEIS } from '@/lib/xp'
import type { Profile, UserDominio } from '@/types'

interface QuizHistorico {
  id: string
  aula_titulo: string
  acertos: number
  total_perguntas: number
  percentual_acerto: number | null
  xp_ganho: number
  completed_at: string | null
}

interface AtividadeDia {
  data: string
  ativo: boolean
}

function corDominio(pct: number) {
  if (pct < 40) return '#DC2626'
  if (pct < 70) return '#D97706'
  return '#16A34A'
}

const card: React.CSSProperties = {
  backgroundColor: '#FFFFFF',
  border: '1px solid #E8ECF2',
  borderRadius: '12px',
  padding: '24px',
}

// ---------- Calendário de streak ----------
function StreakCalendar({ userId }: { userId: string }) {
  const [diasAtivos, setDiasAtivos] = useState<Set<string>>(new Set())

  useEffect(() => {
    supabase
      .from('user_progresso')
      .select('completed_at')
      .eq('user_id', userId)
      .not('completed_at', 'is', null)
      .then(({ data }) => {
        const dias = new Set(
          (data ?? [])
            .map((r) => r.completed_at?.split('T')[0])
            .filter(Boolean) as string[]
        )
        setDiasAtivos(dias)
      })
  }, [userId])

  const hoje = new Date()
  const dias: AtividadeDia[] = []
  for (let i = 83; i >= 0; i--) {
    const d = new Date(hoje)
    d.setDate(d.getDate() - i)
    const str = d.toISOString().split('T')[0]
    dias.push({ data: str, ativo: diasAtivos.has(str) })
  }

  const semanas: AtividadeDia[][] = []
  for (let i = 0; i < dias.length; i += 7) {
    semanas.push(dias.slice(i, i + 7))
  }

  return (
    <div style={card}>
      <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#1A1F2E', margin: '0 0 16px 0' }}>
        Atividade — últimas 12 semanas
      </h2>
      <div className="flex gap-1.5">
        {semanas.map((semana, si) => (
          <div key={si} className="flex flex-col gap-1.5">
            {semana.map((dia) => (
              <div
                key={dia.data}
                title={dia.data}
                className="w-3.5 h-3.5 rounded-sm transition-colors"
                style={{ backgroundColor: dia.ativo ? '#0D1B3E' : '#E8ECF2' }}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-4">
        <div className="w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: '#E8ECF2' }} />
        <span className="text-xs" style={{ color: '#9CA3AF' }}>Sem atividade</span>
        <div className="w-3.5 h-3.5 rounded-sm ml-2" style={{ backgroundColor: '#0D1B3E' }} />
        <span className="text-xs" style={{ color: '#9CA3AF' }}>Com atividade</span>
      </div>
    </div>
  )
}

// ---------- Nível e XP ----------
function NivelCard({ profile }: { profile: Profile }) {
  const nivel = getNivel(profile.xp)
  const proximoNivel = NIVEIS.find((n) => n.nivel === nivel.nivel + 1)
  const progressoPct = proximoNivel
    ? Math.round(((profile.xp - nivel.xp_min) / (proximoNivel.xp_min - nivel.xp_min)) * 100)
    : 100

  return (
    <div style={card}>
      <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#1A1F2E', margin: '0 0 16px 0' }}>
        Nível e XP
      </h2>
      <div className="flex items-center gap-6">
        <div
          className="w-16 h-16 rounded-full flex flex-col items-center justify-center flex-shrink-0"
          style={{ backgroundColor: '#0D1B3E' }}
        >
          <span className="text-white font-bold text-lg">{nivel.nivel}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold" style={{ color: '#1A1F2E' }}>
              {nivel.nome}
            </span>
            <span className="text-sm font-bold flex items-center gap-1.5" style={{ color: '#D97706' }}>
              <Star size={14} strokeWidth={1.5} />
              {profile.xp} XP
            </span>
          </div>
          <div
            className="w-full rounded-full overflow-hidden"
            style={{ height: '8px', backgroundColor: '#E8ECF2' }}
          >
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${progressoPct}%`, backgroundColor: '#0D1B3E' }}
            />
          </div>
          {proximoNivel && (
            <p className="text-xs mt-1.5" style={{ color: '#9CA3AF' }}>
              {proximoNivel.xp_min - profile.xp} XP para {proximoNivel.nome}
            </p>
          )}
          <div className="flex items-center gap-4 mt-3">
            <span
              className="flex items-center gap-1.5 text-sm px-3 py-1 rounded-full font-medium"
              style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}
            >
              <Flame size={14} strokeWidth={1.5} />
              {profile.streak_days} {profile.streak_days === 1 ? 'dia seguido' : 'dias seguidos'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------- Página principal ----------
export function Progresso() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [dominio, setDominio] = useState<UserDominio[]>([])
  const [historico, setHistorico] = useState<QuizHistorico[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [
        { data: profileData },
        { data: dominioData },
        { data: progressoData },
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('user_dominio').select('*').eq('user_id', user.id).order('percentual', { ascending: false }),
        supabase
          .from('user_progresso')
          .select('*, aulas(titulo)')
          .eq('user_id', user.id)
          .eq('quiz_completado', true)
          .order('completed_at', { ascending: false })
          .limit(20),
      ])

      setProfile(profileData)
      setDominio(dominioData ?? [])
      setHistorico(
        (progressoData ?? []).map((p) => ({
          id: p.id,
          aula_titulo: (p.aulas as { titulo: string } | null)?.titulo ?? '—',
          acertos: p.acertos,
          total_perguntas: p.total_perguntas,
          percentual_acerto: p.percentual_acerto,
          xp_ganho: p.xp_ganho,
          completed_at: p.completed_at,
        }))
      )
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-[#0D1B3E] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!profile) return null

  return (
    <div className="p-8 max-w-4xl mx-auto flex flex-col gap-6">
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1A1F2E', margin: '0 0 6px 0' }}>
          Meu Progresso
        </h1>
        <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 32px 0' }}>
          Acompanhe sua evolução na plataforma
        </p>
      </div>

      {/* Nível e XP */}
      <NivelCard profile={profile} />

      {/* Domínio por tema */}
      {dominio.length > 0 && (
        <div style={card}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#1A1F2E', margin: '0 0 16px 0' }}>
            Domínio por tema
          </h2>
          <div className="flex flex-col gap-4">
            {dominio.map((d) => (
              <div key={d.id} className="flex items-center gap-4">
                <span
                  className="text-sm w-36 flex-shrink-0 truncate"
                  style={{ color: '#6B7280' }}
                >
                  {d.topico}
                </span>
                <div
                  className="flex-1 rounded-full overflow-hidden"
                  style={{ height: '6px', backgroundColor: '#E8ECF2' }}
                >
                  <div
                    className="h-full rounded-full animate-growWidth"
                    style={{
                      width: `${d.percentual}%`,
                      backgroundColor: corDominio(Number(d.percentual)),
                    }}
                  />
                </div>
                <span
                  className="text-sm font-semibold w-12 text-right flex-shrink-0"
                  style={{ color: corDominio(Number(d.percentual)) }}
                >
                  {Math.round(Number(d.percentual))}%
                </span>
                <span className="text-xs w-16 text-right flex-shrink-0" style={{ color: '#9CA3AF' }}>
                  {d.acertos}/{d.total}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Calendário de streak */}
      <StreakCalendar userId={profile.id} />

      {/* Histórico de quizzes */}
      {historico.length > 0 && (
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: '1px solid #E8ECF2' }}
        >
          <div className="px-6 py-4" style={{ backgroundColor: '#FFFFFF' }}>
            <h2 className="text-base font-semibold" style={{ color: '#1A1F2E' }}>
              Histórico de quizzes
            </h2>
          </div>
          <table className="w-full text-sm">
            <thead style={{ backgroundColor: '#F5F6FA' }}>
              <tr>
                {['Aula', 'Score', 'XP', 'Data'].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3 text-xs font-semibold"
                    style={{ color: '#9CA3AF', borderTop: '1px solid #E8ECF2', borderBottom: '1px solid #E8ECF2' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {historico.map((h, i) => {
                const pct = h.percentual_acerto ?? 0
                return (
                  <tr
                    key={h.id}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderBottom: i < historico.length - 1 ? '1px solid #F5F6FA' : 'none',
                    }}
                  >
                    <td
                      className="px-5 py-3 max-w-xs truncate font-medium"
                      style={{ color: '#1A1F2E' }}
                    >
                      {h.aula_titulo}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className="font-semibold"
                        style={{ color: corDominio(pct) }}
                      >
                        {h.acertos}/{h.total_perguntas}
                      </span>
                      <span className="text-xs ml-1" style={{ color: '#9CA3AF' }}>
                        ({Math.round(pct)}%)
                      </span>
                    </td>
                    <td className="px-5 py-3" style={{ color: '#D97706' }}>
                      +{h.xp_ganho}
                    </td>
                    <td className="px-5 py-3 text-xs" style={{ color: '#9CA3AF' }}>
                      {h.completed_at
                        ? new Date(h.completed_at).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {historico.length === 0 && dominio.length === 0 && (
        <div
          className="rounded-xl p-12 text-center"
          style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8ECF2' }}
        >
          <p className="text-base font-medium mb-2" style={{ color: '#6B7280' }}>
            Nenhuma atividade registrada ainda
          </p>
          <p className="text-sm" style={{ color: '#9CA3AF' }}>
            Complete aulas e quizzes para ver seu progresso aqui.
          </p>
        </div>
      )}
    </div>
  )
}
