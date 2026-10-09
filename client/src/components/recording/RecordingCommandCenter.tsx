import { useCallback, useEffect, useMemo } from 'react'
import toast from 'react-hot-toast'
import WaveformVisualizer from './WaveformVisualizer'
import AudioPlayer from './AudioPlayer'
import Button from '@/components/ui/Button'
import { useLiveRecording } from '@/hooks/useLiveRecording'
import { useFileUpload } from '@/hooks/useFileUpload'

interface RecordingCommandCenterProps {
  onRecordingComplete: (file: File) => void
  onRecordingStopped?: (blob: Blob) => void
  lastBlob: Blob | null
  onSaveForLater: () => void
}

export default function RecordingCommandCenter({
  onRecordingComplete,
  onRecordingStopped,
  lastBlob,
  onSaveForLater,
}: RecordingCommandCenterProps) {
  const recorder = useLiveRecording()
  const fileUpload = useFileUpload()

  const previewUrl = useMemo(
    () => (lastBlob ? URL.createObjectURL(lastBlob) : null),
    [lastBlob],
  )
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const handleStartRecording = useCallback(async () => {
    try {
      await recorder.start()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to start recording')
    }
  }, [recorder])

  const handleStopRecording = useCallback(async () => {
    const blob = await recorder.stop()
    if (blob && blob.size > 0) {
      onRecordingStopped?.(blob)
      const file = new File([blob], `recording-${Date.now()}.webm`, { type: blob.type })
      onRecordingComplete(file)
    }
  }, [recorder, onRecordingComplete, onRecordingStopped])

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
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {recorder.isRecording ? (
              <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-error-container/40 dark:bg-rose-950/40 border border-error/30 dark:border-rose-900/50 text-error dark:text-rose-400 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-error dark:bg-rose-500 animate-pulse" />
                {recorder.isPaused ? 'Paused' : 'Recording'}
              </div>
            ) : (
              <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-surface-container-high dark:bg-slate-800 border border-outline-variant/60 dark:border-slate-700 text-on-surface-variant dark:text-slate-400 text-xs font-semibold">
                <span className="material-symbols-outlined text-base">mic_off</span>
                {lastBlob ? 'Recording Stopped' : 'Ready'}
              </div>
            )}
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-xl sm:text-2xl font-bold text-on-surface dark:text-white tracking-tight">
                {recorder.formatTime(recorder.elapsed)}
              </span>
              <span className="text-xs text-on-surface-variant dark:text-slate-400 font-medium hidden sm:inline">elapsed</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-medium text-secondary dark:text-emerald-400">
            <span className="material-symbols-outlined text-base">mic</span>
            <span>{recorder.isRecording ? 'Active' : 'Standby'}</span>
          </div>
        </div>

        {/* Waveform */}
        <WaveformVisualizer isRecording={recorder.isRecording && !recorder.isPaused} />

        {/* Recording preview playback */}
        {lastBlob && !recorder.isRecording && previewUrl && (
          <AudioPlayer audioUrl={previewUrl} fileName="Recording preview" />
        )}

        {/* File upload error */}
        {fileUpload.error && (
          <p className="text-error text-body-sm bg-error-container/30 dark:bg-rose-950/40 p-2 rounded border border-error/20 dark:border-rose-900/50">
            {fileUpload.error}
          </p>
        )}

        {/* Action buttons */}
        <div className="grid grid-cols-1 sm:flex sm:items-center sm:justify-between gap-3 pt-1">
          <div className="flex sm:block justify-center">
            <input
              ref={fileUpload.fileInputRef as React.RefObject<HTMLInputElement>}
              type="file"
              accept="audio/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button variant="secondary" icon="upload_file" onClick={fileUpload.openPicker} className="w-full sm:w-auto">
              Upload Audio
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:flex gap-2 sm:gap-3 w-full sm:w-auto">
            {recorder.isRecording ? (
              <>
                <Button
                  variant="secondary"
                  icon={recorder.isPaused ? 'play_circle' : 'pause_circle'}
                  onClick={recorder.isPaused ? recorder.resume : recorder.pause}
                  className="w-full sm:w-auto"
                >
                  {recorder.isPaused ? 'Resume' : 'Pause'}
                </Button>
                <Button variant="secondary" icon="bookmark_add" onClick={onSaveForLater} className="w-full sm:w-auto">
                  <span className="hidden sm:inline">Save for Later</span>
                  <span className="sm:hidden">Save</span>
                </Button>
                <Button variant="voice" icon="stop_circle" onClick={handleStopRecording} className="w-full sm:w-auto col-span-2 sm:col-span-1">
                  <span className="truncate">Generate SOAP Note</span>
                </Button>
              </>
            ) : lastBlob ? (
              <>
                <Button variant="secondary" icon="refresh" onClick={handleStartRecording} className="w-full sm:w-auto">
                  New Recording
                </Button>
                <Button variant="secondary" icon="bookmark_add" onClick={onSaveForLater} className="w-full sm:w-auto">
                  <span className="hidden sm:inline">Save for Later</span>
                  <span className="sm:hidden">Save</span>
                </Button>
                <Button variant="voice" icon="description" className="w-full sm:w-auto col-span-2 sm:col-span-1" onClick={() => {
                  const file = new File([lastBlob], `recording-${Date.now()}.webm`, { type: lastBlob.type })
                  onRecordingComplete(file)
                }}>
                  <span className="truncate">Generate SOAP Note</span>
                </Button>
              </>
            ) : (
              <Button variant="voice" icon="mic" onClick={handleStartRecording} className="w-full sm:w-auto col-span-2 sm:col-span-1">
                Start Recording
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
