import TranscriptTurn from './TranscriptTurn'

const turns = [
  {
    speaker: 'doctor' as const,
    name: 'Dr. M. Sterling',
    initials: 'DR',
    timestamp: '00:14',
    roleLabel: 'Physician',
    text: 'Good morning, Amina. I reviewed your follow-up charts from three weeks ago. How has the chest tightness been progressing since we started the medication adjustments?',
  },
  {
    speaker: 'patient' as const,
    name: 'Amina Adeleke',
    initials: 'PT',
    timestamp: '00:38',
    roleLabel: 'Patient',
    text: 'Doctor, olahi mi de gba—the pressure comes mostly when climbing the staircase at home. It feels like a severe substernal chest pressure, and yesterday around midday, there was noticeable radiation to left jaw that lingered for roughly ten to fifteen minutes before subsiding with rest.',
  },
  {
    speaker: 'doctor' as const,
    name: 'Dr. M. Sterling',
    initials: 'DR',
    timestamp: '02:11',
    roleLabel: 'Physician',
    text: 'Understood. Any associated diaphoresis or dyspnea on exertion when that happens? And are you still tolerating the atenolol 50mg daily without morning orthostatic dizziness?',
  },
]

interface TranscriptFeedProps {
  isLive?: boolean
}

export default function TranscriptFeed({ isLive = false }: TranscriptFeedProps) {
  return (
    <div className="bg-surface-container-lowest dark:bg-slate-900 rounded border border-outline-variant dark:border-slate-800 flex-1 flex flex-col min-h-[380px] shadow-xs">
      {/* Header */}
      <div className="px-4 sm:px-5 py-3 bg-surface-container-low/60 dark:bg-slate-800/50 border-b border-outline-variant dark:border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary dark:text-emerald-400 text-lg">stream</span>
          <h3 className="text-xs sm:text-sm font-bold text-on-surface dark:text-slate-200 uppercase tracking-wider">
            Live Transcription
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-on-surface-variant dark:text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-secondary dark:bg-emerald-500 animate-pulse" />
            <span className="hidden sm:inline">Transcribing in real-time</span>
            <span className="sm:hidden">Live</span>
          </span>
          <button className="p-1 hover:bg-surface-container-high dark:hover:bg-slate-800 rounded text-on-surface-variant dark:text-slate-400 transition-colors" title="Copy Transcript">
            <span className="material-symbols-outlined text-base">content_copy</span>
          </button>
        </div>
      </div>

      {/* Transcript body */}
      <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-4 font-body-md text-body-md custom-scrollbar">
        {turns.map((turn, i) => (
          <TranscriptTurn key={i} {...turn} />
        ))}

        {isLive && (
          <div className="border-l-2 border-secondary dark:border-emerald-500 pl-2 bg-surface-container-low/20 dark:bg-emerald-950/10 py-1">
            <TranscriptTurn
              speaker="patient"
              name="Amina Adeleke"
              initials="PT"
              timestamp="04:26 [LIVE]"
              text="No dizziness in the morning, but mild shortness of breath when carrying groceries. I have remained compliant with the daily morning dose..."
              isLive
            />
          </div>
        )}
      </div>

      {/* Bottom HUD */}
      <div className="px-4 sm:px-5 py-2.5 bg-surface-container-low dark:bg-slate-800/80 border-t border-outline-variant/80 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-2 text-xs text-on-surface-variant dark:text-slate-400 font-mono">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-secondary dark:text-emerald-400 text-sm">auto_fix_high</span>
            Entities: <strong className="text-on-surface dark:text-slate-200 font-semibold">6 clinical terms</strong>
          </span>
          <span className="hidden sm:inline">&bull;</span>
          <span className="hidden sm:inline">
            Coding: <span className="text-secondary dark:text-emerald-400 font-semibold">ICD-10-CM (I20.9, R07.9)</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-surface-container-lowest dark:bg-slate-900 border border-outline-variant dark:border-slate-700 text-[11px]">
            Buffer: 99.8%
          </span>
        </div>
      </div>
    </div>
  )
}
