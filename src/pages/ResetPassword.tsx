import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, AlertCircle, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { AuthLeftColumn } from '@/components/auth/AuthLeftColumn'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Text } from '@/components/ui/Text'

const LEFT_BULLETS = [
  { icon: 'lock' as const, text: 'Link expira em 24 horas por seguranca' },
]

export function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.')
      return
    }

    if (password !== confirm) {
      setError('As senhas nao coincidem.')
      return
    }

    setLoading(true)

    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
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

  return (
    <div className="auth-shell">
      <AuthLeftColumn
        headline={'Recupere\nseu acesso'}
        subtitle="Enviaremos um link seguro para redefinir sua senha."
        bullets={LEFT_BULLETS}
      />

      <main className="auth-content">
        <Card className="auth-surface" padding="none">
          {success ? (
            <div className="flex flex-col items-center gap-5 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success-soft text-success">
                <CheckCircle size={28} />
              </div>

              <div className="space-y-2">
                <Text as="h2" variant="h2">
                  Senha redefinida!
                </Text>
                <Text>
                  Sua senha foi alterada com sucesso. Redirecionando para o login...
                </Text>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-7">
              <div className="space-y-2">
                <Text as="h2" variant="h2">
                  Redefinir senha
                </Text>
                <Text>
                  Digite sua nova senha abaixo.
                </Text>
              </div>

              {error && (
                <div className="auth-alert auth-alert-danger">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <Text className="text-sm leading-6 text-danger">
                    {error}
                  </Text>
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input
                  type="password"
                  label="Nova senha"
                  placeholder="Minimo 8 caracteres"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  autoComplete="new-password"
                  leftIcon={<Lock size={16} />}
                />

                <Input
                  type="password"
                  label="Confirmar nova senha"
                  placeholder="Repita a senha"
                  value={confirm}
                  onChange={(event) => setConfirm(event.target.value)}
                  required
                  autoComplete="new-password"
                  leftIcon={<Lock size={16} />}
                />

                <Button type="submit" loading={loading} fullWidth size="lg">
                  {loading ? 'Salvando...' : 'Salvar nova senha'}
                </Button>
              </form>
            </div>
          )}
        </Card>
      </main>
    </div>
  )
}
