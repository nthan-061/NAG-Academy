import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
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

export function Register() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function validatePassword(value: string) {
    if (value.length < 8) return 'A senha deve ter pelo menos 8 caracteres.'
    return ''
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')

    const passwordError = validatePassword(password)
    if (passwordError) {
      setError(passwordError)
      return
    }

    setLoading(true)

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo: `${window.location.origin}/login?confirmed=true`,
        },
      })

      if (signUpError) {
        if (signUpError.message.includes('already registered') || signUpError.message.includes('User already registered')) {
          setError('Este email ja esta cadastrado. Tente fazer login.')
        } else {
          setError(signUpError.message || 'Ocorreu um erro ao criar sua conta. Tente novamente.')
        }
        setLoading(false)
        return
      }

      navigate(`/verify-email?email=${encodeURIComponent(email)}`)
    } catch (registerError) {
      console.error('[Register] unexpected error:', registerError)
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
            <div className="space-y-2">
              <Text as="h2" variant="h2">
                Criar conta
              </Text>
              <Text tone="muted">
                Comece sua jornada na NAG Academy
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
                type="text"
                label="Nome completo"
                placeholder="Seu nome"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                autoComplete="name"
              />

              <Input
                type="email"
                label="Email"
                placeholder="seu@email.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
              />

              <Input
                type="password"
                label="Senha"
                placeholder="Minimo 8 caracteres"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                autoComplete="new-password"
                helperText="Use pelo menos 8 caracteres."
              />

              <Button type="submit" loading={loading} fullWidth size="lg">
                {loading ? 'Criando conta...' : 'Criar conta'}
              </Button>
            </form>

            <Text className="text-center">
              Ja tem uma conta?{' '}
              <Link to="/login" className="auth-link">
                Entrar
              </Link>
            </Text>
          </div>
        </Card>
      </main>
    </div>
  )
}
