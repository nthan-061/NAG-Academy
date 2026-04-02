import { type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: ReactNode
  fullWidth?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  children,
  disabled,
  className,
  style,
  ...props
}: ButtonProps) {
  const base: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontWeight: 500,
    fontFamily: 'inherit',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.5 : 1,
    border: 'none',
    borderRadius: '8px',
    transition: 'background-color 0.2s, opacity 0.2s, border-color 0.2s',
    width: fullWidth ? '100%' : undefined,
    whiteSpace: 'nowrap',
  }

  const sizeStyles: React.CSSProperties =
    size === 'sm' ? { fontSize: '13px', padding: '0 14px', height: '36px' } :
    size === 'lg' ? { fontSize: '15px', padding: '0 28px', height: '48px' } :
                   { fontSize: '14px', padding: '0 24px', height: '44px' }

  const variantStyles: React.CSSProperties =
    variant === 'primary'   ? { backgroundColor: '#0D1B3E', color: '#FFFFFF', border: '1px solid #0D1B3E' } :
    variant === 'secondary' ? { backgroundColor: '#FFFFFF', color: '#0D1B3E', border: '1px solid #0D1B3E' } :
    variant === 'outline'   ? { backgroundColor: '#FFFFFF', color: '#0D1B3E', border: '1px solid #E8ECF2' } :
                              { backgroundColor: 'transparent', color: '#6B7280', border: 'none' }

  return (
    <button
      disabled={disabled || loading}
      className={cn(className)}
      style={{ ...base, ...sizeStyles, ...variantStyles, ...style }}
      onMouseEnter={(event) => {
        if (disabled || loading) return
        if (variant === 'primary') event.currentTarget.style.backgroundColor = '#1E3A6E'
        if (variant === 'secondary') event.currentTarget.style.backgroundColor = '#EBF0FA'
        if (variant === 'outline') event.currentTarget.style.borderColor = '#0D1B3E'
      }}
      onMouseLeave={(event) => {
        if (variant === 'primary') event.currentTarget.style.backgroundColor = '#0D1B3E'
        if (variant === 'secondary') event.currentTarget.style.backgroundColor = '#FFFFFF'
        if (variant === 'outline') event.currentTarget.style.borderColor = '#E8ECF2'
      }}
      {...props}
    >
      {loading && (
        <span
          className="inline-block h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </button>
  )
}
