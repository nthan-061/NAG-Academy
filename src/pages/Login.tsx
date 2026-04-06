import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AlertCircle, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { AuthLeftColumn } from '@/components/auth/AuthLeftColumn'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

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
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

      if (signInError) {
        if (signInError.message.includes('Email not confirmed')) {
          setError('Confirme seu email antes de fazer login. Verifique sua caixa de entrada.')
        } else if (signInError.message.includes('Invalid login credentials')) {
          setError('Email ou senha incorretos.')
        } else {
          setError(signInError.message || 'Ocorreu um erro. Tente novamente.')
        }
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

      {/* Right side — authentication panel */}
      <main
        style={{
          display: 'flex',
          minHeight: '100vh',
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
        }}
        className="lg:w-1/2"
      >
        {/*
          Card — same vocabulary as Dashboard cards but adapted for auth:
          white bg, clean border, strong shadow.
          max-w 480px — wide enough for comfortable form, contained for focus.
          No nested Card component: plain div with explicit inline styles.
        */}
        <div
          style={{
            width: '100%',
            maxWidth: '480px',
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            border: '1px solid #E8ECF2',
            boxShadow: '0 8px 40px rgba(10,22,40,0.10)',
            overflow: 'hidden',
          }}
        >
          {/* ── Header section ── */}
          <div
            style={{
              padding: '36px 40px 28px',
              borderBottom: '1px solid #E8ECF2',
            }}
          >
            {/* Kicker */}
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
                marginBottom: '16px',
              }}
            >
              NAG Academy
            </span>

            <h2
              style={{
                fontSize: '24px',
                fontWeight: 700,
                lineHeight: 1.2,
                color: '#1A1F2E',
                margin: '0 0 8px 0',
              }}
            >
              Entrar na plataforma
            </h2>

            <p
              style={{
                fontSize: '14px',
                lineHeight: 1.7,
                color: '#6B7280',
                margin: 0,
              }}
            >
              Bem-vindo de volta à NAG Academy
            </p>
          </div>

          {/* ── Form section ── */}
          <div style={{ padding: '28px 40px 32px' }}>

            {/* Success alert */}
            {confirmed && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1px solid rgba(22,163,74,0.20)',
                  backgroundColor: '#F0FDF4',
                  marginBottom: '24px',
                }}
              >
                <CheckCircle size={16} style={{ color: '#16A34A', marginTop: '2px', flexShrink: 0 }} />
                <p style={{ fontSize: '13px', lineHeight: 1.6, color: '#16A34A', margin: 0 }}>
                  Email confirmado! Faça login para continuar.
                </p>
              </div>
            )}

            {/* Error alert */}
            {error && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1px solid rgba(220,38,38,0.15)',
                  backgroundColor: '#FEF2F2',
                  marginBottom: '24px',
                }}
              >
                <AlertCircle size={16} style={{ color: '#DC2626', marginTop: '2px', flexShrink: 0 }} />
                <p style={{ fontSize: '13px', lineHeight: 1.6, color: '#DC2626', margin: 0 }}>
                  {error}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <Input
                type="email"
                label="Email"
                placeholder="seu@email.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                    style={{
                      fontSize: '13px',
                      fontWeight: 500,
                      color: '#2E5FD4',
                      textDecoration: 'none',
                    }}
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

          {/* ── Footer section ── */}
          <div
            style={{
              borderTop: '1px solid #E8ECF2',
              padding: '20px 40px 28px',
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
              Não tem uma conta?{' '}
              <Link
                to="/register"
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#2E5FD4',
                  textDecoration: 'none',
                }}
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
