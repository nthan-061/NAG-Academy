import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { AuthLeftColumn } from '@/components/auth/AuthLeftColumn'

const LEFT_BULLETS = [
  { icon: 'check' as const, text: 'Trilhas de conteúdo estruturadas' },
  { icon: 'check' as const, text: 'Quiz com IA para fixar o conhecimento' },
  { icon: 'check' as const, text: 'Flashcards com repetição espaçada SM-2' },
]

export function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const confirmed = searchParams.get('confirmed') === 'true'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        console.error('[Login] signIn error:', error)
        if (error.message.includes('Email not confirmed')) {
          setError('Confirme seu email antes de fazer login. Verifique sua caixa de entrada.')
        } else if (error.message.includes('Invalid login credentials')) {
          setError('Email ou senha incorretos.')
        } else {
          setError(error.message || 'Ocorreu um erro. Tente novamente.')
        }
        setLoading(false)
        return
      }

      navigate('/')
    } catch (err) {
      console.error('[Login] unexpected error:', err)
      setError('Erro de conexão. Verifique sua internet e tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Coluna esquerda */}
      <AuthLeftColumn
        headline={"Aprenda.\nPratique.\nDomine."}
        subtitle="A plataforma de aprendizado do ecossistema Nathan Alves Group."
        bullets={LEFT_BULLETS}
      />

      {/* Coluna direita */}
      <div
        className="flex w-full md:w-1/2 min-h-screen items-center justify-center"
        style={{ backgroundColor: '#F5F6FA', padding: '24px' }}
      >
        <div style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '40px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
        }}>

          {/* Banner email confirmado */}
          {confirmed && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: '#F0FDF4',
              border: '1px solid #86EFAC',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '24px',
            }}>
              <CheckCircle size={18} color="#16A34A" style={{ flexShrink: 0 }} />
              <p style={{ fontSize: '14px', fontWeight: 500, color: '#16A34A', margin: 0 }}>
                Email confirmado! Faça login para continuar.
              </p>
            </div>
          )}

          <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#1A1F2E', margin: '0 0 6px 0' }}>
            Entrar na plataforma
          </h2>
          <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 28px 0' }}>
            Bem-vindo de volta à NAG Academy
          </p>

          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '20px',
            }}>
              <AlertCircle size={18} color="#DC2626" style={{ flexShrink: 0, marginTop: '1px' }} />
              <p style={{ fontSize: '14px', color: '#DC2626', margin: 0 }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>Email</label>
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                style={{
                  padding: '11px 14px',
                  border: '1.5px solid #E8ECF2',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#1A1F2E',
                  outline: 'none',
                  backgroundColor: '#FFFFFF',
                  fontFamily: "'Inter', sans-serif",
                }}
                onFocus={(e) => { e.target.style.borderColor = '#2E5FD4' }}
                onBlur={(e) => { e.target.style.borderColor = '#E8ECF2' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>Senha</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                style={{
                  padding: '11px 14px',
                  border: '1.5px solid #E8ECF2',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#1A1F2E',
                  outline: 'none',
                  backgroundColor: '#FFFFFF',
                  fontFamily: "'Inter', sans-serif",
                }}
                onFocus={(e) => { e.target.style.borderColor = '#2E5FD4' }}
                onBlur={(e) => { e.target.style.borderColor = '#E8ECF2' }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Link
                  to="/forgot-password"
                  style={{ fontSize: '12px', color: '#2E5FD4', textDecoration: 'none' }}
                >
                  Esqueci minha senha
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '13px',
                backgroundColor: '#0D1B3E',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontFamily: "'Inter', sans-serif",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading && (
                <span style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff',
                  borderRadius: '50%',
                  display: 'inline-block',
                  animation: 'spin 0.7s linear infinite',
                }} />
              )}
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '14px', color: '#6B7280', marginTop: '24px', marginBottom: 0 }}>
            Não tem uma conta?{' '}
            <Link to="/register" style={{ color: '#2E5FD4', fontWeight: 500, textDecoration: 'none' }}>
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
