import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ChevronDown, ChevronUp, CheckCircle, PlayCircle, Circle, ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Trilha, Modulo, Aula, UserProgresso } from '@/types'

const NIVEL_LABEL = { iniciante: 'Iniciante', intermediario: 'Intermediário', avancado: 'Avançado' }

interface ModuloComAulas extends Modulo {
  aulas: Aula[]
}

function CircularProgress({ pct }: { pct: number }) {
  const r = 36
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ

  return (
    <svg width="96" height="96" viewBox="0 0 96 96" style={{ transform: 'rotate(-90deg)' }}>
      <circle cx="48" cy="48" r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="6" />
      <circle
        cx="48"
        cy="48"
        r={r}
        fill="none"
        stroke="white"
        strokeWidth="6"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
      <text
        x="48"
        y="54"
        textAnchor="middle"
        style={{
          transform: 'rotate(90deg)',
          transformOrigin: '48px 48px',
          fontSize: '16px',
          fontWeight: 700,
          fill: 'white',
        }}
      >
        {pct}%
      </text>
    </svg>
  )
}

interface AulaItemProps {
  aula: Aula
  progresso?: UserProgresso
}

function AulaItem({ aula, progresso }: AulaItemProps) {
  const navigate = useNavigate()
  const assistida = progresso?.assistida ?? false
  const quizFeito = progresso?.quiz_completado ?? false

  let icon = <Circle size={18} style={{ color: '#9CA3AF', flexShrink: 0 }} strokeWidth={1.5} />
  if (assistida && quizFeito)
    icon = <CheckCircle size={18} style={{ color: '#16A34A', flexShrink: 0 }} strokeWidth={1.5} />
  else if (assistida)
    icon = <PlayCircle size={18} style={{ color: '#2E5FD4', flexShrink: 0 }} strokeWidth={1.5} />

  return (
    <button
      onClick={() => navigate(`/aula/${aula.id}`)}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
        padding: '14px 20px', textAlign: 'left', cursor: 'pointer',
        border: 'none', borderBottom: '1px solid #F5F6FA', backgroundColor: 'transparent',
        fontFamily: 'inherit', transition: 'background-color 0.15s', borderRadius: '8px',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#EBF0FA' }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
    >
      {icon}
      <span style={{ flex: 1, fontSize: '14px', fontWeight: 500, color: '#1A1F2E' }}>
        {aula.titulo}
      </span>
      {aula.duracao_segundos && (
        <span style={{ fontSize: '12px', flexShrink: 0, color: '#9CA3AF' }}>
          {Math.floor(aula.duracao_segundos / 60)}min
        </span>
      )}
    </button>
  )
}

interface ModuloAccordionProps {
  modulo: ModuloComAulas
  progressoMap: Record<string, UserProgresso>
  defaultOpen?: boolean
}

function ModuloAccordion({ modulo, progressoMap, defaultOpen = false }: ModuloAccordionProps) {
  const [open, setOpen] = useState(defaultOpen)

  const completas = modulo.aulas.filter(
    (a) => progressoMap[a.id]?.assistida && progressoMap[a.id]?.quiz_completado
  ).length

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: '1px solid #E8ECF2', backgroundColor: '#FFFFFF' }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 20px', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
          backgroundColor: open ? '#EBF0FA' : '#FFFFFF', transition: 'background-color 0.15s',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#1A1F2E' }}>
            {modulo.titulo}
          </span>
          <span
            style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '20px', fontWeight: 500, backgroundColor: '#E8ECF2', color: '#6B7280' }}
          >
            {completas}/{modulo.aulas.length} aulas
          </span>
        </div>
        {open
          ? <ChevronUp size={18} strokeWidth={1.5} style={{ color: '#9CA3AF' }} />
          : <ChevronDown size={18} strokeWidth={1.5} style={{ color: '#9CA3AF' }} />
        }
      </button>

      {open && (
        <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {modulo.aulas.map((aula) => (
            <AulaItem key={aula.id} aula={aula} progresso={progressoMap[aula.id]} />
          ))}
        </div>
      )}
    </div>
  )
}

