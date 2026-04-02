import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'
import { theme } from '@/design/theme'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg' | '0'
  tone?: 'default' | 'muted' | 'interactive'
}

const paddingClasses = {
  none: '',
  0: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
} as const

const toneClasses = {
  default: theme.tailwind.card.base,
  muted: theme.tailwind.card.muted,
  interactive: theme.tailwind.card.interactive,
} as const

export function Card({
  className,
  padding = 'md',
  tone = 'default',
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(toneClasses[tone], paddingClasses[padding], className)}
      {...props}
    >
      {children}
    </div>
  )
}
