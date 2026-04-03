import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type LayoutContainerSize = 'default' | 'wide' | 'narrow'

interface LayoutContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  size?: LayoutContainerSize
}

const sizeClasses: Record<LayoutContainerSize, string> = {
  default: 'max-w-6xl',
  wide: 'max-w-7xl',
  narrow: 'max-w-3xl',
}

export function LayoutContainer({
  children,
  className,
  size = 'default',
  ...props
}: LayoutContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-4 sm:px-6 lg:px-8',
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
