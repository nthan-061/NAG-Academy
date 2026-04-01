import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { AuthLeftColumn } from '@/components/auth/AuthLeftColumn'

const LEFT_BULLETS = [
  { icon: 'lock' as const, text: 'Link expira em 24 horas por segurança' },
]

export function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      setError('Ocorreu um erro. Verifique o email e tente novamente.')
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Coluna esquerda */}
      <AuthLeftColumn
        headline={"Recupere\nseu acesso"}
        subtitle="Enviaremos um link seguro para redefinir sua senha."
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
          <Link
            to="/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px',
              color: '#6B7280',
              textDecoration: 'none',
              marginBottom: '24px',
            }}
          >
            <ArrowLeft size={16} />
            Voltar para o login
          </Link>

          {sent ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#F0FDF4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
              }}>
                <CheckCircle size={28} color="#16A34A" />
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#1A1F2E', margin: '0 0 12px 0' }}>
                Email enviado!
              </h2>
              <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.6, margin: 0 }}>
                Enviamos as instruções de recuperação para{' '}
                <strong style={{ color: '#1A1F2E' }}>{email}</strong>. Verifique sua caixa de
                entrada e clique no link para redefinir sua senha.
              </p>
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#1A1F2E', margin: '0 0 6px 0' }}>
                Esqueceu a senha?
              </h2>
              <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 28px 0' }}>
                Digite seu email e enviaremos um link para redefinir sua senha.
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
                  {loading ? 'Enviando...' : 'Enviar link de recuperação'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
