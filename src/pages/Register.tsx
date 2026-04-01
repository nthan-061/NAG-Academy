import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { AuthLeftColumn } from '@/components/auth/AuthLeftColumn'

const LEFT_BULLETS = [
  { icon: 'check' as const, text: 'Trilhas de conteúdo estruturadas' },
  { icon: 'check' as const, text: 'Quiz com IA para fixar o conhecimento' },
  { icon: 'check' as const, text: 'Flashcards com repetição espaçada SM-2' },
]

export function Register() {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function validatePassword(pwd: string): string {
    if (pwd.length < 8) return 'A senha deve ter pelo menos 8 caracteres.'
    return ''
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    const pwdError = validatePassword(password)
    if (pwdError) {
      setError(pwdError)
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo: `${window.location.origin}/login?confirmed=true`,
        },
      })

      if (error) {
        console.error('[Register] signUp error:', error)
        if (error.message.includes('already registered') || error.message.includes('User already registered')) {
          setError('Este email já está cadastrado. Tente fazer login.')
        } else {
          setError(error.message || 'Ocorreu um erro ao criar sua conta. Tente novamente.')
        }
        setLoading(false)
        return
      }

      navigate(`/verify-email?email=${encodeURIComponent(email)}`)
    } catch (err) {
      console.error('[Register] unexpected error:', err)
      setError('Erro de conexão. Verifique sua internet e tente novamente.')
      setLoading(false)
    }
  }

  const inputStyle = {
    padding: '11px 14px',
    border: '1.5px solid #E8ECF2',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#1A1F2E',
    outline: 'none',
    backgroundColor: '#FFFFFF',
    fontFamily: "'Inter', sans-serif",
    width: '100%',
    boxSizing: 'border-box' as const,
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
          <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#1A1F2E', margin: '0 0 6px 0' }}>
            Criar conta
          </h2>
          <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 28px 0' }}>
            Comece sua jornada na NAG Academy
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
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>Nome completo</label>
              <input
                type="text"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = '#2E5FD4' }}
                onBlur={(e) => { e.target.style.borderColor = '#E8ECF2' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>Email</label>
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = '#2E5FD4' }}
                onBlur={(e) => { e.target.style.borderColor = '#E8ECF2' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>Senha</label>
              <input
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = '#2E5FD4' }}
                onBlur={(e) => { e.target.style.borderColor = '#E8ECF2' }}
              />
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
              {loading ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '14px', color: '#6B7280', marginTop: '24px', marginBottom: 0 }}>
            Já tem uma conta?{' '}
            <Link to="/login" style={{ color: '#2E5FD4', fontWeight: 500, textDecoration: 'none' }}>
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
