interface WaveformVisualizerProps {
  isRecording: boolean
}

const bars = [
  { delay: '0.1s', height: 18 },
  { delay: '0.3s', height: 32 },
  { delay: '0.2s', height: 40 },
  { delay: '0.4s', height: 26 },
  { delay: '0.05s', height: 44 },
  { delay: '0.5s', height: 36 },
  { delay: '0.25s', height: 48 },
  { delay: '0.35s', height: 28 },
  { delay: '0.15s', height: 42 },
  { delay: '0.45s', height: 30 },
  { delay: '0.12s', height: 46 },
  { delay: '0.38s', height: 38 },
  { delay: '0.22s', height: 24 },
  { delay: '0.52s', height: 44 },
  { delay: '0.18s', height: 34 },
  { delay: '0.28s', height: 46 },
  { delay: '0.42s', height: 22 },
]

export default function WaveformVisualizer({ isRecording }: WaveformVisualizerProps) {
  return (
    <div className="relative w-full h-16 sm:h-20 bg-surface-container-low dark:bg-slate-800/80 rounded border border-outline-variant/60 dark:border-slate-700 flex items-center justify-center px-4 sm:px-6 overflow-hidden">
      <div className="relative z-10 w-full flex items-center justify-between gap-1 sm:gap-1.5 h-10 sm:h-12">
        {/* Left static bars */}
        <div className="w-1 sm:w-1.5 bg-secondary/30 dark:bg-emerald-500/30 rounded-full h-3" />
        <div className="w-1 sm:w-1.5 bg-secondary/40 dark:bg-emerald-500/40 rounded-full h-5" />
        <div className="w-1 sm:w-1.5 bg-secondary/60 dark:bg-emerald-500/60 rounded-full h-8" />

        {/* Animated bars */}
        {bars.map((bar, i) => (
          <div
            key={i}
            className={`w-1 sm:w-1.5 bg-secondary dark:bg-emerald-500 rounded-full ${
              isRecording ? 'animate-waveform-bounce' : ''
            }`}
            style={{
              height: isRecording ? undefined : `${bar.height * 0.3}px`,
              animationDelay: bar.delay,
            }}
          />
        ))}

        {/* Right static bars */}
        <div className="w-1 sm:w-1.5 bg-secondary/70 dark:bg-emerald-500/70 rounded-full h-8" />
        <div className="w-1 sm:w-1.5 bg-secondary/50 dark:bg-emerald-500/50 rounded-full h-5" />
        <div className="w-1 sm:w-1.5 bg-secondary/30 dark:bg-emerald-500/30 rounded-full h-3" />
      </div>

      <div className="absolute bottom-1.5 right-3 flex items-center gap-1.5 text-[10px] font-mono text-on-surface-variant dark:text-slate-400">
        <span className="w-1.5 h-1.5 rounded-full bg-secondary dark:bg-emerald-500" />
        <span>Speaker: Physician</span>
      </div>
    </div>
  )
}
