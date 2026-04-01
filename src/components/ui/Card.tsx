import type { ReactNode, CSSProperties } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
  padding?: string
}

export function Card({ children, className = '', style, padding = '24px' }: CardProps) {
  return (
    <div
      className={className}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid #E8ECF2',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        padding,
        ...style,
      }}
    >
      {children}
    </div>
  )
}
