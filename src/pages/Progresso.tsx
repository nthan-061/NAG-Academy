import { useEffect, useState } from 'react'
import { Flame, Star, CalendarDays, Trophy, BarChart3 } from 'lucide-react'
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
  borderRadius: '20px',
  padding: '28px',
  boxShadow: '0 16px 40px rgba(10,22,40,0.05)',
}

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
            .map((registro) => registro.completed_at?.split('T')[0])
            .filter(Boolean) as string[]
        )
        setDiasAtivos(dias)
      })
  }, [userId])

  const hoje = new Date()
  const dias: AtividadeDia[] = []

  for (let i = 83; i >= 0; i--) {
    const data = new Date(hoje)
    data.setDate(data.getDate() - i)
    const str = data.toISOString().split('T')[0]
    dias.push({ data: str, ativo: diasAtivos.has(str) })
  }

  const semanas: AtividadeDia[][] = []
  for (let i = 0; i < dias.length; i += 7) {
    semanas.push(dias.slice(i, i + 7))
  }

  return (
    <div style={card}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
        <CalendarDays size={18} strokeWidth={1.5} style={{ color: '#2E5FD4' }} />
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1A1F2E', margin: 0 }}>
          Atividade das ultimas 12 semanas
        </h2>
      </div>

      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {semanas.map((semana, semanaIndex) => (
          <div key={semanaIndex} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {semana.map((dia) => (
              <div
                key={dia.data}
                title={dia.data}
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '6px',
                  backgroundColor: dia.ativo ? '#0D1B3E' : '#E8ECF2',
                }}
              />
            ))}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginTop: '22px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '16px', height: '16px', borderRadius: '5px', backgroundColor: '#E8ECF2' }} />
          <span style={{ fontSize: '13px', color: '#6B7280' }}>Sem atividade</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '16px', height: '16px', borderRadius: '5px', backgroundColor: '#0D1B3E' }} />
          <span style={{ fontSize: '13px', color: '#6B7280' }}>Com atividade</span>
        </div>
      </div>
    </div>
  )
}

function NivelCard({ profile }: { profile: Profile }) {
  const nivel = getNivel(profile.xp)
  const proximoNivel = NIVEIS.find((item) => item.nivel === nivel.nivel + 1)
  const progressoPct = proximoNivel
    ? Math.round(((profile.xp - nivel.xp_min) / (proximoNivel.xp_min - nivel.xp_min)) * 100)
    : 100

  return (
    <div style={card}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <Trophy size={18} strokeWidth={1.5} style={{ color: '#D97706' }} />
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1A1F2E', margin: 0 }}>
          Nivel e XP
        </h2>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '22px', flexWrap: 'wrap' }}>
        <div
          style={{
            width: '82px',
            height: '82px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0D1B3E',
            color: '#FFFFFF',
            fontSize: '34px',
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {nivel.nivel}
        </div>

        <div style={{ flex: 1, minWidth: '280px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginBottom: '10px' }}>
            <div>
              <p style={{ fontSize: '30px', fontWeight: 700, color: '#1A1F2E', margin: '0 0 2px 0', lineHeight: 1.1 }}>
                {nivel.nome}
              </p>
              {proximoNivel && (
                <p style={{ fontSize: '15px', color: '#9CA3AF', margin: 0 }}>
                  Faltam {proximoNivel.xp_min - profile.xp} XP para {proximoNivel.nome}
                </p>
              )}
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '14px',
                backgroundColor: '#FFF8DB',
                color: '#D97706',
                fontSize: '16px',
                fontWeight: 700,
              }}
            >
              <Star size={16} strokeWidth={1.5} />
              {profile.xp} XP
            </div>
          </div>

          <div style={{ width: '100%', borderRadius: '999px', overflow: 'hidden', height: '10px', backgroundColor: '#E8ECF2', marginBottom: '14px' }}>
            <div
              style={{
                width: `${progressoPct}%`,
                height: '100%',
                borderRadius: '999px',
                backgroundColor: '#0D1B3E',
              }}
            />
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: '999px',
              backgroundColor: '#FFF4D6',
              color: '#D97706',
              fontSize: '15px',
              fontWeight: 600,
            }}
          >
            <Flame size={16} strokeWidth={1.5} />
            {profile.streak_days} {profile.streak_days === 1 ? 'dia seguido' : 'dias seguidos'}
          </div>
        </div>
      </div>
    </div>
  )
}

