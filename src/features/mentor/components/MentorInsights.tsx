import { Link } from 'react-router-dom'
import { AlertTriangle, ArrowRight, CheckCircle2, Lightbulb, Target, TrendingDown, X } from 'lucide-react'
import type React from 'react'
import type { MentorInsight, MentorPerformanceAnalysis, MentorRecommendation, UserLearningProfile } from '../types'

/* ─── Estilos base (idênticos ao Dashboard e Trilhas) ─── */

const card: React.CSSProperties = {
  backgroundColor: '#FFFFFF',
  borderRadius: '12px',
  border: '1px solid #E8ECF2',
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  padding: '28px',
}

const innerCard: React.CSSProperties = {
  backgroundColor: '#F8FAFF',
  borderRadius: '10px',
  border: '1px solid #E8ECF2',
  padding: '20px',
}

/* ─── Mapeamentos semânticos ─── */

const toneIcon = {
  encouragement: CheckCircle2,
  focus: Target,
  warning: AlertTriangle,
  opportunity: Lightbulb,
} as const

const toneColors: Record<string, { color: string; bg: string }> = {
  encouragement: { color: '#16A34A', bg: '#F0FDF4' },
  focus:         { color: '#2E5FD4', bg: '#EEF4FF' },
  warning:       { color: '#D97706', bg: '#FFF8DB' },
  opportunity:   { color: '#D97706', bg: '#FFF8DB' },
}

const statusBadge: Record<string, { bg: string; color: string; label: string }> = {
  good:      { bg: '#DCFCE7', color: '#16A34A', label: 'Bom momento'       },
  attention: { bg: '#FFF8DB', color: '#D97706', label: 'Momento de atenção' },
  critical:  { bg: '#FEF2F2', color: '#DC2626', label: 'Estado crítico'    },
}

const priorityBadge: Record<string, { bg: string; color: string }> = {
  low:    { bg: '#F5F6FA', color: '#9CA3AF' },
  medium: { bg: '#FFF8DB', color: '#D97706' },
  high:   { bg: '#FEF2F2', color: '#DC2626' },
}

/* ─── Subcomponente: cabeçalho de seção ─── */

function SectionHeader({
  label, title, subtitle,
}: {
  label: string
  title: string
  subtitle?: string
}) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <p style={{ fontSize: '13px', fontWeight: 600, color: '#6B7280', letterSpacing: '0.05em', margin: '0 0 4px 0' }}>
        {label}
      </p>
      <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1A1F2E', margin: subtitle ? '0 0 6px 0' : '0' }}>
        {title}
      </h2>
      {subtitle && (
        <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.6', margin: 0 }}>
          {subtitle}
        </p>
      )}
    </div>
  )
}

/* ─── Subcomponente: pill/badge inline ─── */

function Pill({ bg, color, children, icon }: {
  bg: string
  color: string
  children: React.ReactNode
  icon?: React.ReactNode
}) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      fontSize: '11px', fontWeight: 600,
      padding: '3px 10px', borderRadius: '20px',
      backgroundColor: bg, color,
    }}>
      {icon}
      {children}
    </span>
  )
}

/* ─── Props ─── */

interface MentorInsightsProps {
  profile: UserLearningProfile | null
  analysis: MentorPerformanceAnalysis | null
  insights: MentorInsight[]
  recommendations: MentorRecommendation[]
  onAcknowledgeInsight: (id: string) => void
  onAskMentor: (prompt: string) => void
}

