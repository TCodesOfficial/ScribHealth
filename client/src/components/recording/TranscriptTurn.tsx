interface TranscriptTurnProps {
  speaker: 'doctor' | 'patient'
  name: string
  initials: string
  timestamp: string
  text: string
  isLive?: boolean
  roleLabel?: string
}

export default function TranscriptTurn({
  speaker,
  name,
  initials,
  timestamp,
  text,
  isLive = false,
  roleLabel,
}: TranscriptTurnProps) {
  const isDoctor = speaker === 'doctor'

  return (
    <div className={`flex items-start gap-2.5 sm:gap-3 ${!isLive ? '' : 'border-l-2 border-secondary dark:border-emerald-500 pl-2 bg-surface-container-low/20 dark:bg-emerald-950/10 py-1'}`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded flex items-center justify-center shrink-0 border ${
          isDoctor
            ? 'bg-surface-container-high dark:bg-slate-800 border-outline-variant/60 dark:border-slate-700'
            : 'bg-secondary-container/40 dark:bg-emerald-900/60 border-secondary/30 dark:border-emerald-600/40'
        }`}
      >
        <span className={`text-xs font-headline-sm font-bold ${isDoctor ? 'text-on-surface dark:text-slate-200' : 'text-on-secondary-container dark:text-emerald-300'}`}>
          {initials}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="text-label-sm font-label-sm font-semibold text-on-surface dark:text-slate-200">{name}</span>
          <span className="text-[11px] font-code-transcript text-on-surface-variant dark:text-slate-400">{timestamp}</span>
          {roleLabel && (
            <span className={`text-[10px] font-label-sm px-1.5 py-0.2 rounded ${
              isDoctor
                ? 'bg-surface-container-high dark:bg-slate-800 text-on-surface-variant dark:text-slate-400'
                : 'bg-secondary-container/40 dark:bg-emerald-950/60 text-on-secondary-container dark:text-emerald-300 font-medium'
            }`}>
              {roleLabel}
            </span>
          )}
          {isLive && (
            <span className="text-[11px] font-mono text-secondary dark:text-emerald-400 font-semibold animate-pulse">
              [LIVE]
            </span>
          )}
        </div>
        <div
          className={`p-3 rounded border text-on-surface dark:text-slate-200 leading-relaxed ${
            isDoctor
              ? 'bg-surface-container-low/40 dark:bg-slate-800/50 border-outline-variant/40 dark:border-slate-700/40'
              : 'bg-surface-container-lowest dark:bg-slate-900 border-outline-variant/70 dark:border-slate-700'
          }`}
        >
          {text}
        </div>
      </div>
    </div>
  )
}