function HistoricoQuizzes({ historico }: { historico: QuizHistorico[] }) {
  return (
    <div style={card}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <BarChart3 size={18} strokeWidth={1.5} style={{ color: '#2E5FD4' }} />
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1A1F2E', margin: 0 }}>
          Historico de quizzes
        </h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {historico.map((item) => {
          const pct = item.percentual_acerto ?? 0
          return (
            <div
              key={item.id}
              style={{
                border: '1px solid #E8ECF2',
                borderRadius: '16px',
                padding: '18px 20px',
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1.8fr) repeat(3, minmax(90px, auto))',
                gap: '16px',
                alignItems: 'center',
                backgroundColor: '#FCFDFF',
              }}
            >
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: '16px', fontWeight: 600, color: '#1A1F2E', margin: '0 0 6px 0', lineHeight: 1.45 }}>
                  {item.aula_titulo}
                </p>
                <p style={{ fontSize: '13px', color: '#9CA3AF', margin: 0 }}>
                  Quiz concluido
                </p>
              </div>

              <div>
                <p style={{ fontSize: '12px', color: '#9CA3AF', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Score
                </p>
                <p style={{ fontSize: '19px', fontWeight: 700, color: corDominio(pct), margin: 0 }}>
                  {item.acertos}/{item.total_perguntas}
                </p>
                <p style={{ fontSize: '12px', color: '#9CA3AF', margin: '2px 0 0 0' }}>
                  {Math.round(pct)}%
                </p>
              </div>

              <div>
                <p style={{ fontSize: '12px', color: '#9CA3AF', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  XP
                </p>
                <p style={{ fontSize: '19px', fontWeight: 700, color: '#D97706', margin: 0 }}>
                  +{item.xp_ganho}
                </p>
              </div>

              <div>
                <p style={{ fontSize: '12px', color: '#9CA3AF', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Data
                </p>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#6B7280', margin: 0 }}>
                  {item.completed_at
                    ? new Date(item.completed_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'Sem data'}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

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
        (progressoData ?? []).map((item) => ({
          id: item.id,
          aula_titulo: (item.aulas as { titulo: string } | null)?.titulo ?? 'Sem titulo',
          acertos: item.acertos,
          total_perguntas: item.total_perguntas,
          percentual_acerto: item.percentual_acerto,
          xp_ganho: item.xp_ganho,
          completed_at: item.completed_at,
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
    <div style={{ maxWidth: '1120px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ marginBottom: '6px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1A1F2E', margin: '0 0 8px 0', lineHeight: 1.1 }}>
          Meu Progresso
        </h1>
        <p style={{ fontSize: '15px', color: '#6B7280', margin: 0 }}>
          Acompanhe sua evolucao na plataforma
        </p>
      </div>

      <NivelCard profile={profile} />

      {dominio.length > 0 && (
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <BarChart3 size={18} strokeWidth={1.5} style={{ color: '#2E5FD4' }} />
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1A1F2E', margin: 0 }}>
              Dominio por tema
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {dominio.map((item) => (
              <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '180px minmax(0, 1fr) 68px 64px', gap: '18px', alignItems: 'center' }}>
                <span style={{ fontSize: '15px', color: '#4B5563', lineHeight: 1.4 }}>
                  {item.topico}
                </span>

                <div style={{ width: '100%', borderRadius: '999px', overflow: 'hidden', height: '8px', backgroundColor: '#E8ECF2' }}>
                  <div
                    style={{
                      width: `${item.percentual}%`,
                      height: '100%',
                      borderRadius: '999px',
                      backgroundColor: corDominio(Number(item.percentual)),
                    }}
                  />
                </div>

                <span style={{ fontSize: '15px', fontWeight: 700, textAlign: 'right', color: corDominio(Number(item.percentual)) }}>
                  {Math.round(Number(item.percentual))}%
                </span>

                <span style={{ fontSize: '13px', textAlign: 'right', color: '#9CA3AF' }}>
                  {item.acertos}/{item.total}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <StreakCalendar userId={profile.id} />

      {historico.length > 0 && <HistoricoQuizzes historico={historico} />}

      {historico.length === 0 && dominio.length === 0 && (
        <div style={{ ...card, textAlign: 'center', padding: '56px 32px' }}>
          <p style={{ fontSize: '18px', fontWeight: 600, color: '#6B7280', margin: '0 0 8px 0' }}>
            Nenhuma atividade registrada ainda
          </p>
          <p style={{ fontSize: '14px', color: '#9CA3AF', margin: 0 }}>
            Complete aulas e quizzes para ver seu progresso aqui.
          </p>
        </div>
      )}
    </div>
  )
}
