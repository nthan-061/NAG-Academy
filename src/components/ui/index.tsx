import { tokens as t } from '@/styles/tokens'

// Primary button
export function BtnPrimary({ children, onClick, disabled, loading, fullWidth, type }: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  type?: 'button' | 'submit'
}) {
  const inactive = !!(disabled || loading)
  return (
    <button
      type={type || 'button'}
      onClick={onClick}
      disabled={inactive}
      style={{
        width: fullWidth ? '100%' : 'auto',
        height: '44px',
        padding: '0 24px',
        borderRadius: t.radius.sm,
        border: 'none',
        backgroundColor: inactive ? t.colors.border : t.colors.navy,
        color: inactive ? t.colors.textMuted : '#FFFFFF',
        fontSize: t.font.md,
        fontWeight: 500,
        cursor: inactive ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        transition: 'background-color 0.2s',
        fontFamily: 'Inter, sans-serif',
      }}
      onMouseOver={(e) => { if (!inactive) e.currentTarget.style.backgroundColor = t.colors.navyHover }}
      onMouseOut={(e) => { if (!inactive) e.currentTarget.style.backgroundColor = t.colors.navy }}
    >
      {loading ? (
        <>
          <span style={{ width: '16px', height: '16px', border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block', flexShrink: 0 }} />
          Aguarde...
        </>
      ) : children}
    </button>
  )
}

// Form input
export function FormInput({ label, error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && <label style={{ fontSize: t.font.base, fontWeight: 500, color: t.colors.textPrimary }}>{label}</label>}
      <input
        {...props}
        style={{
          width: '100%',
          padding: t.spacing.inputPadding,
          border: `1.5px solid ${error ? t.colors.danger : t.colors.border}`,
          borderRadius: t.radius.sm,
          fontSize: t.font.md,
          color: t.colors.textPrimary,
          outline: 'none',
          backgroundColor: '#FFFFFF',
          fontFamily: 'Inter, sans-serif',
          boxSizing: 'border-box',
          ...(props.style || {}),
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = t.colors.accent
          e.currentTarget.style.boxShadow = `0 0 0 3px ${t.colors.accentLight}`
          props.onFocus?.(e)
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error ? t.colors.danger : t.colors.border
          e.currentTarget.style.boxShadow = 'none'
          props.onBlur?.(e)
        }}
      />
      {error && <span style={{ fontSize: t.font.sm, color: t.colors.danger }}>{error}</span>}
    </div>
  )
}

// Form select
export function FormSelect({ label, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && <label style={{ fontSize: t.font.base, fontWeight: 500, color: t.colors.textPrimary }}>{label}</label>}
      <select
        {...props}
        style={{
          width: '100%',
          padding: t.spacing.inputPadding,
          border: `1.5px solid ${t.colors.border}`,
          borderRadius: t.radius.sm,
          fontSize: t.font.md,
          color: t.colors.textPrimary,
          backgroundColor: '#FFFFFF',
          outline: 'none',
          fontFamily: 'Inter, sans-serif',
          cursor: props.disabled ? 'not-allowed' : 'pointer',
          opacity: props.disabled ? 0.6 : 1,
          boxSizing: 'border-box',
          ...(props.style || {}),
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = t.colors.accent; props.onFocus?.(e) }}
        onBlur={(e) => { e.currentTarget.style.borderColor = t.colors.border; props.onBlur?.(e) }}
      >
        {children}
      </select>
    </div>
  )
}

// White card
export function Card({ children, padding, style }: { children: React.ReactNode; padding?: string; style?: React.CSSProperties }) {
  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      border: `1px solid ${t.colors.border}`,
      borderRadius: t.radius.lg,
      boxShadow: t.shadows.sm,
      padding: padding ?? t.spacing.cardPadding,
      ...style,
    }}>
      {children}
    </div>
  )
}

// Level badge
export function BadgeNivel({ nivel }: { nivel: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    iniciante:     { bg: '#DCFCE7', color: '#16A34A', label: 'Iniciante' },
    intermediario: { bg: '#EBF0FA', color: '#2E5FD4', label: 'Intermediário' },
    avancado:      { bg: '#F3E8FF', color: '#7C3AED', label: 'Avançado' },
  }
  const s = map[nivel] ?? map.iniciante
  return (
    <span style={{
      display: 'inline-block',
      backgroundColor: s.bg, color: s.color,
      fontSize: '11px', fontWeight: 600,
      padding: '3px 10px', borderRadius: '20px',
    }}>{s.label}</span>
  )
}
