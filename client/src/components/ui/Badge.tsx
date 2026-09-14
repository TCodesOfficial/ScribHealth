import type { ReactNode } from 'react'

interface BadgeProps {
  variant?: 'active' | 'signed' | 'processing' | 'review' | 'default' | 'error'
  dot?: boolean
  icon?: string
  children: ReactNode
  className?: string
}

const variantStyles = {
  active: 'bg-secondary text-secondary-on',
  signed: 'bg-surface-container-low dark:bg-slate-800 text-outline dark:text-slate-400',
  processing: 'bg-secondary-container/50 dark:bg-emerald-950/60 text-on-secondary-container dark:text-emerald-300 border border-secondary/30 dark:border-emerald-600/40',
  review: 'bg-error-container dark:bg-rose-900/60 text-on-error-container dark:text-rose-300',
  default: 'bg-surface-container-low dark:bg-slate-800 text-on-surface-variant dark:text-slate-400 border border-outline-variant/60 dark:border-slate-700',
  error: 'bg-error-container/30 dark:bg-rose-950/40 text-error dark:text-rose-300 border border-error/30 dark:border-rose-500/30',
}

export default function Badge({
  variant = 'default',
  dot = false,
  icon,
  children,
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2 py-0.5
        rounded text-[10px] font-label-sm font-semibold leading-none
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      )}
      {icon && (
        <span className="material-symbols-outlined text-[12px]">{icon}</span>
      )}
      {children}
    </span>
  )
}
