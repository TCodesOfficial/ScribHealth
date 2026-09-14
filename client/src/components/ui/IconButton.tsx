import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: string
  label?: string
  size?: 'sm' | 'md'
}

export default function IconButton({
  icon,
  label,
  size = 'md',
  className = '',
  ...props
}: IconButtonProps) {
  return (
    <button
      aria-label={label}
      title={label}
      className={`
        inline-flex items-center justify-center rounded
        text-on-surface-variant dark:text-slate-400
        hover:text-on-surface dark:hover:text-white
        hover:bg-surface-container-high dark:hover:bg-slate-800
        transition-colors
        ${size === 'sm' ? 'p-1' : 'p-1.5'}
        ${className}
      `}
      {...props}
    >
      <span className={`material-symbols-outlined ${size === 'sm' ? 'text-[16px]' : 'text-[19px]'}`}>
        {icon}
      </span>
      {label && <span className="sr-only">{label}</span>}
    </button>
  )
}
