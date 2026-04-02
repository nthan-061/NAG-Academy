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
    <aside className="auth-column relative hidden min-h-screen w-1/2 flex-col justify-between overflow-hidden bg-[linear-gradient(180deg,#091327_0%,#0d1b3e_100%)] px-14 py-12 lg:flex">
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

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(46,95,212,0.18),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.05),transparent_28%)]" />

      <div className="relative z-10 mx-auto flex w-full max-w-[28rem] flex-1 flex-col justify-center">
        <img
          src="/logo-white.png"
          alt="Nathan Alves Group"
          className="mb-12 h-20 w-auto object-contain opacity-95"
        />

        <h1 className="mb-5 whitespace-pre-line text-[3.25rem] font-bold leading-[1.02] tracking-[-0.05em] !text-white">
          {headline}
        </h1>

        <p className="mb-10 max-w-[24rem] text-[1.02rem] leading-8 text-white/72">
          {subtitle}
        </p>

        <div className="flex flex-col gap-4">
          {bullets.map((bullet) => (
            <div key={bullet.text} className="flex items-center gap-3.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/10">
                {bullet.icon === 'lock' ? <LockIcon /> : <CheckIcon />}
              </div>

              <span className="text-[1rem] font-medium leading-7 text-white/84">
                {bullet.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 mx-auto hidden w-full max-w-[28rem] lg:block">
        <div className="rounded-[1.4rem] border border-white/10 bg-white/6 px-5 py-5 backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/48">
            NAG Academy
          </p>
          <p className="mt-3 text-sm leading-7 text-white/78">
            Um ambiente de estudo pensado para transformar conteudo em pratica, repeticao e progresso visivel.
          </p>
        </div>
      </div>
    </aside>
  )
}
