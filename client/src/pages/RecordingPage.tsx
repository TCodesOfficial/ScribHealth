import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import DashboardLayout from '@/components/layout/DashboardLayout'
import RecordingCommandCenter from '@/components/recording/RecordingCommandCenter'
import TranscriptFeed from '@/components/recording/TranscriptFeed'
import Button from '@/components/ui/Button'
import consultationService from '@/services/consultation.service'
import { getPendingRecordings, deletePendingRecording, type PendingRecording } from '@/lib/db'
import type { PatientConsultation } from '@/types'

export default function RecordingPage() {
  const [consultation, setConsultation] = useState<PatientConsultation | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [pendingRecordings, setPendingRecordings] = useState<PendingRecording[]>([])

  const loadPending = useCallback(async () => {
    try {
      const list = await getPendingRecordings()
      setPendingRecordings(list.sort((a, b) => b.createdAt - a.createdAt))
    } catch {
      // silent
    }
  }, [])

  useEffect(() => {
    loadPending()
  }, [loadPending])

  const processFile = useCallback(async (file: File) => {
    setIsProcessing(true)
    setError('')
    try {
      const result = await consultationService.processAudio(file)
      setConsultation(result)
      toast.success('SOAP note generated successfully!')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to process audio. Please try again.'
      setError(message)
      toast.error(message)
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const handleRecordingComplete = useCallback((file: File) => {
    processFile(file)
  }, [processFile])

  const handleRetryPending = useCallback(async (recording: PendingRecording) => {
    await deletePendingRecording(recording.id)
    setPendingRecordings((prev) => prev.filter((r) => r.id !== recording.id))
    const file = new File([recording.blob], recording.fileName, { type: recording.blob.type })
    processFile(file)
  }, [processFile])

  const handleDeletePending = useCallback(async (id: string) => {
    await deletePendingRecording(id)
    setPendingRecordings((prev) => prev.filter((r) => r.id !== id))
    toast.success('Pending recording deleted.')
  }, [])

  return (
    <DashboardLayout>
      {/* Subheader */}
      <div className="px-4 sm:px-6 py-2.5 sm:py-3 bg-surface-container-lowest dark:bg-slate-900 border-b border-outline-variant/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-label-sm font-label-sm truncate">
          <span className="font-semibold text-on-surface dark:text-slate-200">Live Recording</span>
          <span className="text-outline dark:text-slate-500">&bull;</span>
          <span className="text-on-surface-variant dark:text-slate-400">AI-Powered SOAP Generation</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-secondary-container/40 dark:bg-emerald-950/60 text-on-secondary-container dark:text-emerald-400 text-xs font-medium border border-secondary/20 dark:border-emerald-600/30">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary dark:bg-emerald-500" />
            Active Session
          </span>
        </div>
      </div>

      <div className="p-3 sm:p-5 lg:p-6 flex-1 flex flex-col gap-4 sm:gap-6 max-w-7xl w-full mx-auto">
        {error && (
          <div className="p-3 rounded bg-error-container/30 dark:bg-rose-950/40 border border-error/20 dark:border-rose-900/50 text-error dark:text-rose-300 text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-base">error</span>
            {error}
          </div>
        )}

        {isProcessing && (
          <div className="p-4 rounded bg-secondary-container/20 dark:bg-emerald-950/40 border border-secondary/30 dark:border-emerald-600/30 flex items-center gap-3">
            <span className="material-symbols-outlined text-secondary dark:text-emerald-400 text-xl animate-spin">progress_activity</span>
            <div className="text-sm">
              <span className="font-semibold text-on-surface dark:text-slate-200 block">Processing Audio...</span>
              <span className="text-on-surface-variant dark:text-slate-400">Transcribing and generating clinical documentation.</span>
            </div>
          </div>
        )}

        <RecordingCommandCenter onRecordingComplete={handleRecordingComplete} />

        {/* Pending recordings */}
        {pendingRecordings.length > 0 && (
          <div className="bg-surface-container-lowest dark:bg-slate-900 rounded border border-outline-variant dark:border-slate-800 p-4 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-amber-500 dark:text-amber-400 text-lg">schedule_send</span>
              <h3 className="text-sm font-bold text-on-surface dark:text-slate-200 uppercase tracking-wider">
                Pending Recordings
              </h3>
              <span className="text-xs text-on-surface-variant dark:text-slate-400 font-mono">
                ({pendingRecordings.length})
              </span>
            </div>
            <div className="space-y-2">
              {pendingRecordings.map((rec) => (
                <div
                  key={rec.id}
                  className="flex items-center justify-between gap-3 p-2.5 rounded bg-surface-container-high/60 dark:bg-slate-800/60 border border-outline-variant/50 dark:border-slate-700/50"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="material-symbols-outlined text-on-surface-variant dark:text-slate-400 text-base">audio_file</span>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-on-surface dark:text-slate-200 truncate">{rec.fileName}</p>
                      <p className="text-[10px] text-on-surface-variant dark:text-slate-400">
                        {new Date(rec.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button variant="voice" size="sm" icon="play_arrow" onClick={() => handleRetryPending(rec)}>
                      Process
                    </Button>
                    <Button variant="ghost" size="sm" icon="delete" onClick={() => handleDeletePending(rec.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {consultation && (
          <div className="bg-surface-container-lowest dark:bg-slate-900 rounded border border-outline-variant dark:border-slate-800 p-4 sm:p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-secondary dark:text-emerald-400 text-lg">check_circle</span>
              <h3 className="text-sm font-bold text-on-surface dark:text-slate-200 uppercase tracking-wider">
                Generated SOAP Note
              </h3>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Subjective', content: consultation.subjective },
                { label: 'Objective', content: consultation.objective },
                { label: 'Assessment', content: consultation.assessment },
                { label: 'Plan', content: consultation.plan },
              ].map((section) => (
                <div key={section.label}>
                  <span className="text-label-sm font-label-sm font-semibold text-on-surface-variant dark:text-slate-400 uppercase tracking-wider block mb-1">
                    {section.label}
                  </span>
                  <div className="p-2.5 bg-surface-bright dark:bg-slate-800/80 border border-outline-variant/60 dark:border-slate-700 rounded text-body-sm text-on-surface dark:text-slate-200 leading-relaxed">
                    {section.content}
                  </div>
                </div>
              ))}
              {consultation.icd10Codes.length > 0 && (
                <div>
                  <span className="text-label-sm font-label-sm font-semibold text-on-surface-variant dark:text-slate-400 uppercase tracking-wider block mb-1">
                    ICD-10 Codes
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {consultation.icd10Codes.map((code) => (
                      <span key={code} className="px-2 py-0.5 rounded bg-surface-container-high dark:bg-slate-800 border border-outline-variant/60 dark:border-slate-700 text-[11px] font-mono text-on-surface dark:text-slate-200">
                        {code}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <TranscriptFeed rawTranscript={consultation?.rawTranscript} />
      </div>
    </DashboardLayout>
  )
}
