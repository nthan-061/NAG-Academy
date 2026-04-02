import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { AuthLeftColumn } from '@/components/auth/AuthLeftColumn'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Text } from '@/components/ui/Text'

const LEFT_BULLETS = [
  { icon: 'lock' as const, text: 'Link expira em 24 horas por seguranca' },
]

export function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setLoading(true)

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (resetError) {
      setError('Ocorreu um erro. Verifique o email e tente novamente.')
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
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
          <div className="flex flex-col gap-7">
            <Link to="/login" className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition hover:text-primary">
              <ArrowLeft size={16} />
              Voltar para o login
            </Link>

            {sent ? (
              <div className="flex flex-col items-center gap-5 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success-soft text-success">
                  <CheckCircle size={28} />
                </div>

                <div className="space-y-2">
                  <Text as="h2" variant="h2">
                    Email enviado!
                  </Text>
                  <Text>
                    Enviamos as instrucoes de recuperacao para <strong className="text-foreground">{email}</strong>. Verifique sua caixa de entrada e clique no link para redefinir sua senha.
                  </Text>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Text as="h2" variant="h2">
                    Esqueceu a senha?
                  </Text>
                  <Text>
                    Digite seu email e enviaremos um link para redefinir sua senha.
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
                    type="email"
                    label="Email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    autoComplete="email"
                  />

                  <Button type="submit" loading={loading} fullWidth size="lg">
                    {loading ? 'Enviando...' : 'Enviar link de recuperacao'}
                  </Button>
                </form>
              </>
            )}
          </div>
        </Card>
      </main>
    </div>
  )
}
