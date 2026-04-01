import type { ReactNode } from 'react'

export function PageLayout({ children }: { children: ReactNode }) {
  return (
    <main className="page-layout">
      <div className="page-layout__inner">
        {children}
      </div>
    </main>
  )
}
