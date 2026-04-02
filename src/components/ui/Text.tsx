import type { ElementType, ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { theme } from '@/design/theme'

type TextVariant = 'h1' | 'h2' | 'h3' | 'body' | 'bodyStrong' | 'label' | 'caption'
type TextTone = 'default' | 'muted' | 'accent' | 'success' | 'danger'

interface TextProps<T extends ElementType> {
  as?: T
  variant?: TextVariant
  tone?: TextTone
  className?: string
  children: ReactNode
}

const toneClasses: Record<TextTone, string> = {
  default: '',
  muted: 'text-text-secondary',
  accent: 'text-secondary',
  success: 'text-success',
  danger: 'text-danger',
}

export function Text<T extends ElementType = 'p'>({
  as,
  variant = 'body',
  tone = 'default',
  className,
  children,
}: TextProps<T>) {
  const Component = as ?? 'p'

  return (
    <Component
      className={cn(theme.tailwind.text[variant], toneClasses[tone], className)}
    >
      {children}
    </Component>
  )
}
