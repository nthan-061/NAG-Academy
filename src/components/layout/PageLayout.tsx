import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface PageLayoutProps {
  children: ReactNode
  variant?: 'default' | 'wide'
}

export function PageLayout({ children, variant = 'default' }: PageLayoutProps) {
  return (
    <main className="page-layout">
      <div className={cn('page-layout__inner', variant === 'wide' && 'page-layout__inner--wide')}>
        {children}
      </div>
    </main>
  )
}
