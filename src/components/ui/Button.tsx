import { type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { theme } from '@/design/theme'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  children: ReactNode
  fullWidth?: boolean
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-10 rounded-md px-4 text-sm',
  md: 'h-11 rounded-md px-5 text-sm',
  lg: 'h-12 rounded-lg px-6 text-[15px]',
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: theme.tailwind.button.primary,
  secondary: theme.tailwind.button.secondary,
  ghost: theme.tailwind.button.ghost,
  outline:
    'border border-border bg-surface text-foreground transition hover:border-primary hover:bg-background-elevated disabled:border-border disabled:bg-background-elevated disabled:text-muted-foreground',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  children,
  disabled,
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold outline-none transition focus-visible:shadow-focus disabled:cursor-not-allowed',
        sizeClasses[size],
        variantClasses[variant],
        fullWidth && 'w-full',
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
