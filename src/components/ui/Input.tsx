import { type InputHTMLAttributes, forwardRef, type ReactNode } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, rightIcon, className = '', id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium"
            style={{ color: '#1A1F2E' }}
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }}>
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full rounded-lg border bg-white outline-none
              transition-all duration-200 placeholder:text-[#9CA3AF]
              ${leftIcon ? 'pl-9' : ''}
              ${rightIcon ? 'pr-9' : ''}
              ${
                error
                  ? 'border-[#DC2626] focus:border-[#DC2626] focus:shadow-[0_0_0_3px_rgba(220,38,38,0.1)]'
                  : 'border-[#E8ECF2] focus:border-[#2E5FD4] focus:shadow-[0_0_0_3px_rgba(46,95,212,0.1)]'
              }
              ${className}
            `}
            style={{ color: '#1A1F2E', padding: '12px 16px', fontSize: '14px' }}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }}>
              {rightIcon}
            </span>
          )}
        </div>
        {error && (
          <p className="text-xs" style={{ color: '#DC2626' }}>
            {error}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
