import { useSearchParams, Link } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { AuthLeftColumn } from '@/components/auth/AuthLeftColumn'

const LEFT_BULLETS = [
  { icon: 'check' as const, text: 'Link de confirmação enviado por email' },
]

export function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') ?? ''

  return (
    <div className="flex min-h-screen" style={{ fontFamily: "'Inter', sans-serif" }}>
      <AuthLeftColumn
        headline={"Verifique\nseu email"}
        subtitle="Enviamos um link para ativar sua conta."
        bullets={LEFT_BULLETS}
      />

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
          textAlign: 'center',
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#EBF0FA',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            <Mail size={28} color="#2E5FD4" strokeWidth={1.5} />
          </div>

          <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#1A1F2E', margin: '0 0 12px 0' }}>
            Verifique seu email
          </h1>

          <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.6, margin: '0 0 8px 0' }}>
            Enviamos um link de confirmação para
          </p>
          {email && (
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#1A1F2E', margin: '0 0 16px 0' }}>
              {email}
            </p>
          )}
          <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.6, margin: '0 0 28px 0' }}>
            Clique no link para ativar sua conta. O email pode levar alguns minutos — verifique também a pasta de spam.
          </p>

          <div style={{
            backgroundColor: '#EBF0FA',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '24px',
            textAlign: 'left',
            fontSize: '13px',
            color: '#2E5FD4',
          }}>
            <strong>Dica:</strong> O link expira em 24 horas. Se não receber, tente criar a conta novamente.
          </div>

          <Link
            to="/login"
            style={{ fontSize: '14px', fontWeight: 500, color: '#2E5FD4', textDecoration: 'none' }}
          >
            Voltar para o login
          </Link>
        </div>
      </div>
    </div>
  )
}
