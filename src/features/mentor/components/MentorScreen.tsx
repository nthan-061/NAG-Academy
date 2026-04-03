import { useMemo, useState } from 'react'
import { AlertCircle, BookOpen, RefreshCcw, Target, Timer, TrendingUp } from 'lucide-react'
import { useMentor } from '../hooks'
import { MentorChat } from './MentorChat'
import { MentorInsights } from './MentorInsights'
import type React from 'react'

const metricStyles = [
  { icon: TrendingUp, color: '#2E5FD4', bg: '#EEF4FF' },
  { icon: Timer,      color: '#16A34A', bg: '#F0FDF4' },
  { icon: Target,     color: '#D97706', bg: '#FFF8DB' },
  { icon: BookOpen,   color: '#DC2626', bg: '#FEF2F2' },
] as const

const card: React.CSSProperties = {
  backgroundColor: '#FFFFFF',
  borderRadius: '12px',
  border: '1px solid #E8ECF2',
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  padding: '28px',
}

export function MentorScreen() {
  const {
    profile, analysis, insights, recommendations,
    messages, mentorContext, loading, sending, error,
    refreshMentor, sendMessage, acknowledgeInsight,
  } = useMentor()

  const [queuedPrompt, setQueuedPrompt] = useState<{ value: string; nonce: number } | null>(null)

  const summaryMetrics = useMemo(() => {
    if (!profile || !analysis) return []
    return [
      {
        label: 'Nível estimado',
        value: profile.estimatedLevel.label,
        helper: `${Math.round(profile.estimatedLevel.confidence * 100)}% de confiança`,
      },
      {
        label: 'Consistência',
        value: `${profile.consistency.consistencyScore}%`,
        helper: `${profile.consistency.activeDaysLast7} dias ativos na semana`,
      },
      {
        label: 'Acurácia recente',
        value: `${Math.round(profile.studyVelocity.recentAccuracy * 100)}%`,
        helper: analysis.status === 'critical'
          ? 'Precisa de reforço imediato'
          : analysis.status === 'attention'
          ? 'Vale reforçar tópicos'
          : 'Bom momento para avançar',
      },
      {
        label: 'Flashcards pendentes',
        value: String(profile.recentEngagement.pendingFlashcards),
        helper: `${profile.recentEngagement.overdueFlashcards} em atraso`,
      },
    ]
  }, [analysis, profile])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#0D1B3E] border-t-transparent" />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* ── Hero: título + métricas ── */}
      <div style={card}>
        {/* Título + botão */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1A1F2E', margin: '0 0 6px 0' }}>
              Mentor IA
            </h1>
            <p style={{ fontSize: '14px', color: '#6B7280', margin: 0, maxWidth: '580px', lineHeight: '1.6' }}>
              Uma leitura orientada do seu progresso, das dificuldades recorrentes e do próximo passo mais útil dentro da plataforma.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void refreshMentor()}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px', borderRadius: '8px',
              border: '1px solid #E8ECF2', backgroundColor: '#FFFFFF',
              color: '#6B7280', fontSize: '13px', fontWeight: 500,
              cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#D1D5DB' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E8ECF2' }}
          >
            <RefreshCcw size={14} />
            Atualizar diagnóstico
          </button>
        </div>

        {/* KPIs */}
        {!!summaryMetrics.length && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
            {summaryMetrics.map((metric, index) => {
              const style = metricStyles[index]
              const Icon = style.icon
              return (
                <div
                  key={metric.label}
                  style={{ backgroundColor: '#F8FAFF', borderRadius: '10px', border: '1px solid #E8ECF2', padding: '20px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '12px' }}>
                    <p style={{ fontSize: '12px', fontWeight: 500, color: '#9CA3AF', margin: 0 }}>
                      {metric.label}
                    </p>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                      backgroundColor: style.bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon size={15} color={style.color} />
                    </div>
                  </div>
                  <p style={{ fontSize: '22px', fontWeight: 700, color: '#1A1F2E', margin: '0 0 4px 0', textTransform: 'capitalize' }}>
                    {metric.value}
                  </p>
                  <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
                    {metric.helper}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Erro ── */}
      {error && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: '12px',
          padding: '16px 20px', borderRadius: '10px',
          border: '1px solid #FECACA', backgroundColor: '#FEF2F2',
        }}>
          <AlertCircle size={17} color="#DC2626" style={{ flexShrink: 0, marginTop: '1px' }} />
          <div>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#DC2626', margin: '0 0 2px 0' }}>
              Não foi possível carregar o diagnóstico do mentor.
            </p>
            <p style={{ fontSize: '13px', color: '#DC2626', margin: 0, opacity: 0.85 }}>{error}</p>
          </div>
        </div>
      )}

      <MentorInsights
        profile={profile}
        analysis={analysis}
        insights={insights}
        recommendations={recommendations}
        onAcknowledgeInsight={acknowledgeInsight}
        onAskMentor={(prompt) => setQueuedPrompt({ value: prompt, nonce: Date.now() })}
      />

      <MentorChat
        key={queuedPrompt?.nonce ?? 0}
        messages={messages}
        mentorContext={mentorContext}
        sending={sending}
        onSendMessage={sendMessage}
        initialPrompt={queuedPrompt?.value ?? ''}
      />

    </div>
  )
}
