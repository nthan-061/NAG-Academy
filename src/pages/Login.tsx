import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AlertCircle, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { AuthLeftColumn } from '@/components/auth/AuthLeftColumn'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Text } from '@/components/ui/Text'

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

      <main className="auth-content">
        <Card className="auth-surface" padding="none">
          <div className="flex flex-col gap-7">
            {confirmed && (
              <div className="auth-alert auth-alert-success">
                <CheckCircle size={18} className="mt-0.5 shrink-0" />
                <Text className="text-sm font-medium leading-6 text-success">
                  Email confirmado! Faca login para continuar.
                </Text>
              </div>
            )}

            <div className="space-y-2">
              <Text as="h2" variant="h2">
                Entrar na plataforma
              </Text>
              <Text tone="muted">
                Bem-vindo de volta a NAG Academy
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

              <div className="space-y-3">
                <Input
                  type="password"
                  label="Senha"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  autoComplete="current-password"
                />

                <div className="flex justify-end">
                  <Link to="/forgot-password" className="auth-link text-xs">
                    Esqueci minha senha
                  </Link>
                </div>
              </div>

              <Button type="submit" loading={loading} fullWidth size="lg">
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>

            <Text className="text-center">
              Nao tem uma conta?{' '}
              <Link to="/register" className="auth-link">
                Criar conta
              </Link>
            </Text>
          </div>
        </Card>
      </main>
    </div>
  )
}
