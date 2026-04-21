import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AlertCircle, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { AuthLeftColumn } from '@/components/auth/AuthLeftColumn'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { getAuthErrorMessage } from '@/features/auth/utils'

const LEFT_BULLETS = [
  { icon: 'check' as const, text: 'Trilhas de conteudo estruturadas' },
  { icon: 'check' as const, text: 'Quiz com IA para fixar o conhecimento' },
  { icon: 'check' as const, text: 'Flashcards com repeticao espacada SM-2' },
]

export function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const confirmed = searchParams.get('confirmed') === 'true'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password })

      if (signInError) {
        setError(getAuthErrorMessage(signInError, 'Ocorreu um erro ao entrar. Tente novamente.'))
        setLoading(false)
        return
      }

      navigate('/')
    } catch (loginError) {
      console.error('[Login] unexpected error:', loginError)
      setError('Erro de conexao. Verifique sua internet e tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div className="auth-shell">
      <AuthLeftColumn
        headline={'Aprenda.\nPratique.\nDomine.'}
        subtitle="A plataforma de aprendizado do ecossistema Nathan Alves Group."
        bullets={LEFT_BULLETS}
      />

      {/* Right side — authentication panel
          Panel padding: 64px vertical, 48px horizontal on desktop.
          This gives the card room to breathe INSIDE the half-screen column
          before we even think about the card's own padding.
      */}
      <main
        style={{
          display: 'flex',
          minHeight: '100vh',
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 24px',
        }}
        className="lg:w-1/2 lg:px-16"
      >
        {/*
          Card: max-w 520px — wider than before (was 480px) so inputs
          have real horizontal room. All three zones use 52px horizontal
          padding, ensuring content never feels close to the card edges.
        */}
        <div
          style={{
            width: '100%',
            maxWidth: '520px',
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            border: '1px solid #E8ECF2',
            boxShadow: '0 8px 40px rgba(10,22,40,0.10)',
            overflow: 'hidden',
          }}
        >
          {/* ── Header zone: 44px top, 52px sides, 36px bottom ── */}
          <div style={{ padding: '44px 52px 36px', borderBottom: '1px solid #E8ECF2' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '3px 10px',
                borderRadius: '6px',
                backgroundColor: '#EBF0FA',
                color: '#2E5FD4',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.10em',
                textTransform: 'uppercase',
                marginBottom: '20px',
              }}
            >
              NAG Academy
            </span>

            <h2
              style={{
                fontSize: '26px',
                fontWeight: 700,
                lineHeight: 1.2,
                color: '#1A1F2E',
                margin: '0 0 10px 0',
              }}
            >
              Entrar na plataforma
            </h2>

            <p style={{ fontSize: '14px', lineHeight: 1.75, color: '#6B7280', margin: 0 }}>
              Bem-vindo de volta à NAG Academy
            </p>
          </div>

          {/* ── Form zone: 36px top, 52px sides, 40px bottom ── */}
          <div style={{ padding: '36px 52px 40px' }}>

            {confirmed && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '14px 18px',
                  borderRadius: '10px',
                  border: '1px solid rgba(22,163,74,0.20)',
                  backgroundColor: '#F0FDF4',
                  marginBottom: '28px',
                }}
              >
                <CheckCircle size={16} style={{ color: '#16A34A', marginTop: '2px', flexShrink: 0 }} />
                <p style={{ fontSize: '13px', lineHeight: 1.65, color: '#16A34A', margin: 0 }}>
                  Email confirmado! Faça login para continuar.
                </p>
              </div>
            )}

            {error && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '14px 18px',
                  borderRadius: '10px',
                  border: '1px solid rgba(220,38,38,0.15)',
                  backgroundColor: '#FEF2F2',
                  marginBottom: '28px',
                }}
              >
                <AlertCircle size={16} style={{ color: '#DC2626', marginTop: '2px', flexShrink: 0 }} />
                <p style={{ fontSize: '13px', lineHeight: 1.65, color: '#DC2626', margin: 0 }}>
                  {error}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <Input
                type="email"
                label="Email"
                placeholder="seu@email.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Input
                  type="password"
                  label="Senha"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  autoComplete="current-password"
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Link
                    to="/forgot-password"
                    style={{ fontSize: '13px', fontWeight: 500, color: '#2E5FD4', textDecoration: 'none' }}
                  >
                    Esqueci minha senha
                  </Link>
                </div>
              </div>

              <Button type="submit" loading={loading} fullWidth size="lg">
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </div>

          {/* ── Footer zone: 24px top, 52px sides, 36px bottom ── */}
          <div
            style={{
              borderTop: '1px solid #E8ECF2',
              padding: '24px 52px 36px',
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
              Não tem uma conta?{' '}
              <Link
                to="/register"
                style={{ fontSize: '14px', fontWeight: 600, color: '#2E5FD4', textDecoration: 'none' }}
              >
                Criar conta
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
