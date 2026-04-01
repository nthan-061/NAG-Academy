import type { ReactNode } from 'react'

export function PageLayout({ children }: { children: ReactNode }) {
  return (
    <main style={{
      marginLeft: '240px',
      paddingTop: '56px',
      minHeight: '100vh',
      backgroundColor: '#F5F6FA',
    }}>
      <div style={{ padding: '40px' }}>
        {children}
      </div>
    </main>
  )
}
