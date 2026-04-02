import type { ReactNode, CSSProperties } from 'react'
import { cn } from '@/lib/cn'

interface CardProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
  padding?: string
}

export function Card({ children, className = '', style, padding = '24px' }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-[#E8ECF2] bg-white shadow-[0_16px_40px_rgba(10,22,40,0.06)]',
        className,
      )}
      style={{
        padding,
        ...style,
      }}
    >
      {children}
    </div>
  )
}
