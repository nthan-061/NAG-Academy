import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, AlertCircle, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { AuthLeftColumn } from '@/components/auth/AuthLeftColumn'

const LEFT_BULLETS = [
  { icon: 'lock' as const, text: 'Link expira em 24 horas por segurança' },
]

export function ResetPassword() {
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.')
      return
    }
    if (password !== confirm) {
      setError('As senhas não coincidem.')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError('Ocorreu um erro ao redefinir a senha. O link pode ter expirado.')
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)

    setTimeout(async () => {
      await supabase.auth.signOut()
      navigate('/login')
    }, 2000)
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
          {success ? (
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
                Senha redefinida!
              </h2>
              <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
                Sua senha foi alterada com sucesso. Redirecionando para o login...
              </p>
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#1A1F2E', margin: '0 0 6px 0' }}>
                Redefinir senha
              </h2>
              <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 28px 0' }}>
                Digite sua nova senha abaixo.
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
                  <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>
                    <Lock size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                    Nova senha
                  </label>
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

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>
                    <Lock size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                    Confirmar nova senha
                  </label>
                  <input
                    type="password"
                    placeholder="Repita a senha"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
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
                  {loading ? 'Salvando...' : 'Salvar nova senha'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
