import { useEffect } from 'react'

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  useEffect(() => {
    if (!isOpen) return
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [isOpen, loading, onCancel])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-clinical-navy/40 dark:bg-black/60 backdrop-blur-sm"
        onClick={loading ? undefined : onCancel}
      />
      <div className="relative bg-surface-container-lowest dark:bg-slate-900 rounded-xl border border-outline-variant dark:border-slate-800 shadow-clinical-md p-5 sm:p-6 max-w-sm w-full z-10">
        <div className="flex items-start gap-3.5">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              danger
                ? 'bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900'
                : 'bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">
              {danger ? 'delete_forever' : 'help'}
            </span>
          </div>
          <div className="min-w-0">
            <h2 className="text-title-md font-bold text-on-surface dark:text-white tracking-tight">
              {title}
            </h2>
            <p className="text-[13px] leading-relaxed text-on-surface-variant dark:text-slate-400 mt-1">
              {message}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-3.5 py-1.5 rounded-lg bg-surface-container-high dark:bg-slate-800 text-on-surface dark:text-slate-200 hover:bg-surface-container-highest dark:hover:bg-slate-700 text-xs font-semibold transition-colors border border-outline-variant/60 dark:border-slate-700 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-3.5 py-1.5 rounded-lg text-white text-xs font-semibold transition-all shadow-sm active:scale-95 disabled:opacity-60 flex items-center gap-1.5 ${
              danger
                ? 'bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500'
                : 'bg-secondary hover:bg-secondary/90 dark:bg-emerald-600 dark:hover:bg-emerald-500'
            }`}
          >
            {loading && (
              <span className="material-symbols-outlined text-[15px] animate-spin">progress_activity</span>
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
