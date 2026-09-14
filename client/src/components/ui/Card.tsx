import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  padding?: boolean
  border?: boolean
}

export default function Card({
  children,
  className = '',
  padding = true,
  border = true,
}: CardProps) {
  return (
    <div
      className={`
        bg-surface-container-lowest dark:bg-slate-900
        rounded-lg
        ${border ? 'border border-outline-variant dark:border-slate-800' : ''}
        shadow-xs
        ${padding ? 'p-3.5' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}
