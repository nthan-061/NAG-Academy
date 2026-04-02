import { type InputHTMLAttributes, forwardRef, type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { theme } from '@/design/theme'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className={theme.tailwind.input.wrapper}>
        {label && (
          <label htmlFor={inputId} className={theme.tailwind.input.label}>
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-muted-foreground">
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              theme.tailwind.input.field,
              !!leftIcon && 'pl-11',
              !!rightIcon && 'pr-11',
              !!error && 'border-danger text-danger focus:border-danger focus:shadow-[0_0_0_4px_rgba(220,38,38,0.10)]',
              className,
            )}
            {...props}
          />

          {rightIcon && (
            <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-muted-foreground">
              {rightIcon}
            </span>
          )}
        </div>

        {error ? (
          <p className={theme.tailwind.input.error}>{error}</p>
        ) : helperText ? (
          <p className={theme.tailwind.input.helper}>{helperText}</p>
        ) : null}
      </div>
    )
  }
)

Input.displayName = 'Input'
