import { useState, useRef, useEffect } from 'react'
import Button from '@/components/ui/Button'

interface AudioPlayerProps {
  audioUrl: string
  fileName?: string
}

export default function AudioPlayer({ audioUrl, fileName = 'Consultation Recording' }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration || 0)
    const onEnded = () => setIsPlaying(false)

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', onEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', onEnded)
    }
  }, [audioUrl])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => {})
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return
    const time = Number(e.target.value)
    audio.currentTime = time
    setCurrentTime(time)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return
    const vol = Number(e.target.value)
    audio.volume = vol
    setVolume(vol)
  }

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60)
    const remaining = Math.floor(secs % 60)
    return `${String(mins).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`
  }

  return (
    <div className="p-4 bg-surface-container-low dark:bg-slate-850 rounded-xl border border-outline-variant/80 dark:border-slate-700 shadow-sm space-y-3">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-secondary-container/50 dark:bg-emerald-950/60 flex items-center justify-center text-secondary dark:text-emerald-400 shrink-0">
            <span className="material-symbols-outlined text-[20px]">audio_file</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-on-surface dark:text-white truncate">{fileName}</p>
            <p className="text-[10px] text-outline dark:text-slate-400 font-mono">Secure Cloud Audio Stream</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="voice"
            size="sm"
            icon={isPlaying ? 'pause' : 'play_arrow'}
            onClick={togglePlay}
          >
            {isPlaying ? 'Pause' : 'Play'}
          </Button>
        </div>
      </div>

      {/* Animated / Simulated Waveform */}
      <div className="flex items-center gap-1 h-8 px-2 bg-surface-container-lowest dark:bg-slate-900 rounded-lg border border-outline-variant/60 dark:border-slate-700 overflow-hidden">
        {Array.from({ length: 36 }).map((_, i) => {
          const progress = duration > 0 ? currentTime / duration : 0
          const barProgress = i / 36
          const isPassed = barProgress <= progress
          // Simulate waveform heights
          const heights = [40, 70, 30, 90, 60, 80, 45, 75, 100, 50, 65, 35]
          const h = heights[i % heights.length]

          return (
            <div
              key={i}
              className={`flex-1 rounded-full transition-all duration-150 ${
                isPassed ? 'bg-secondary dark:bg-emerald-400' : 'bg-outline/30 dark:bg-slate-700'
              }`}
              style={{ height: `${h}%` }}
            />
          )
        })}
      </div>

      {/* Time & scrubber */}
      <div className="space-y-1">
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1.5 bg-surface-container-highest dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-secondary dark:accent-emerald-400"
        />
        <div className="flex items-center justify-between text-[11px] font-mono text-outline dark:text-slate-400">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  )
}