export function TrilhaDetalhe() {
  const { id } = useParams<{ id: string }>()
  const [trilha, setTrilha] = useState<Trilha | null>(null)
  const [modulos, setModulos] = useState<ModuloComAulas[]>([])
  const [progressoMap, setProgressoMap] = useState<Record<string, UserProgresso>>({})
  const [loading, setLoading] = useState(true)
  const [descricaoExpandida, setDescricaoExpandida] = useState(false)

  useEffect(() => {
    if (!id) return

    async function load() {
      const [{ data: trilhaData }, { data: user }] = await Promise.all([
        supabase.from('trilhas').select('*').eq('id', id!).single(),
        supabase.auth.getUser(),
      ])

      if (!trilhaData) { setLoading(false); return }
      setTrilha(trilhaData)

      const { data: modulosData } = await supabase
        .from('modulos')
        .select('*')
        .eq('trilha_id', id!)
        .order('ordem')

      if (!modulosData) { setLoading(false); return }

      const modulosComAulas = await Promise.all(
        modulosData.map(async (m) => {
          const { data: aulasData } = await supabase
            .from('aulas')
            .select('*')
            .eq('modulo_id', m.id)
            .order('ordem')
          return { ...m, aulas: aulasData ?? [] }
        })
      )

      setModulos(modulosComAulas)

      if (user.user) {
        const aulaIds = modulosComAulas.flatMap((m) => m.aulas.map((a: Aula) => a.id))
        if (aulaIds.length > 0) {
          const { data: progressoData } = await supabase
            .from('user_progresso')
            .select('*')
            .eq('user_id', user.user.id)
            .in('aula_id', aulaIds)

          const map: Record<string, UserProgresso> = {}
          progressoData?.forEach((p) => { map[p.aula_id] = p })
          setProgressoMap(map)
        }
      }

      setLoading(false)
    }

    load()
  }, [id])

  if (loading) {
    return (
      <div className="p-8 flex flex-col gap-6">
        <div className="animate-pulse rounded-2xl h-48" style={{ backgroundColor: '#E8ECF2' }} />
        <div className="flex flex-col gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl h-16" style={{ backgroundColor: '#E8ECF2' }} />
          ))}
        </div>
      </div>
    )
  }

  if (!trilha) {
    return (
      <div className="p-8 text-center">
        <p style={{ color: '#6B7280' }}>Trilha não encontrada.</p>
        <Link to="/trilhas" className="text-sm mt-4 inline-block" style={{ color: '#2E5FD4' }}>
          Voltar para trilhas
        </Link>
      </div>
    )
  }

  const totalAulas = modulos.reduce((s, m) => s + m.aulas.length, 0)
  const aulasCompletas = Object.values(progressoMap).filter(
    (p) => p.assistida && p.quiz_completado
  ).length
  const pct = totalAulas > 0 ? Math.round((aulasCompletas / totalAulas) * 100) : 0
  const limiteDescricao = 280
  const descricaoCompleta = trilha.descricao?.trim() ?? ''
  const precisaExpandirDescricao = descricaoCompleta.length > limiteDescricao
  const descricaoVisivel = descricaoExpandida || !precisaExpandirDescricao
    ? descricaoCompleta
    : `${descricaoCompleta.slice(0, limiteDescricao).trim()}...`

  return (
    <div className="p-8 max-w-3xl mx-auto">
      {/* Voltar */}
      <Link
        to="/trilhas"
        className="inline-flex items-center gap-2 transition-colors hover:opacity-80"
        style={{ fontSize: '14px', color: '#6B7280', marginBottom: '24px', display: 'inline-flex' }}
      >
        <ArrowLeft size={16} strokeWidth={1.5} />
        Trilhas
      </Link>

      {/* Hero */}
      <div
        style={{ backgroundColor: '#0D1B3E', padding: '32px', marginBottom: '32px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}
      >
        <div style={{ flex: 1 }}>
          <span
            style={{
              display: 'inline-block', fontSize: '12px', fontWeight: 600,
              padding: '4px 12px', borderRadius: '20px', marginBottom: '16px',
              backgroundColor: 'rgba(255,255,255,0.15)', color: '#FFFFFF',
            }}
          >
            {NIVEL_LABEL[trilha.nivel]}
          </span>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#FFFFFF', margin: '0 0 8px 0', lineHeight: 1.3 }}>
            {trilha.titulo}
          </h1>
          {descricaoCompleta && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '0 0 16px 0' }}>
              <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'rgba(255,255,255,0.72)', margin: 0 }}>
                {descricaoVisivel}
              </p>
              {precisaExpandirDescricao && (
                <button
                  type="button"
                  onClick={() => setDescricaoExpandida((valor) => !valor)}
                  style={{
                    alignSelf: 'flex-start',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: '#FFFFFF',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    opacity: 0.92,
                  }}
                >
                  {descricaoExpandida ? 'Ver menos' : 'Ver mais'}
                </button>
              )}
            </div>
          )}
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
            {aulasCompletas} de {totalAulas} aulas completadas
          </p>
        </div>
        <div style={{ flexShrink: 0 }}>
          <CircularProgress pct={pct} />
        </div>
      </div>

      {/* Módulos */}
      <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#1A1F2E', margin: '0 0 16px 0' }}>
        Conteúdo da trilha
      </h2>

      {modulos.length === 0 ? (
        <div
          className="rounded-xl p-8 text-center"
          style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8ECF2' }}
        >
          <p style={{ color: '#6B7280' }}>Nenhum módulo disponível ainda.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {modulos.map((m, i) => (
            <ModuloAccordion
              key={m.id}
              modulo={m}
              progressoMap={progressoMap}
              defaultOpen={i === 0}
            />
          ))}
        </div>
      )}
    </div>
  )
}
