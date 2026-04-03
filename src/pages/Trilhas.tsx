import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Trilha } from '@/types'

const NIVEL_LABEL: Record<string, string> = {
  iniciante:     'Iniciante',
  intermediario: 'Intermediário',
  avancado:      'Avançado',
}

const NIVEL_COLORS: Record<string, { bg: string; text: string }> = {
  iniciante:     { bg: '#DCFCE7', text: '#16A34A' },
  intermediario: { bg: '#EBF0FA', text: '#2E5FD4' },
  avancado:      { bg: '#F3E8FF', text: '#7C3AED' },
}

type Filtro = 'todos' | 'iniciante' | 'intermediario' | 'avancado'

function TrilhaSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden animate-pulse" style={{ border: '1px solid #E8ECF2', backgroundColor: '#FFFFFF' }}>
      <div style={{ aspectRatio: '16/9', backgroundColor: '#E8ECF2' }} />
      <div className="p-4 flex flex-col gap-3">
        <div style={{ height: '20px', width: '60%', backgroundColor: '#E8ECF2', borderRadius: 6 }} />
        <div style={{ height: '14px', backgroundColor: '#E8ECF2', borderRadius: 6 }} />
        <div style={{ height: '14px', width: '80%', backgroundColor: '#E8ECF2', borderRadius: 6 }} />
        <div style={{ height: '36px', backgroundColor: '#E8ECF2', borderRadius: 8 }} />
      </div>
    </div>
  )
}

interface TrilhaCardProps {
  trilha: Trilha
  modulosCount: number
  aulasCount: number
}

function TrilhaCard({ trilha, modulosCount, aulasCount }: TrilhaCardProps) {
  const cores = NIVEL_COLORS[trilha.nivel] ?? NIVEL_COLORS.iniciante
  const [expandida, setExpandida] = useState(false)
  const limiteDescricao = 120
  const descricaoCompleta = trilha.descricao?.trim() ?? ''
  const precisaExpandir = descricaoCompleta.length > limiteDescricao
  const descricaoVisivel = expandida || !precisaExpandir
    ? descricaoCompleta
    : `${descricaoCompleta.slice(0, limiteDescricao).trim()}...`

  return (
    <div
      className="rounded-xl overflow-hidden flex flex-col transition-shadow duration-200 hover:shadow-md cursor-pointer"
      style={{
        border: '1px solid #E8ECF2',
        backgroundColor: '#FFFFFF',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}
    >
      {/* Thumbnail */}
      {trilha.thumbnail_url ? (
        <img
          src={trilha.thumbnail_url}
          alt={trilha.titulo}
          className="w-full object-cover"
          style={{ aspectRatio: '16/9' }}
        />
      ) : (
        <div
          className="w-full flex items-center justify-center"
          style={{ aspectRatio: '16/9', backgroundColor: '#F0F2F5' }}
        >
          <BookOpen size={24} strokeWidth={1.5} style={{ color: '#D1D5DB' }} />
        </div>
      )}

      {/* Corpo */}
      <div style={{ padding: '16px 20px 20px 20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <span
          style={{
            alignSelf: 'flex-start', fontSize: '11px', fontWeight: 600,
            padding: '3px 10px', borderRadius: '20px', marginBottom: '10px',
            backgroundColor: cores.bg, color: cores.text,
          }}
        >
          {NIVEL_LABEL[trilha.nivel]}
        </span>

        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1A1F2E', margin: '0 0 6px 0', lineHeight: '1.4' }}>
            {trilha.titulo}
          </h3>
          {descricaoCompleta && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: '1.6', margin: 0 }}>
                {descricaoVisivel}
              </p>
              {precisaExpandir && (
                <button
                  type="button"
                  onClick={() => setExpandida((valor) => !valor)}
                  style={{
                    alignSelf: 'flex-start',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: '#2E5FD4',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  {expandida ? 'Ver menos' : 'Ver mais'}
                </button>
              )}
            </div>
          )}
        </div>

        <p style={{ fontSize: '12px', color: '#9CA3AF', margin: '10px 0 16px 0' }}>
          {modulosCount} módulos · {aulasCount} aulas
        </p>

        <Link
          to={`/trilhas/${trilha.id}`}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            width: '100%', height: '44px', borderRadius: '8px',
            backgroundColor: '#0D1B3E', color: '#FFFFFF',
            fontSize: '13px', fontWeight: 500, textDecoration: 'none',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1E3A6E')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0D1B3E')}
        >
          Começar
          <ChevronRight size={15} strokeWidth={1.5} />
        </Link>
      </div>
    </div>
  )
}

