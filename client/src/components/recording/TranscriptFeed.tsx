import { useState, useMemo, useEffect } from 'react'
import TranscriptTurn from './TranscriptTurn'
import AudioPlayer from './AudioPlayer'
import consultationService from '@/services/consultation.service'
import toast from 'react-hot-toast'

interface TranscriptLine {
  speaker: 'doctor' | 'patient'
  text: string
  timestamp: string
}

function parseTranscript(raw: string): TranscriptLine[] {
  const lines = raw.split('\n').filter((l) => l.trim())
  const turns: TranscriptLine[] = []

  for (const line of lines) {
    const speakerMatch = line.match(/^(doctor|physician|patient|nurse):\s*/i)
    if (speakerMatch) {
      const role = speakerMatch[1].toLowerCase()
      const isDoctor = role === 'doctor' || role === 'physician' || role === 'nurse'
      turns.push({
        speaker: isDoctor ? 'doctor' : 'patient',
        text: line.slice(speakerMatch[0].length).trim(),
        timestamp: '',
      })
    } else if (turns.length > 0) {
      turns[turns.length - 1].text += ' ' + line.trim()
    } else {
      turns.push({ speaker: 'patient', text: line.trim(), timestamp: '' })
    }
  }

  return turns
}

interface TranscriptFeedProps {
  isLive?: boolean
  rawTranscript?: string
  consultationId?: string
}

export default function TranscriptFeed({ isLive = false, rawTranscript, consultationId }: TranscriptFeedProps) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioLoading, setAudioLoading] = useState(false)

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl)
    }
  }, [audioUrl])

  const turns = useMemo(() => {
    if (!rawTranscript) return []
    return parseTranscript(rawTranscript)
  }, [rawTranscript])

  const handlePullAudio = async () => {
    if (!consultationId) return
    setAudioLoading(true)
    try {
      const url = await consultationService.getAudio(consultationId)
      setAudioUrl(url)
      toast.success('Audio loaded — press play to listen.')
    } catch {
      toast.error('Original audio is not available for this recording.')
    } finally {
      setAudioLoading(false)
    }
  }

  return (
    <div className="bg-surface-container-lowest dark:bg-slate-900 rounded border border-outline-variant dark:border-slate-800 flex-1 flex flex-col min-h-0 overflow-hidden shadow-xs">
      {/* Header */}
      <div className="px-4 sm:px-5 py-3 bg-surface-container-low/60 dark:bg-slate-800/50 border-b border-outline-variant dark:border-slate-800 flex items-center justify-between shrink-0 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary dark:text-emerald-400 text-lg">stream</span>
          <h3 className="text-xs sm:text-sm font-bold text-on-surface dark:text-slate-200 uppercase tracking-wider">
            {rawTranscript ? 'Consultation Transcript & Audio' : 'Live Transcription'}
          </h3>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {consultationId && !audioUrl && (
            <button
              onClick={handlePullAudio}
              disabled={audioLoading}
              className="px-3 py-1.5 bg-secondary dark:bg-emerald-600 text-white hover:bg-secondary/90 transition-all rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-60"
              title="Play the original consultation recording"
            >
              <span className="material-symbols-outlined text-[16px]">
                {audioLoading ? 'progress_activity' : 'headphones'}
              </span>
              <span>{audioLoading ? 'Loading Audio...' : 'Listen to Original Audio'}</span>
            </button>
          )}

          {isLive && (
            <span className="text-xs text-on-surface-variant dark:text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-secondary dark:bg-emerald-500 animate-pulse" />
              <span className="hidden sm:inline">Transcribing in real-time</span>
              <span className="sm:hidden">Live</span>
            </span>
          )}

          {rawTranscript && (
            <button
              className="p-1.5 hover:bg-surface-container-high dark:hover:bg-slate-800 rounded-lg text-on-surface-variant dark:text-slate-400 transition-colors"
              title="Copy Transcript"
              onClick={() => {
                navigator.clipboard.writeText(rawTranscript)
                toast.success('Transcript copied to clipboard!')
              }}
            >
              <span className="material-symbols-outlined text-base">content_copy</span>
            </button>
          )}
        </div>
      </div>

      {/* Transcript body */}
      <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-4 font-body-md text-body-md custom-scrollbar">
        {/* Audio Player Section if loaded */}
        {audioUrl && (
          <div className="mb-4">
            <AudioPlayer audioUrl={audioUrl} />
          </div>
        )}

        {turns.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <span className="material-symbols-outlined text-4xl text-outline dark:text-slate-500 block mb-2">
              {isLive ? 'mic' : 'subtitles_off'}
            </span>
            <p className="text-sm text-on-surface-variant dark:text-slate-400">
              {isLive ? 'Waiting for audio input...' : 'No transcript available. Start a recording to see the transcript here.'}
            </p>
          </div>
        ) : (
          turns.map((turn, i) => (
            <TranscriptTurn
              key={i}
              speaker={turn.speaker}
              name={turn.speaker === 'doctor' ? 'Physician' : 'Patient'}
              initials={turn.speaker === 'doctor' ? 'DR' : 'PT'}
              timestamp={turn.timestamp || `${String(Math.floor(i * 0.5 / 60)).padStart(2, '0')}:${String(Math.floor(i * 0.5 % 60)).padStart(2, '0')}`}
              roleLabel={turn.speaker === 'doctor' ? 'Physician' : 'Patient'}
              text={turn.text}
            />
          ))
        )}

        {isLive && (
          <div className="border-l-2 border-secondary dark:border-emerald-500 pl-2 bg-surface-container-low/20 dark:bg-emerald-950/10 py-1">
            <TranscriptTurn
              speaker="patient"
              name="Patient"
              initials="PT"
              timestamp="LIVE"
              text="Listening..."
              isLive
            />
          </div>
        )}
      </div>

      {/* Bottom HUD */}
      <div className="px-4 sm:px-5 py-2.5 bg-surface-container-low dark:bg-slate-800/80 border-t border-outline-variant/80 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-2 text-xs text-on-surface-variant dark:text-slate-400 font-mono shrink-0">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-secondary dark:text-emerald-400 text-sm">forum</span>
            {turns.length} {turns.length === 1 ? 'turn' : 'turns'}
          </span>
          <span className="hidden sm:inline">&bull;</span>
          <span className="hidden sm:inline">
            {rawTranscript ? 'Full transcript loaded' : 'No transcript loaded yet'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-surface-container-lowest dark:bg-slate-900 border border-outline-variant dark:border-slate-700 text-[11px]">
            {isLive ? 'Live' : 'Ready'}
          </span>
        </div>
      </div>
    </div>
  )
}
