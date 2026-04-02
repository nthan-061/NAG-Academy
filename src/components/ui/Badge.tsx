import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { theme } from '@/design/theme'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'info' | 'success' | 'warning' | 'danger'
  children: ReactNode
}

const badgeVariants = {
  default: theme.tailwind.badge.neutral,
  info: theme.tailwind.badge.info,
  success: theme.tailwind.badge.success,
  warning: theme.tailwind.badge.warning,
  danger: theme.tailwind.badge.danger,
} as const

export function Badge({ variant = 'default', children, className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex min-h-7 items-center justify-center rounded-full px-3 py-1 text-[11px] font-semibold',
        badgeVariants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}
