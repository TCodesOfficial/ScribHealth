import { useEffect, type ReactNode } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-clinical-navy/40 dark:bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-surface-container-lowest dark:bg-slate-900 rounded-xl border border-outline-variant dark:border-slate-800 shadow-clinical-md p-6 max-w-md w-full mx-4 z-10">
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-headline-sm font-headline-sm font-bold text-on-surface dark:text-white">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-surface-container-high dark:hover:bg-slate-800 text-outline dark:text-slate-400 hover:text-on-surface dark:hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