export function MentorInsights({
  profile,
  analysis,
  insights,
  recommendations,
  onAcknowledgeInsight,
  onAskMentor,
}: MentorInsightsProps) {
  const status = analysis?.status ?? 'good'
  const badge = statusBadge[status] ?? statusBadge.good

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* ── Leitura atual ── */}
      <div style={card}>
        <SectionHeader
          label="Leitura atual"
          title="Leitura atual do mentor"
          subtitle={analysis?.summary ?? 'Carregando leitura comportamental do aluno.'}
        />

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <Pill bg={badge.bg} color={badge.color}>
            {badge.label}
          </Pill>

          {profile?.evolutionTrend.direction === 'declining' && (
            <Pill bg="#FEF2F2" color="#DC2626" icon={<TrendingDown size={11} />}>
              ritmo em queda
            </Pill>
          )}

          {analysis?.focusTopics.map((topic) => (
            <Pill key={topic} bg="#EEF4FF" color="#2E5FD4">
              {topic}
            </Pill>
          ))}
        </div>
      </div>

      {/* ── Perfil + Contexto ── */}
      {profile && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>

          {/* Pontos fortes e fracos */}
          <div style={card}>
            <SectionHeader
              label="Perfil"
              title="Leitura do perfil de aprendizado"
              subtitle={`${profile.userName}, o mentor estima seu nível como ${profile.estimatedLevel.label} e percebe tendência ${profile.evolutionTrend.direction} no seu desempenho recente.`}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              {/* Pontos fortes */}
              <div style={innerCard}>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#16A34A', margin: '0 0 12px 0' }}>
                  Pontos fortes
                </p>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {profile.strengths.map((item) => (
                    <li key={item} style={{ fontSize: '13px', color: '#1A1F2E', lineHeight: '1.55' }}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pontos fracos */}
              <div style={innerCard}>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#D97706', margin: '0 0 12px 0' }}>
                  Pontos fracos
                </p>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {profile.weakPoints.map((item) => (
                    <li key={item} style={{ fontSize: '13px', color: '#1A1F2E', lineHeight: '1.55' }}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Contexto */}
          <div style={card}>
            <SectionHeader
              label="Contexto"
              title="Contexto conhecido do aluno"
              subtitle="O mentor orienta melhor quando entende objetivo, experiência e contexto de uso."
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {[
                ['Objetivo',        profile.mentorContext?.goal ?? 'Ainda não informado ao mentor.'],
                ['Experiência',     profile.mentorContext?.experience_level ?? 'Não informado'],
                ['Contexto de uso', profile.mentorContext?.use_case ?? 'Não informado'],
                ['Desafios',        profile.mentorContext?.declared_challenges?.join(', ') || 'Nenhum desafio declarado ainda.'],
              ].map(([label, value]) => (
                <div key={label}>
                  <p style={{ fontSize: '12px', fontWeight: 500, color: '#9CA3AF', margin: '0 0 4px 0' }}>
                    {label}
                  </p>
                  <p style={{ fontSize: '14px', color: '#1A1F2E', lineHeight: '1.55', margin: 0 }}>
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ── Insights ── */}
      <div style={card}>
        <SectionHeader
          label="Insights"
          title="Insights personalizados"
          subtitle="Observações derivadas do uso real da plataforma."
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {insights.length > 0 ? insights.map((insight) => {
            const Icon = toneIcon[insight.tone]
            const tc = toneColors[insight.tone]
            const pb = priorityBadge[insight.priority]
            return (
              <div key={insight.id} style={innerCard}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '14px', minWidth: 0 }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                      backgroundColor: tc.bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon size={16} color={tc.color} />
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#1A1F2E', margin: 0 }}>
                          {insight.title}
                        </h4>
                        <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px', backgroundColor: pb.bg, color: pb.color }}>
                          {insight.priority}
                        </span>
                      </div>
                      <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: '1.6', margin: 0 }}>
                        {insight.message}
                      </p>
                      {insight.actionHint && (
                        <p style={{ fontSize: '13px', fontWeight: 500, color: '#1A1F2E', lineHeight: '1.6', margin: '6px 0 0 0' }}>
                          {insight.actionHint}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onAcknowledgeInsight(insight.id)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                      border: 'none', backgroundColor: 'transparent', cursor: 'pointer',
                      color: '#9CA3AF',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#E8ECF2' }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                    aria-label="Dispensar insight"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            )
          }) : (
            <div style={{ ...innerCard, border: '1px dashed #E8ECF2' }}>
              <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: '1.6', margin: 0 }}>
                Sem insights pendentes no momento. O mentor segue acompanhando seu comportamento para intervir quando fizer sentido.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Recomendações ── */}
      <div style={card}>
        <SectionHeader
          label="Próximos passos"
          title="Recomendações do mentor"
          subtitle="Ações práticas para destravar progresso e consolidar aprendizado."
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {recommendations.map((rec) => {
            const pb = priorityBadge[rec.priority]
            return (
              <div key={rec.id} style={innerCard}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#1A1F2E', margin: 0 }}>
                    {rec.title}
                  </h4>
                  <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px', backgroundColor: pb.bg, color: pb.color }}>
                    {rec.priority}
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: '1.6', margin: '0 0 16px 0' }}>
                  {rec.message}
                </p>

                {rec.action.kind === 'route' && rec.action.href ? (
                  <Link
                    to={rec.action.href}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      padding: '8px 16px', borderRadius: '8px',
                      backgroundColor: '#0D1B3E', color: '#FFFFFF',
                      fontSize: '13px', fontWeight: 500, textDecoration: 'none',
                    }}
                  >
                    {rec.actionLabel}
                    <ArrowRight size={14} />
                  </Link>
                ) : rec.action.kind === 'question' && rec.action.prompt ? (
                  <button
                    type="button"
                    onClick={() => onAskMentor(rec.action.prompt!)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      padding: '8px 16px', borderRadius: '8px',
                      border: '1px solid #E8ECF2', backgroundColor: '#FFFFFF',
                      color: '#1A1F2E', fontSize: '13px', fontWeight: 500,
                      cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    {rec.actionLabel}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onAskMentor('Quero revisar meu plano atual de estudo com você.')}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      padding: '8px 16px', borderRadius: '8px',
                      border: 'none', backgroundColor: 'transparent',
                      color: '#6B7280', fontSize: '13px', fontWeight: 500,
                      cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    Conversar com o mentor
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}
