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

/*
  Spacing system for this column:
  - Outer panel:  px 72px, py 64px  — real distance from all four edges
  - Content wrapper: max-w 420px, centered, fills the vertical space
  - Internal gaps:  logo → title 52px, title → subtitle 20px, subtitle → bullets 44px
  - Bottom seal:  its own pt 40px separates it from bullets; panel pb 64px gives
    the seal 64px from the bottom edge — never looks stuck
*/
export function AuthLeftColumn({ headline, subtitle, bullets }: AuthLeftColumnProps) {
  return (
    <aside
      className="hidden lg:flex"
      style={{
        position: 'relative',
        width: '50%',
        minHeight: '100vh',
        flexDirection: 'column',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #091327 0%, #0d1b3e 100%)',
        // Generous outer padding at every edge
        padding: '64px 72px',
      }}
    >
      {/* Subtle grid pattern */}
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.04, pointerEvents: 'none' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="auth-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#auth-grid)" />
      </svg>

      {/* Radial glow accents */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at top left, rgba(46,95,212,0.18), transparent 34%), radial-gradient(circle at bottom left, rgba(255,255,255,0.05), transparent 28%)',
          pointerEvents: 'none',
        }}
      />

      {/*
        Main content block — vertically centered, max-w 420px.
        flex-1 + justify-center ensures it takes all available height
        and sits in the middle regardless of viewport height.
      */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          width: '100%',
          maxWidth: '420px',
        }}
      >
        {/* Logo */}
        <img
          src="/logo-white.png"
          alt="Nathan Alves Group"
          style={{
            height: '72px',
            width: 'auto',
            objectFit: 'contain',
            objectPosition: 'left',
            opacity: 0.95,
            marginBottom: '52px',
          }}
        />

        {/* Headline */}
        <h1
          style={{
            fontSize: '3.25rem',
            fontWeight: 700,
            lineHeight: 1.02,
            letterSpacing: '-0.05em',
            color: '#FFFFFF',
            whiteSpace: 'pre-line',
            margin: '0 0 20px 0',
          }}
        >
          {headline}
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: '1rem',
            lineHeight: 1.85,
            color: 'rgba(255,255,255,0.70)',
            margin: '0 0 44px 0',
            maxWidth: '360px',
          }}
        >
          {subtitle}
        </p>

        {/* Bullets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {bullets.map((bullet) => (
            <div key={bullet.text} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  flexShrink: 0,
                  borderRadius: '50%',
                  border: '1px solid rgba(255,255,255,0.12)',
                  backgroundColor: 'rgba(255,255,255,0.10)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {bullet.icon === 'lock' ? <LockIcon /> : <CheckIcon />}
              </div>
              <span style={{ fontSize: '1rem', fontWeight: 500, lineHeight: 1.6, color: 'rgba(255,255,255,0.82)' }}>
                {bullet.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/*
        Bottom seal — sits below the main block.
        pt-40px = clear breathing gap from bullets above.
        The panel's pb-64px gives 64px from the bottom edge.
      */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: '420px',
          paddingTop: '40px',
        }}
      >
        <div
          style={{
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.10)',
            backgroundColor: 'rgba(255,255,255,0.06)',
            padding: '20px 24px',
            backdropFilter: 'blur(8px)',
          }}
        >
          <p
            style={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.45)',
              margin: '0 0 10px 0',
            }}
          >
            NAG Academy
          </p>
          <p style={{ fontSize: '13px', lineHeight: 1.75, color: 'rgba(255,255,255,0.72)', margin: 0 }}>
            Um ambiente de estudo pensado para transformar conteúdo em prática, repetição e progresso visível.
          </p>
        </div>
      </div>
    </aside>
  )
}
