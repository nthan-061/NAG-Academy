import { tokens } from './tokens'

export const theme = {
  tokens,
  tailwind: {
    layout: {
      page: 'min-h-screen bg-background text-foreground',
      auth: 'flex min-h-screen bg-background text-foreground',
      authPanel:
        'w-full max-w-[28rem] rounded-xl border border-border bg-surface p-8 shadow-card sm:p-10',
      authColumn:
        'hidden min-h-screen w-1/2 flex-col justify-center overflow-hidden bg-primary-deep px-12 lg:flex',
    },
    card: {
      base: 'rounded-xl border border-border bg-surface shadow-card',
      muted: 'rounded-xl border border-border bg-background-elevated shadow-card',
      interactive:
        'rounded-xl border border-border bg-surface shadow-card transition duration-200 hover:-translate-y-0.5 hover:shadow-panel',
    },
    button: {
      primary:
        'bg-primary text-white shadow-button transition hover:bg-primary-strong disabled:bg-border disabled:text-muted-foreground',
      secondary:
        'border border-secondary/20 bg-secondary-soft text-secondary transition hover:bg-[#E4EEFF] disabled:border-border disabled:bg-background-elevated disabled:text-muted-foreground',
      ghost:
        'bg-transparent text-muted-foreground transition hover:bg-secondary-soft hover:text-foreground disabled:text-muted-foreground',
    },
    badge: {
      neutral: 'bg-background-elevated text-foreground',
      info: 'bg-secondary-soft text-secondary',
      success: 'bg-success-soft text-success',
      warning: 'bg-warning-soft text-warning',
      danger: 'bg-danger-soft text-danger',
    },
    input: {
      wrapper: 'flex flex-col gap-2.5',
      label: 'text-sm font-semibold text-foreground',
      field:
        'h-14 w-full rounded-[1rem] border border-border bg-surface px-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-secondary focus:shadow-focus disabled:cursor-not-allowed disabled:bg-background-elevated disabled:text-muted-foreground',
      helper: 'text-xs leading-6 text-text-secondary',
      error: 'text-xs leading-6 text-danger',
    },
    text: {
      h1: 'text-4xl font-bold tracking-[-0.04em] text-foreground md:text-5xl',
      h2: 'text-2xl font-bold tracking-[-0.03em] text-foreground',
      h3: 'text-lg font-semibold text-foreground',
      body: 'text-sm leading-7 text-text-secondary',
      bodyStrong: 'text-sm font-medium leading-6 text-foreground',
      label: 'text-sm font-medium text-foreground',
      caption: 'text-xs font-medium text-muted-foreground',
    },
  },
} as const

export type AppTheme = typeof theme
