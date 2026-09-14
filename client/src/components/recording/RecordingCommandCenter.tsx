import { useCallback } from 'react'
import WaveformVisualizer from './WaveformVisualizer'
import Button from '@/components/ui/Button'
import { useAudioRecorder } from '@/hooks/useAudioRecorder'
import { useFileUpload } from '@/hooks/useFileUpload'

interface RecordingCommandCenterProps {
  onRecordingComplete: (file: File) => void
}

export default function RecordingCommandCenter({ onRecordingComplete }: RecordingCommandCenterProps) {
  const recorder = useAudioRecorder()
  const fileUpload = useFileUpload()

  const handleStartRecording = useCallback(async () => {
    try {
      await recorder.start()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to start recording')
    }
  }, [recorder])

  const handleStopRecording = useCallback(async () => {
    const blob = await recorder.stop()
    if (blob && blob.size > 0) {
      const file = new File([blob], `recording-${Date.now()}.webm`, { type: blob.type })
      onRecordingComplete(file)
    }
  }, [recorder, onRecordingComplete])

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file && fileUpload.selectFile(file)) {
        onRecordingComplete(file)
      }
    },
    [fileUpload, onRecordingComplete],
  )

  return (
    <div className="bg-surface-container-lowest dark:bg-slate-900 rounded border border-secondary/40 dark:border-emerald-600/40 shadow-sm relative overflow-hidden flex flex-col">
      <div className="h-1 w-full bg-secondary dark:bg-emerald-500" />

      <div className="p-4 sm:p-5 flex flex-col gap-4 sm:gap-5">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            {recorder.isRecording ? (
              <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-error-container/40 dark:bg-rose-950/40 border border-error/30 dark:border-rose-900/50 text-error dark:text-rose-400 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-error dark:bg-rose-500 animate-pulse" />
                {recorder.isPaused ? 'Recording Paused' : 'Recording in Progress'}
              </div>
            ) : (
              <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-surface-container-high dark:bg-slate-800 border border-outline-variant/60 dark:border-slate-700 text-on-surface-variant dark:text-slate-400 text-xs font-semibold">
                <span className="material-symbols-outlined text-base">mic_off</span>
                Ready to Record
              </div>
            )}
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-xl sm:text-2xl font-bold text-on-surface dark:text-white tracking-tight">
                {recorder.formatTime(recorder.elapsed)}
              </span>
              <span className="text-xs text-on-surface-variant dark:text-slate-400 font-medium">elapsed</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-secondary dark:text-emerald-400">
            <span className="material-symbols-outlined text-base">mic</span>
            <span className="hidden sm:inline">
              {recorder.isRecording ? 'Microphone Active (High Quality)' : 'Microphone Standby'}
            </span>
            <span className="sm:hidden">{recorder.isRecording ? 'Mic Active' : 'Standby'}</span>
          </div>
        </div>

        {/* Waveform */}
        <WaveformVisualizer isRecording={recorder.isRecording && !recorder.isPaused} />

        {/* File upload error */}
        {fileUpload.error && (
          <p className="text-error text-body-sm bg-error-container/30 dark:bg-rose-950/40 p-2 rounded border border-error/20 dark:border-rose-900/50">
            {fileUpload.error}
          </p>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          <div>
            <input
              ref={fileUpload.fileInputRef as React.RefObject<HTMLInputElement>}
              type="file"
              accept="audio/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button variant="secondary" icon="upload_file" onClick={fileUpload.openPicker}>
              Upload Audio File
            </Button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {!recorder.isRecording ? (
              <Button variant="voice" icon="mic" onClick={handleStartRecording}>
                Start Recording
              </Button>
            ) : (
              <>
                <Button variant="secondary" icon="flag">
                  Mark Key Event
                </Button>
                <Button
                  variant="secondary"
                  icon={recorder.isPaused ? 'play_circle' : 'pause_circle'}
                  onClick={recorder.isPaused ? recorder.resume : recorder.pause}
                >
                  <span className="hidden sm:inline">{recorder.isPaused ? 'Resume' : 'Pause'}</span>
                  <span className="sm:hidden">{recorder.isPaused ? 'Resume' : 'Pause'}</span>
                </Button>
                <Button variant="voice" icon="auto_awesome" onClick={handleStopRecording}>
                  <span className="truncate">Generate SOAP Note</span>
                  <span className="material-symbols-outlined text-sm hidden sm:inline">arrow_forward</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
