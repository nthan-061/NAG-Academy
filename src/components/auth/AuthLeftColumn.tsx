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
    <aside className="auth-column hidden min-h-screen w-1/2 flex-col justify-center overflow-hidden bg-primary-deep px-12 lg:flex">
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.04]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="auth-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#auth-grid)" />
      </svg>

      <div className="relative z-10 mx-auto flex w-full max-w-[24rem] flex-col items-start">
        <img
          src="/logo-white.png"
          alt="Nathan Alves Group"
          className="mb-10 h-20 w-auto object-contain"
        />

        <h1 className="mb-3 whitespace-pre-line text-[2rem] font-bold leading-[1.25] tracking-[-0.03em] text-white">
          {headline}
        </h1>

        <p className="mb-9 max-w-[20rem] text-[15px] leading-7 text-white/65">
          {subtitle}
        </p>

        <div className="flex flex-col gap-4">
          {bullets.map((bullet) => (
            <div key={bullet.text} className="flex items-center gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/12">
                {bullet.icon === 'lock' ? <LockIcon /> : <CheckIcon />}
              </div>

              <span className="text-sm font-medium text-white/80">
                {bullet.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
