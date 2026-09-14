import type { ReactNode } from 'react'

interface SoapSectionProps {
  letter: 'S' | 'O' | 'A' | 'P'
  label: string
  children: ReactNode
  rightAction?: ReactNode
}

const sectionColors = {
  S: 'bg-secondary dark:bg-emerald-500',
  O: 'bg-secondary dark:bg-emerald-500',
  A: 'bg-secondary dark:bg-emerald-500',
  P: 'bg-secondary dark:bg-emerald-500',
}

export default function SoapSection({ letter, label, children, rightAction }: SoapSectionProps) {
  return (
    <div className="bg-surface-container-lowest dark:bg-slate-900 rounded border border-outline-variant dark:border-slate-800 shadow-xs">
      <div className="px-3.5 py-2 bg-surface-container-low dark:bg-slate-800/80 border-b border-outline-variant dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded ${sectionColors[letter]}`} />
          <h3 className="text-label-md font-label-md font-bold tracking-wider text-on-surface dark:text-slate-200 uppercase">
            {letter} &middot; {label}
          </h3>
        </div>
        {rightAction}
      </div>
      <div className="p-3.5 space-y-3">
        {children}
      </div>
    </div>
  )
}
