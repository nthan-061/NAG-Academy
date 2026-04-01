interface Bullet {
  icon: 'check' | 'lock'
  text: string
}

interface AuthLeftColumnProps {
  headline: string
  subtitle: string
  bullets: Bullet[]
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2.5" y="5.5" width="7" height="5" rx="1" stroke="white" strokeWidth="1.5" />
      <path d="M4 5.5V4a2 2 0 1 1 4 0v1.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function AuthLeftColumn({ headline, subtitle, bullets }: AuthLeftColumnProps) {
  return (
    <div
      className="hidden md:flex md:w-1/2 min-h-screen flex-col items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: '#0D1B3E', padding: '48px' }}
    >
      {/* Grid de fundo */}
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0.04 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="auth-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#auth-grid)" />
      </svg>

      <div className="relative z-10 flex flex-col items-start" style={{ maxWidth: '380px', width: '100%' }}>
        {/* Logo */}
        <img
          src="/logo-white.png"
          alt="Nathan Alves Group"
          style={{ height: '80px', width: 'auto', objectFit: 'contain', marginBottom: '40px' }}
        />

        {/* Headline */}
        <h1 style={{
          fontSize: '32px',
          fontWeight: 700,
          color: '#FFFFFF',
          lineHeight: 1.25,
          marginBottom: '12px',
          whiteSpace: 'pre-line',
        }}>
          {headline}
        </h1>

        {/* Subtítulo */}
        <p style={{
          fontSize: '15px',
          color: 'rgba(255,255,255,0.65)',
          lineHeight: 1.6,
          marginBottom: '36px',
          maxWidth: '320px',
        }}>
          {subtitle}
        </p>

        {/* Bullets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {bullets.map((b) => (
            <div key={b.text} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                {b.icon === 'lock' ? <LockIcon /> : <CheckIcon />}
              </div>
              <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                {b.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
