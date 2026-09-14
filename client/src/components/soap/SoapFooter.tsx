interface SoapFooterProps {
  onRegenerate?: () => void
  onCopy?: () => void
  onExport?: () => void
  onApprove?: () => void
}

export default function SoapFooter({ onRegenerate, onCopy, onExport, onApprove }: SoapFooterProps) {
  return (
    <footer className="sticky bottom-0 p-3 bg-surface-container-lowest/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-outline-variant dark:border-slate-800 flex items-center justify-between gap-2 z-20">
      <div className="flex items-center gap-2">
        <button
          onClick={onRegenerate}
          className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-label-sm font-label-sm font-semibold border border-outline-variant dark:border-slate-700 rounded hover:bg-surface-container-low dark:hover:bg-slate-800 text-on-surface dark:text-slate-200 transition-all"
        >
          <span className="material-symbols-outlined text-[16px] text-secondary dark:text-emerald-400">autorenew</span>
          <span className="hidden sm:inline">Regenerate with AI</span>
          <span className="sm:hidden">Regen</span>
        </button>
        <button
          onClick={onCopy}
          className="p-1.5 text-outline dark:text-slate-400 hover:text-on-surface dark:hover:text-white border border-outline-variant dark:border-slate-700 rounded hover:bg-surface-container-low dark:hover:bg-slate-800 transition-all"
          title="Copy to Clipboard"
        >
          <span className="material-symbols-outlined text-[18px]">content_copy</span>
        </button>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onExport}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-label-sm font-label-sm font-semibold border border-outline-variant dark:border-slate-700 rounded hover:bg-surface-container-low dark:hover:bg-slate-800 text-on-surface dark:text-slate-200 transition-all"
        >
          <span className="material-symbols-outlined text-[16px]">file_upload</span>
          Export
        </button>
        <button
          onClick={onApprove}
          className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 text-label-sm font-label-sm font-semibold bg-secondary dark:bg-emerald-600 text-on-secondary rounded shadow-sm hover:opacity-95 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[16px]">draw</span>
          Approve &amp; Sign
        </button>
      </div>
    </footer>
  )
}
