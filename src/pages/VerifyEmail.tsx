import { useSearchParams, Link } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { AuthLeftColumn } from '@/components/auth/AuthLeftColumn'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Text } from '@/components/ui/Text'

const LEFT_BULLETS = [
  { icon: 'check' as const, text: 'Link de confirmacao enviado por email' },
]

export function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') ?? ''

  return (
    <div className="auth-shell">
      <AuthLeftColumn
        headline={'Verifique\nseu email'}
        subtitle="Enviamos um link para ativar sua conta."
        bullets={LEFT_BULLETS}
      />

      <main className="auth-content">
        <Card className="auth-surface text-center" padding="none">
          <div className="flex flex-col items-center gap-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary-soft text-secondary">
              <Mail size={28} strokeWidth={1.5} />
            </div>

            <div className="space-y-3">
              <Text as="h1" variant="h2">
                Verifique seu email
              </Text>
              <Text className="max-w-[22rem]">
                Enviamos um link de confirmacao para sua caixa de entrada.
              </Text>
            </div>

            {email && (
              <Badge variant="info" className="px-4 py-1.5 text-xs font-semibold">
                {email}
              </Badge>
            )}

            <Text className="max-w-[24rem]">
              Clique no link para ativar sua conta. O email pode levar alguns minutos e tambem pode cair na pasta de spam.
            </Text>

            <div className="w-full rounded-lg border border-secondary/15 bg-secondary-soft/70 p-4 text-left">
              <Text as="p" className="text-sm leading-6 text-secondary">
                <strong>Dica:</strong> O link expira em 24 horas. Se nao receber, tente criar a conta novamente.
              </Text>
            </div>

            <Link to="/login" className="auth-link">
              Voltar para o login
            </Link>
          </div>
        </Card>
      </main>
    </div>
  )
}
