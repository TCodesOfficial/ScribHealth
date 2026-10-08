import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import SignedRecordsModal from '@/components/modals/SignedRecordsModal'
import logo from '@/assets/logo.svg'

interface TopNavProps {
  onMenuToggle: () => void
  onContextToggle: () => void
}

export default function TopNav({ onMenuToggle, onContextToggle }: TopNavProps) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [signedModalOpen, setSignedModalOpen] = useState(false)

  return (
    <>
      <header className="relative bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center w-full px-3 sm:px-4 md:px-6 py-2.5 z-50 h-16 shrink-0 transition-colors duration-200">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          {/* Mobile hamburger */}
          <button
            onClick={onMenuToggle}
            aria-label="Open Navigation Drawer"
            className="lg:hidden p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
          >
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>

          {/* Brand */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <img src={logo} alt="ScribeHealth" className="w-7 h-7 sm:w-8 sm:h-8" />
            <div className="flex flex-col">
              <span className="text-sm sm:text-headline-sm font-headline-sm font-bold text-slate-900 dark:text-white tracking-tight leading-none">
                ScribeHealth
              </span>
              <span className="text-[9px] sm:text-[11px] font-label-sm text-teal-600 dark:text-teal-400 font-medium tracking-wide">
                Clinical Suite
              </span>
            </div>
          </div>

          <div className="hidden sm:block h-6 w-px bg-slate-200 dark:bg-slate-700" />

          {/* Active patient context - desktop */}
          <div className="hidden lg:flex items-center gap-2.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <span className="material-symbols-outlined text-teal-600 dark:text-teal-400 text-base">person</span>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {user?.name || 'No Patient Selected'}
              </span>
            </div>
            <button
              onClick={() => navigate('/patients')}
              className="ml-1 text-xs font-medium text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-0.5"
            >
              <span>Switch</span>
              <span className="material-symbols-outlined text-sm">unfold_more</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Emergency dictation */}
          <button
            onClick={() => navigate('/recording')}
            className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-950/60 transition-colors rounded-lg border border-red-200 dark:border-red-800 text-xs sm:text-sm font-semibold active:scale-95"
          >
            <span className="material-symbols-outlined text-base">emergency</span>
            <span className="hidden sm:inline">Emergency Dictation</span>
          </button>

          {/* Sign & Export - desktop */}
          <button
            onClick={() => setSignedModalOpen(true)}
            className="hidden lg:flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-sm active:scale-95"
            title="View Signed & Exported Records"
          >
            <span className="material-symbols-outlined text-base">lock</span>
            <span>Sign & Export Note</span>
          </button>

          {/* Vitals toggle - mobile/tablet only */}
          <button
            onClick={onContextToggle}
            className="xl:hidden p-1.5 sm:px-2 sm:py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 text-xs font-medium flex items-center gap-1 transition-colors"
            title="Toggle Patient Vitals & Context"
          >
            <span className="material-symbols-outlined text-base text-teal-600 dark:text-teal-400">patient_list</span>
            <span className="hidden md:inline">Vitals</span>
          </button>

          <div className="h-6 w-px bg-slate-200 dark:border-slate-700 hidden sm:block" />

          {/* User profile */}
          <div className="flex items-center gap-2 pl-0.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-slate-200 dark:ring-slate-700 shrink-0">
              {user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'JS'}
            </div>
            <div className="hidden xl:flex flex-col">
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                {user?.name || 'Guest User'}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                {user?.email || 'No email'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <SignedRecordsModal isOpen={signedModalOpen} onClose={() => setSignedModalOpen(false)} />
    </>
  )
}
