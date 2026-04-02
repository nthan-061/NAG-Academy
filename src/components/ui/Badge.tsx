import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'info' | 'success' | 'warning' | 'danger'
  children: ReactNode
}

export function Badge({ variant = 'default', children, className, ...props }: BadgeProps) {
  const variantClasses =
    variant === 'info'
      ? 'bg-[#EEF4FF] text-[#2E5FD4]'
      : variant === 'success'
        ? 'bg-[#F0FDF4] text-[#16A34A]'
        : variant === 'warning'
          ? 'bg-[#FFF8DB] text-[#B45309]'
          : variant === 'danger'
            ? 'bg-[#FEF2F2] text-[#DC2626]'
            : 'bg-[#F5F6FA] text-[#1A1F2E]'

  return (
    <span
      className={cn(
        'inline-flex min-h-[28px] items-center justify-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.04em]',
        variantClasses,
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}
