import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'

export function Header() {
  const { signOut } = useAuth()
  const { profile } = useProfile()

  const nome = profile?.full_name ?? ''
  const initials = nome
    ? nome.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'NA'

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '56px',
      backgroundColor: '#0A1628',
      zIndex: 50,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <img
          src="/logo-white.png"
          alt="Nathan Academy"
          style={{ height: '28px', width: 'auto', objectFit: 'contain' }}
        />
        <span style={{ color: '#FFFFFF', fontSize: '15px', fontWeight: 400 }}>
          Nathan <strong style={{ fontWeight: 700 }}>Academy</strong>
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={signOut}
          style={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: '13px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'inherit',
            padding: '4px 8px',
            borderRadius: '6px',
          }}
          onMouseOver={(e) => { e.currentTarget.style.color = '#FFFFFF' }}
          onMouseOut={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)' }}
        >
          Sair
        </button>
        <div style={{
          width: '34px',
          height: '34px',
          borderRadius: '50%',
          backgroundColor: '#1E3A6E',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFFFFF',
          fontSize: '12px',
          fontWeight: 600,
          flexShrink: 0,
          userSelect: 'none',
        }}>
          {initials}
        </div>
      </div>
    </header>
  )
}
