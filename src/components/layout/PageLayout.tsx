import type { ReactNode } from 'react'
import { LayoutContainer } from './LayoutContainer'

interface PageLayoutProps {
  children: ReactNode
  variant?: 'default' | 'wide'
}

export function PageLayout({ children, variant = 'default' }: PageLayoutProps) {
  return (
    <main className="page-layout">
      <LayoutContainer
        size={variant === 'wide' ? 'wide' : 'default'}
        className="py-8"
      >
        {children}
      </LayoutContainer>
    </main>
  )
}