interface TrilhaComContagem extends Trilha {
  modulosCount: number
  aulasCount: number
}

export function Trilhas() {
  const [trilhas, setTrilhas] = useState<TrilhaComContagem[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<Filtro>('todos')

  useEffect(() => {
    async function load() {
      const { data: trilhasData } = await supabase
        .from('trilhas')
        .select('*')
        .eq('publicada', true)
        .order('ordem')

      if (!trilhasData) { setLoading(false); return }

      const comContagem = await Promise.all(
        trilhasData.map(async (t) => {
          const { data: modulos } = await supabase
            .from('modulos')
            .select('id')
            .eq('trilha_id', t.id)

          const moduloIds = modulos?.map((m) => m.id) ?? []

          let aulasCount = 0
          if (moduloIds.length > 0) {
            const { count } = await supabase
              .from('aulas')
              .select('id', { count: 'exact', head: true })
              .in('modulo_id', moduloIds)
            aulasCount = count ?? 0
          }

          return { ...t, modulosCount: moduloIds.length, aulasCount }
        })
      )

      setTrilhas(comContagem)
      setLoading(false)
    }

    load()
  }, [])

  const filtradas =
    filtro === 'todos' ? trilhas : trilhas.filter((t) => t.nivel === filtro)

  const FILTROS: { key: Filtro; label: string }[] = [
    { key: 'todos',         label: 'Todos' },
    { key: 'iniciante',     label: 'Iniciante' },
    { key: 'intermediario', label: 'Intermediário' },
    { key: 'avancado',      label: 'Avançado' },
  ]

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#1A1F2E', margin: '0 0 8px 0' }}>
          Trilhas de Aprendizado
        </h1>
        <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 20px 0' }}>
          Escolha uma trilha e comece sua jornada no marketing digital
        </p>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {FILTROS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFiltro(key)}
              style={{
                padding: '6px 16px',
                borderRadius: '9999px',
                border: `1px solid ${filtro === key ? '#0D1B3E' : '#E8ECF2'}`,
                backgroundColor: filtro === key ? '#0D1B3E' : '#FFFFFF',
                color: filtro === key ? '#FFFFFF' : '#6B7280',
                fontSize: '13px',
                fontWeight: filtro === key ? 500 : 400,
                cursor: 'pointer',
                transition: 'all 0.15s',
                fontFamily: 'inherit',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {[...Array(6)].map((_, i) => <TrilhaSkeleton key={i} />)}
        </div>
      ) : filtradas.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '96px 0', gap: '16px' }}>
          <BookOpen size={40} strokeWidth={1.5} style={{ color: '#9CA3AF' }} />
          <p style={{ fontSize: '15px', fontWeight: 500, color: '#6B7280', margin: 0 }}>
            Nenhuma trilha encontrada
          </p>
          <p style={{ fontSize: '13px', color: '#9CA3AF', margin: 0 }}>
            {filtro !== 'todos' ? 'Tente outro filtro de nível.' : 'Novas trilhas em breve!'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {filtradas.map((t) => (
            <TrilhaCard
              key={t.id}
              trilha={t}
              modulosCount={t.modulosCount}
              aulasCount={t.aulasCount}
            />
          ))}
        </div>
      )}
    </div>
  )
}
