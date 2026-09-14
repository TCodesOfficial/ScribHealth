import { useTheme } from '@/contexts/ThemeContext'

interface ThemeToggleProps {
  variant?: 'button' | 'switch'
  className?: string
}

export default function ThemeToggle({ variant = 'button', className = '' }: ThemeToggleProps) {
  const { isDark, toggle } = useTheme()

  if (variant === 'switch') {
    return (
      <button
        role="switch"
        aria-checked={isDark}
        aria-label="Toggle Light and Dark Mode"
        onClick={toggle}
        className={`
          relative inline-flex items-center h-8 w-16 p-0.5 rounded-full
          bg-slate-200 dark:bg-slate-700
          border border-slate-300 dark:border-slate-600
          transition-colors duration-300
          focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2
          ${className}
        `}
      >
        <span className="absolute left-1.5 flex items-center justify-center text-amber-500 pointer-events-none transition-opacity duration-200 opacity-100 dark:opacity-40">
          <span className="material-symbols-outlined text-sm font-bold">light_mode</span>
        </span>
        <span className="absolute right-1.5 flex items-center justify-center text-indigo-400 pointer-events-none transition-opacity duration-200 opacity-40 dark:opacity-100">
          <span className="material-symbols-outlined text-sm font-bold">dark_mode</span>
        </span>
        <span
          className={`
            inline-flex items-center justify-center w-6 h-6 rounded-full
            bg-white dark:bg-slate-900
            text-slate-900 dark:text-white
            shadow-md transform transition-transform duration-300 ease-in-out
            ${isDark ? 'translate-x-8' : 'translate-x-0.5'}
          `}
        >
          <span className={`material-symbols-outlined text-xs font-bold ${isDark ? 'text-indigo-400' : 'text-amber-500'}`}>
            {isDark ? 'dark_mode' : 'light_mode'}
          </span>
        </span>
      </button>
    )
  }

  return (
    <button
      onClick={toggle}
      className={`
        flex items-center gap-1.5 px-3 py-1.5
        rounded-full text-xs font-semibold
        transition-all duration-200
        bg-white/10
        hover:bg-white/20
        text-white
        border border-white/20
        backdrop-blur-md shadow-sm
        active:scale-95
        ${className}
      `}
    >
      <span className={`material-symbols-outlined text-[17px] transition-transform duration-300 ${isDark ? 'text-teal-300' : 'text-amber-400'}`}>
        {isDark ? 'light_mode' : 'dark_mode'}
      </span>
      <span className="hidden sm:inline font-medium">
        {isDark ? 'Light Mode' : 'Dark Mode'}
      </span>
    </button>
  )
}
