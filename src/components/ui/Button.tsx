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
  ...props
}: ButtonProps) {
  const variantClasses =
    variant === 'primary'
      ? 'border border-[#0D1B3E] bg-[#0D1B3E] text-white hover:bg-[#1E3A6E]'
      : variant === 'secondary'
        ? 'border border-[#0D1B3E] bg-white text-[#0D1B3E] hover:bg-[#EBF0FA]'
        : variant === 'outline'
          ? 'border border-[#E8ECF2] bg-white text-[#0D1B3E] hover:border-[#0D1B3E]'
          : 'border border-transparent bg-transparent text-[#6B7280] hover:bg-[#F8FAFC]'

  const sizeClasses =
    size === 'sm'
      ? 'h-9 px-3.5 text-[13px]'
      : size === 'lg'
        ? 'h-12 px-7 text-[15px]'
        : 'h-11 px-6 text-sm'

  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium whitespace-nowrap transition-all duration-200',
        'disabled:pointer-events-none disabled:opacity-50',
        fullWidth && 'w-full',
        sizeClasses,
        variantClasses,
        className,
      )}
      {...props}
    >
      {loading && (
        <span className="inline-block h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  )
}
