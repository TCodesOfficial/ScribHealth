import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import DashboardLayout from '@/components/layout/DashboardLayout'
import RecordingCommandCenter from '@/components/recording/RecordingCommandCenter'
import TranscriptFeed from '@/components/recording/TranscriptFeed'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import consultationService from '@/services/consultation.service'
import patientService from '@/services/patient.service'
import { savePendingRecording, getPendingRecordings, deletePendingRecording, type PendingRecording } from '@/lib/db'
import { generateAndDownloadPdf } from '@/lib/pdfExport'
import type { PatientConsultation, Patient } from '@/types'

export default function RecordingPage() {
  const [consultation, setConsultation] = useState<PatientConsultation | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [pendingRecordings, setPendingRecordings] = useState<PendingRecording[]>([])
  const [lastRecordedBlob, setLastRecordedBlob] = useState<Blob | null>(null)

  // Patient info state
  const [patientInfoOpen, setPatientInfoOpen] = useState(false)
  const [patientMode, setPatientMode] = useState<'search' | 'new'>('search')
  const [patientSearch, setPatientSearch] = useState('')
  const [patientResults, setPatientResults] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [newPatient, setNewPatient] = useState({ mrn: '', firstName: '', lastName: '' })
  const [recentPatients, setRecentPatients] = useState<Patient[]>([])
  const [isLoadingRecent, setIsLoadingRecent] = useState(true)

  // Consultation history & Right Sidebar state
  const [consultationHistory, setConsultationHistory] = useState<PatientConsultation[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<PatientConsultation | null>(null)

  // Load recent patients on mount
  useEffect(() => {
    const loadRecent = async () => {
      try {
        const patients = await patientService.getPatients()
        setRecentPatients(Array.isArray(patients) ? patients.slice(0, 10) : [])
      } catch {
        // silent
      } finally {
        setIsLoadingRecent(false)
      }
    }
    loadRecent()
  }, [])

  // Load consultation history on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await consultationService.getHistory()
        setConsultationHistory(Array.isArray(history) ? history : [])
      } catch {
        // silent
      } finally {
        setIsLoadingHistory(false)
      }
    }
    loadHistory()
  }, [])

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

  const searchPatients = useCallback(async (query: string) => {
    if (query.trim().length < 1) {
      setPatientResults([])
      return
    }
    try {
      const results = await patientService.searchPatients(query)
      setPatientResults(Array.isArray(results) ? results : [])
    } catch {
      // silent
    }
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (patientMode === 'search') {
        searchPatients(patientSearch)
      }
    }, 300)
    return () => clearTimeout(timeout)
  }, [patientSearch, patientMode, searchPatients])

  const getPatientData = useCallback(() => {
    if (selectedPatient) {
      return {
        mrn: selectedPatient.mrn || undefined,
        firstName: selectedPatient.firstName,
        lastName: selectedPatient.lastName,
      }
    }
    if (newPatient.firstName || newPatient.lastName || newPatient.mrn) {
      return {
        mrn: newPatient.mrn || undefined,
        firstName: newPatient.firstName || undefined,
        lastName: newPatient.lastName || undefined,
      }
    }
    return undefined
  }, [selectedPatient, newPatient])

  const processFile = useCallback(async (file: File) => {
    setIsProcessing(true)
    setError('')
    try {
      const patientData = getPatientData()
      const result = await consultationService.processAudio(file, patientData)
      setConsultation(result)
      setLastRecordedBlob(null)
      toast.success('SOAP note generated successfully!')
      // Reload history
      try {
        const history = await consultationService.getHistory()
        setConsultationHistory(Array.isArray(history) ? history : [])
      } catch {
        // silent
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to process audio. Please try again.'
      setError(message)
      toast.error(message)
    } finally {
      setIsProcessing(false)
    }
  }, [getPatientData])

  const handleRecordingComplete = useCallback((file: File) => {
    processFile(file)
  }, [processFile])

  const handleRecordingStopped = useCallback((blob: Blob) => {
    setLastRecordedBlob(blob)
  }, [])

  const patientLabel = selectedPatient
    ? `${selectedPatient.firstName} ${selectedPatient.lastName}`
    : newPatient.firstName || newPatient.lastName
    ? `${newPatient.firstName} ${newPatient.lastName}`.trim()
    : null

  const handleSaveForLater = useCallback(async () => {
    if (!lastRecordedBlob || lastRecordedBlob.size === 0) return
    try {
      await savePendingRecording(lastRecordedBlob, `recording-${Date.now()}.webm`, selectedPatient?.id, patientLabel || undefined)
      setLastRecordedBlob(null)
      toast.success('Recording saved for later processing.')
      loadPending()
    } catch {
      toast.error('Failed to save recording.')
    }
  }, [lastRecordedBlob, selectedPatient, patientLabel, loadPending])

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
          {consultation ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-secondary-container/40 dark:bg-emerald-950/60 text-on-secondary-container dark:text-emerald-400 text-xs font-medium border border-secondary/20 dark:border-emerald-600/30">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary dark:bg-emerald-500" />
              Session Complete
            </span>
          ) : isProcessing ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 text-xs font-medium border border-amber-200 dark:border-amber-600/30">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Processing...
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-secondary-container/40 dark:bg-emerald-950/60 text-on-secondary-container dark:text-emerald-400 text-xs font-medium border border-secondary/20 dark:border-emerald-600/30">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary dark:bg-emerald-500" />
              Active Session
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative w-full h-full bg-background dark:bg-slate-950">
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto custom-scrollbar">
          <div className="p-3 sm:p-5 lg:p-6 max-w-7xl w-full mx-auto flex flex-col gap-4 sm:gap-6">
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

            {/* Patient Info - Collapsible */}
            <div className="bg-surface-container-lowest dark:bg-slate-900 rounded border border-outline-variant dark:border-slate-800 shadow-xs overflow-hidden">
              <button
                onClick={() => setPatientInfoOpen(!patientInfoOpen)}
                className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-surface-container-low/50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary dark:text-emerald-400 text-lg">person</span>
                  <span className="text-sm font-semibold text-on-surface dark:text-slate-200">
                    {patientLabel ? `Patient: ${patientLabel}` : 'Set Patient (Optional)'}
                  </span>
                  {selectedPatient?.mrn && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-container-high dark:bg-slate-800 text-on-surface-variant dark:text-slate-400 border border-outline-variant/60 dark:border-slate-700">
                      MRN: {selectedPatient.mrn}
                    </span>
                  )}
                </div>
                <span className="material-symbols-outlined text-on-surface-variant dark:text-slate-400 text-lg transition-transform duration-200" style={{ transform: patientInfoOpen ? 'rotate(180deg)' : 'rotate(0)' }}>
                  expand_more
                </span>
              </button>

              {patientInfoOpen && (
                <div className="px-4 pb-4 border-t border-outline-variant/60 dark:border-slate-800 pt-3 space-y-3">
                  <div className="flex items-center gap-1 p-0.5 bg-surface-container-high dark:bg-slate-800 rounded-lg">
                    <button
                      onClick={() => setPatientMode('search')}
                      className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold transition-all ${
                        patientMode === 'search'
                          ? 'bg-white dark:bg-slate-700 text-on-surface dark:text-white shadow-sm'
                          : 'text-on-surface-variant dark:text-slate-400 hover:text-on-surface dark:hover:text-white'
                      }`}
                    >
                      Existing Patient
                    </button>
                    <button
                      onClick={() => { setPatientMode('new'); setSelectedPatient(null) }}
                      className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold transition-all ${
                        patientMode === 'new'
                          ? 'bg-white dark:bg-slate-700 text-on-surface dark:text-white shadow-sm'
                          : 'text-on-surface-variant dark:text-slate-400 hover:text-on-surface dark:hover:text-white'
                      }`}
                    >
                      New Patient
                    </button>
                  </div>

                  {patientMode === 'search' ? (
                    <div className="space-y-2">
                      {!patientSearch && !selectedPatient && recentPatients.length > 0 && !isLoadingRecent && (
                        <div className="space-y-1">
                          <p className="text-[10px] font-semibold text-on-surface-variant dark:text-slate-400 uppercase tracking-wider px-1">Recent Patients</p>
                          <div className="max-h-48 overflow-y-auto border border-outline-variant/60 dark:border-slate-700 rounded-lg divide-y divide-outline-variant/40 dark:divide-slate-700/40">
                            {recentPatients.map((p) => (
                              <button
                                key={p.id}
                                onClick={() => { setSelectedPatient(p); setPatientSearch(`${p.firstName} ${p.lastName}`) }}
                                className="w-full px-3 py-2.5 text-left hover:bg-surface-container-low/60 dark:hover:bg-slate-800/60 transition-colors flex items-center gap-2.5"
                              >
                                <div className="w-7 h-7 rounded-full bg-secondary-container/40 dark:bg-emerald-900/60 flex items-center justify-center text-[10px] font-bold text-on-secondary-container dark:text-emerald-300 shrink-0">
                                  {p.firstName[0]}{p.lastName[0]}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-on-surface dark:text-slate-200 truncate">{p.firstName} {p.lastName}</p>
                                  <p className="text-[10px] text-on-surface-variant dark:text-slate-400">
                                    {p.mrn ? `MRN: ${p.mrn}` : 'No MRN'}
                                    {p._count?.consultations ? ` \u2022 ${p._count.consultations} visits` : ''}
                                  </p>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="relative">
                        <Input
                          icon="search"
                          placeholder="Search by name or MRN..."
                          value={patientSearch}
                          onChange={(e) => { setPatientSearch(e.target.value); setSelectedPatient(null) }}
                        />
                      </div>

                      {patientResults.length > 0 && !selectedPatient && (
                        <div className="max-h-48 overflow-y-auto border border-outline-variant/60 dark:border-slate-700 rounded-lg divide-y divide-outline-variant/40 dark:divide-slate-700/40">
                          {patientResults.map((p) => (
                            <button
                              key={p.id}
                              onClick={() => { setSelectedPatient(p); setPatientSearch(`${p.firstName} ${p.lastName}`) }}
                              className="w-full px-3 py-2.5 text-left hover:bg-surface-container-low/60 dark:hover:bg-slate-800/60 transition-colors flex items-center gap-2.5"
                            >
                              <div className="w-7 h-7 rounded-full bg-secondary-container/40 dark:bg-emerald-900/60 flex items-center justify-center text-[10px] font-bold text-on-secondary-container dark:text-emerald-300 shrink-0">
                                {p.firstName[0]}{p.lastName[0]}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-on-surface dark:text-slate-200 truncate">{p.firstName} {p.lastName}</p>
                                <p className="text-[10px] text-on-surface-variant dark:text-slate-400">
                                  {p.mrn ? `MRN: ${p.mrn}` : 'No MRN'}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {selectedPatient && (
                        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-secondary-container/20 dark:bg-emerald-950/30 border border-secondary/30 dark:border-emerald-600/30">
                          <div className="w-7 h-7 rounded-full bg-secondary-container/40 dark:bg-emerald-900/60 flex items-center justify-center text-[10px] font-bold text-on-secondary-container dark:text-emerald-300 shrink-0">
                            {selectedPatient.firstName[0]}{selectedPatient.lastName[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-on-surface dark:text-slate-200">{selectedPatient.firstName} {selectedPatient.lastName}</p>
                            <p className="text-[10px] text-on-surface-variant dark:text-slate-400">{selectedPatient.mrn ? `MRN: ${selectedPatient.mrn}` : 'No MRN'}</p>
                          </div>
                          <button onClick={() => { setSelectedPatient(null); setPatientSearch('') }} className="text-on-surface-variant dark:text-slate-400 hover:text-error dark:hover:text-rose-400 transition-colors">
                            <span className="material-symbols-outlined text-sm">close</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <Input
                        icon="badge"
                        placeholder="MRN (optional)"
                        value={newPatient.mrn}
                        onChange={(e) => setNewPatient({ ...newPatient, mrn: e.target.value })}
                      />
                      <Input
                        icon="person"
                        placeholder="First Name"
                        value={newPatient.firstName}
                        onChange={(e) => setNewPatient({ ...newPatient, firstName: e.target.value })}
                      />
                      <Input
                        icon="person"
                        placeholder="Last Name"
                        value={newPatient.lastName}
                        onChange={(e) => setNewPatient({ ...newPatient, lastName: e.target.value })}
                      />
                    </div>
                  )}

                  <p className="text-[10px] text-on-surface-variant dark:text-slate-500 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">info</span>
                    If left empty, a walk-in patient record will be created automatically.
                  </p>
                </div>
              )}
            </div>

            <RecordingCommandCenter
              onRecordingComplete={handleRecordingComplete}
              onRecordingStopped={handleRecordingStopped}
              lastBlob={lastRecordedBlob}
              onSaveForLater={handleSaveForLater}
            />

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
                            {rec.patientName && (
                              <span className="ml-1.5 text-secondary dark:text-emerald-400 font-medium">
                                &bull; {rec.patientName}
                              </span>
                            )}
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

            {/* Generated SOAP Note */}
            {consultation && (
              <div className="bg-surface-container-lowest dark:bg-slate-900 rounded border border-outline-variant dark:border-slate-800 p-4 sm:p-5 shadow-xs relative">
                {consultation.recommendedWard && (
                  <div className="absolute top-4 right-4 z-10">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 shadow-sm animate-pulse">
                      <span className="material-symbols-outlined text-[15px]">local_hospital</span>
                      Ward: {consultation.recommendedWard}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between mb-3 pr-28">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary dark:text-emerald-400 text-lg">check_circle</span>
                    <h3 className="text-sm font-bold text-on-surface dark:text-slate-200 uppercase tracking-wider">
                      Generated SOAP Note
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" icon="download" onClick={() => generateAndDownloadPdf(consultation)}>
                      Export PDF
                    </Button>
                    <Button variant="ghost" size="sm" icon="add" onClick={() => setConsultation(null)}>
                      New Recording
                    </Button>
                  </div>
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

            {/* Consultation History list */}
            <div className="bg-surface-container-lowest dark:bg-slate-900 rounded border border-outline-variant dark:border-slate-800 p-4 shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-on-surface-variant dark:text-slate-400 text-lg">history</span>
                <h3 className="text-sm font-bold text-on-surface dark:text-slate-200 uppercase tracking-wider">
                  Consultation History (Click to view details in right panel)
                </h3>
                {consultationHistory.length > 0 && (
                  <span className="text-xs text-on-surface-variant dark:text-slate-400 font-mono">
                    ({consultationHistory.length})
                  </span>
                )}
              </div>
              {isLoadingHistory ? (
                <div className="flex items-center justify-center py-8">
                  <span className="material-symbols-outlined text-2xl text-secondary dark:text-emerald-400 animate-spin">progress_activity</span>
                </div>
              ) : consultationHistory.length === 0 ? (
                <div className="text-center py-8">
                  <span className="material-symbols-outlined text-3xl text-outline dark:text-slate-500 block mb-2">history</span>
                  <p className="text-sm text-on-surface-variant dark:text-slate-400">No consultations yet</p>
                  <p className="text-xs text-outline dark:text-slate-500 mt-1">Start a recording to create your first consultation.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {consultationHistory.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedHistoryItem(c)}
                      className={`w-full text-left p-3 rounded transition-colors border ${
                        selectedHistoryItem?.id === c.id
                          ? 'bg-secondary-container/30 dark:bg-emerald-950/40 border-secondary/50 dark:border-emerald-600/50'
                          : 'bg-surface-container-high/40 dark:bg-slate-800/40 border-outline-variant/50 dark:border-slate-700/50 hover:bg-surface-container-high/80 dark:hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-on-surface dark:text-slate-200">
                            {c.patient.firstName} {c.patient.lastName}
                            {c.patient.mrn && (
                              <span className="ml-1.5 font-mono text-on-surface-variant dark:text-slate-400">MRN: {c.patient.mrn}</span>
                            )}
                            {c.recommendedWard && (
                              <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                                {c.recommendedWard}
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-on-surface-variant dark:text-slate-400 mt-0.5 line-clamp-1">
                            {c.assessment}
                          </p>
                        </div>
                        <span className="text-[10px] text-on-surface-variant dark:text-slate-500 shrink-0">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <TranscriptFeed rawTranscript={consultation?.rawTranscript} consultationId={consultation?.id} />
          </div>
        </div>

        {/* Right Sidebar for Selected Consultation History Details */}
        {selectedHistoryItem && (
          <aside className="fixed lg:relative inset-y-0 right-0 top-16 lg:top-0 z-50 w-full sm:w-80 lg:w-96 bg-surface-container-lowest dark:bg-slate-900 border-l border-outline-variant dark:border-slate-800 flex flex-col h-[calc(100%-4rem)] lg:h-full shrink-0 shadow-2xl lg:shadow-xl overflow-hidden">
            <div className="p-3.5 border-b border-outline-variant dark:border-slate-800 bg-surface-container-lowest dark:bg-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary dark:text-emerald-400 text-lg">clinical_notes</span>
                <h3 className="text-xs font-bold text-on-surface dark:text-white uppercase tracking-wider">
                  History Details
                </h3>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => generateAndDownloadPdf(selectedHistoryItem)}
                  className="p-1.5 rounded-lg bg-secondary dark:bg-emerald-600 text-white hover:bg-secondary/90 text-xs font-semibold flex items-center gap-1 shadow-sm"
                  title="Download PDF Report"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                </button>
                <button
                  onClick={() => setSelectedHistoryItem(null)}
                  className="p-1.5 rounded-lg text-outline dark:text-slate-400 hover:text-on-surface dark:hover:text-white"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar">
              <div className="p-3 rounded-lg bg-surface-container-low dark:bg-slate-800 border border-outline-variant dark:border-slate-700 space-y-1">
                <h4 className="text-sm font-bold text-on-surface dark:text-white">
                  {selectedHistoryItem.patient.firstName} {selectedHistoryItem.patient.lastName}
                </h4>
                <p className="text-xs text-outline dark:text-slate-400 font-mono">
                  {selectedHistoryItem.patient.mrn ? `MRN: ${selectedHistoryItem.patient.mrn}` : 'No MRN'}
                  {selectedHistoryItem.patient.gender ? ` &bull; ${selectedHistoryItem.patient.gender}` : ''}
                </p>
                {selectedHistoryItem.recommendedWard && (
                  <p className="text-xs font-semibold text-secondary dark:text-emerald-400 pt-1">
                    Recommended Ward: {selectedHistoryItem.recommendedWard}
                  </p>
                )}
                <p className="text-[11px] text-outline pt-1">
                  Encounter: {new Date(selectedHistoryItem.createdAt).toLocaleString()}
                </p>
              </div>

              {[
                { label: 'Subjective', content: selectedHistoryItem.subjective },
                { label: 'Objective', content: selectedHistoryItem.objective },
                { label: 'Assessment', content: selectedHistoryItem.assessment },
                { label: 'Plan', content: selectedHistoryItem.plan },
              ].map((sec) => (
                <div key={sec.label} className="space-y-1">
                  <span className="text-[11px] font-bold text-on-surface-variant dark:text-slate-400 uppercase tracking-wider block">
                    {sec.label}
                  </span>
                  <div className="p-2.5 rounded bg-surface-container-low/80 dark:bg-slate-800/80 border border-outline-variant dark:border-slate-700 text-xs text-on-surface dark:text-slate-200 leading-relaxed">
                    {sec.content}
                  </div>
                </div>
              ))}

              {selectedHistoryItem.icd10Codes?.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold text-on-surface-variant dark:text-slate-400 uppercase tracking-wider block mb-1">
                    ICD-10 Codes
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {selectedHistoryItem.icd10Codes.map((code) => (
                      <span key={code} className="px-2 py-0.5 rounded bg-surface-container-high dark:bg-slate-800 border border-outline-variant dark:border-slate-700 text-[11px] font-mono text-on-surface dark:text-slate-200">
                        {code}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>
    </DashboardLayout>
  )
}
