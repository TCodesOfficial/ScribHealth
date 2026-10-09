import { useState, useEffect, useMemo } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import PatientCard from '@/components/patients/PatientCard'
import PatientSummary from '@/components/patients/PatientSummary'
import EditPatientModal from '@/components/patients/EditPatientModal'
import ConfirmModal from '@/components/modals/ConfirmModal'
import TranscriptFeed from '@/components/recording/TranscriptFeed'
import SoapNoteEditor from '@/components/soap/SoapNoteEditor'
import patientService from '@/services/patient.service'
import toast from 'react-hot-toast'
import type { Patient, PatientConsultation } from '@/types'

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [activePatientId, setActivePatientId] = useState<string | null>(null)
  const [consultations, setConsultations] = useState<PatientConsultation[]>([])
  const [activeTab, setActiveTab] = useState('transcript' as 'transcript' | 'soap')
  const [isLoadingPatients, setIsLoadingPatients] = useState(true)
  const [isLoadingConsultations, setIsLoadingConsultations] = useState(false)
  const [search, setSearch] = useState('')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await patientService.getPatients()
        setPatients(data)
        // Auto-select the most recent patient (list is ordered updatedAt desc)
        if (data.length > 0) {
          setActivePatientId((prev) => prev ?? data[0].id)
        }
      } catch {
      } finally {
        setIsLoadingPatients(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    if (!activePatientId) {
      setConsultations([])
      setActiveTab('transcript')
      return
    }
    const load = async () => {
      setIsLoadingConsultations(true)
      try {
        const patient = await patientService.getPatientById(activePatientId)
        setConsultations(patient.consultations || [])
        setActiveTab('transcript')
      } catch {
        setConsultations([])
      } finally {
        setIsLoadingConsultations(false)
      }
    }
    load()
  }, [activePatientId])

  const filteredPatients = useMemo(() => {
    const arr = Array.isArray(patients) ? patients : []
    if (!search.trim()) return arr
    const q = search.toLowerCase()
    return arr.filter(
      (p) =>
        p.firstName.toLowerCase().includes(q) ||
        p.lastName.toLowerCase().includes(q) ||
        p.mrn?.toLowerCase().includes(q),
    )
  }, [patients, search])

  const activeConsultation = consultations[0] || null

  const activePatient = useMemo(
    () => patients.find((p) => p.id === activePatientId) || null,
    [patients, activePatientId],
  )

  const refreshPatientData = async () => {
    try {
      const data = await patientService.getPatients()
      setPatients(data)
      if (activePatientId) {
        const patient = await patientService.getPatientById(activePatientId)
        setConsultations(patient.consultations || [])
      }
    } catch {
      // silent
    }
  }

  const handleDeletePatient = async () => {
    if (!activePatient) return
    setIsDeleting(true)
    try {
      await patientService.deletePatient(activePatient.id)
      toast.success('Patient deleted successfully.')
      setIsConfirmOpen(false)
      setConsultations([])
      const data = await patientService.getPatients()
      setPatients(data)
      // Fall back to the next most recent patient instead of the empty state
      setActivePatientId(data.length > 0 ? data[0].id : null)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete patient.'
      toast.error(message)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSelectPatient = (id: string) => {
    setActivePatientId(id)
    setMobileSidebarOpen(false)
  }

  const sidebarClasses =
    (mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full') +
    ' md:translate-x-0 ' +
    (sidebarCollapsed ? 'md:w-16' : 'md:w-72 lg:w-80') +
    ' fixed md:relative top-16 md:top-auto bottom-0 md:bottom-auto left-0 z-40 md:z-auto ' +
    'w-72 max-w-[85vw] md:max-w-none ' +
    'bg-surface-container-lowest dark:bg-slate-900 border-r border-outline-variant dark:border-slate-800 ' +
    'flex flex-col md:h-full overflow-hidden transition-all duration-300 ease-in-out shrink-0 shadow-xl md:shadow-none'

  const tabButtonClass = (tab: string) => {
    const base = 'flex-1 py-2.5 px-4 text-[11px] font-label-sm font-semibold text-center transition-all border-b-2 '
    if (activeTab === tab) {
      return base + 'border-secondary dark:border-emerald-500 bg-secondary/5 dark:bg-emerald-950/20 text-secondary dark:text-emerald-400'
    }
    return base + 'border-transparent text-on-surface-variant dark:text-slate-400 hover:bg-surface-container-high dark:hover:bg-slate-800'
  }

  return (
    <DashboardLayout>
      <div className="flex-1 flex overflow-hidden w-full min-h-0 bg-background dark:bg-slate-950 relative">
        {mobileSidebarOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        <aside className={sidebarClasses}>
          <div className="p-3 border-b border-outline-variant dark:border-slate-800 space-y-2.5 shrink-0 bg-surface-container-low/20 dark:bg-slate-800/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-secondary dark:text-emerald-400 text-[18px]">patient_list</span>
                {!sidebarCollapsed && (
                  <h2 className="text-body-sm font-headline-sm font-bold text-on-surface dark:text-white">Patients</h2>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                {!sidebarCollapsed && (
                  <span className="text-[11px] font-label-sm px-2 py-0.5 rounded-full bg-surface-container-high dark:bg-slate-800 text-outline dark:text-slate-400 font-semibold border border-outline-variant/60 dark:border-slate-700">
                    {filteredPatients.length}
                  </span>
                )}
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="md:hidden p-1 rounded hover:bg-surface-container-high dark:hover:bg-slate-800 text-outline dark:text-slate-400 transition-colors"
                  title="Close patient list"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="hidden md:flex p-1 rounded hover:bg-surface-container-high dark:hover:bg-slate-800 text-outline dark:text-slate-400 transition-colors"
                  title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {sidebarCollapsed ? 'chevron_right' : 'chevron_left'}
                  </span>
                </button>
              </div>
            </div>
            {!sidebarCollapsed && (
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-2.5 text-outline dark:text-slate-400 text-[16px]">search</span>
                <input
                  type="text"
                  placeholder="Search name, MRN..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-body-sm bg-surface-container-low dark:bg-slate-800 rounded border border-outline-variant dark:border-slate-700 text-on-surface dark:text-slate-200 placeholder:text-outline dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-secondary dark:focus:ring-emerald-500 text-[12px]"
                />
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain p-2.5 space-y-2 custom-scrollbar">
            {isLoadingPatients ? (
              <div className="flex flex-col items-center justify-center py-12">
                <span className="material-symbols-outlined text-3xl text-secondary dark:text-emerald-400 animate-spin block mb-2">progress_activity</span>
                {!sidebarCollapsed && <p className="text-xs text-on-surface-variant dark:text-slate-400">Loading patients...</p>}
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <span className="material-symbols-outlined text-3xl text-outline dark:text-slate-500 block mb-2">person_off</span>
                {!sidebarCollapsed && (
                  <>
                    <p className="text-xs text-on-surface-variant dark:text-slate-400">No patients found</p>
                    <p className="text-[10px] text-outline dark:text-slate-500 mt-1">Start a recording to create your first patient.</p>
                  </>
                )}
              </div>
            ) : (
              filteredPatients.map((p) => (
                <div key={p.id} className={sidebarCollapsed ? 'flex justify-center' : ''}>
                  <div className={sidebarCollapsed ? 'w-10' : 'w-full'}>
                    <PatientCard
                      patient={p}
                      isActive={p.id === activePatientId}
                      onClick={() => handleSelectPatient(p.id)}
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          {!sidebarCollapsed && (
            <div className="p-2.5 border-t border-outline-variant dark:border-slate-800 bg-surface-container-low/30 dark:bg-slate-800/50 shrink-0 text-[11px] text-outline dark:text-slate-400">
              <span className="font-label-sm">Sorted by: Most Recent</span>
            </div>
          )}
        </aside>

        <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
          {activePatientId ? (
            <>
              {/* Patient header — always visible, edit/delete available even with no consultations */}
              {activePatient && (
                <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2.5 bg-surface-container-low/30 dark:bg-slate-800/50 border-b border-outline-variant dark:border-slate-800 shrink-0">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <button
                      onClick={() => setMobileSidebarOpen(true)}
                      className="md:hidden p-1.5 rounded-lg bg-surface-container-high dark:bg-slate-800 border border-outline-variant dark:border-slate-700 text-on-surface dark:text-slate-200 shrink-0"
                      title="Open patient list"
                    >
                      <span className="material-symbols-outlined text-[18px]">people</span>
                    </button>
                    <div className="min-w-0">
                      <span className="block text-sm font-bold text-on-surface dark:text-white truncate">
                        {activePatient.firstName} {activePatient.lastName}
                      </span>
                      <span className="block text-[11px] text-outline dark:text-slate-400">
                        {activePatient.mrn && <span className="font-mono">MRN: {activePatient.mrn} · </span>}
                        {activePatient._count?.consultations ?? 0} consultation(s)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setIsEditOpen(true)}
                      className="px-2.5 py-1 rounded bg-surface-container-high dark:bg-slate-800 text-on-surface dark:text-slate-200 hover:bg-surface-container-highest dark:hover:bg-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors border border-outline-variant/60 dark:border-slate-700"
                    >
                      <span className="material-symbols-outlined text-[14px]">edit</span>
                      Edit
                    </button>
                    <button
                      onClick={() => setIsConfirmOpen(true)}
                      disabled={isDeleting}
                      className="px-2.5 py-1 rounded bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950 text-xs font-semibold flex items-center gap-1 transition-colors border border-red-200 dark:border-red-900 disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {isDeleting ? 'progress_activity' : 'delete'}
                      </span>
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              )}

              {isConfirmOpen && activePatient && (
                <ConfirmModal
                  isOpen={isConfirmOpen}
                  title="Delete patient"
                  message={
                    (activePatient._count?.consultations ?? 0) > 0
                      ? `Delete ${activePatient.firstName} ${activePatient.lastName}? This will also permanently delete their ${(activePatient._count?.consultations ?? 0)} consultation(s) and recordings. This cannot be undone.`
                      : `Delete ${activePatient.firstName} ${activePatient.lastName}? This permanently removes the patient record and cannot be undone.`
                  }
                  confirmLabel={isDeleting ? 'Deleting...' : 'Delete'}
                  cancelLabel="Cancel"
                  danger
                  loading={isDeleting}
                  onConfirm={handleDeletePatient}
                  onCancel={() => setIsConfirmOpen(false)}
                />
              )}

              {isEditOpen && activePatient && (
                <EditPatientModal
                  patient={activePatient}
                  onClose={() => setIsEditOpen(false)}
                  onUpdated={refreshPatientData}
                />
              )}

              <div className="flex items-center border-b border-outline-variant dark:border-slate-800 bg-surface-container-low/30 dark:bg-slate-800/50 shrink-0">
                <button onClick={() => setActiveTab('transcript')} className={tabButtonClass('transcript')}>
                  <span className="material-symbols-outlined text-[14px] mr-1 align-middle">subtitles</span>
                  Transcript
                </button>
                <button onClick={() => setActiveTab('soap')} className={tabButtonClass('soap')}>
                  <span className="material-symbols-outlined text-[14px] mr-1 align-middle">description</span>
                  SOAP Note
                </button>
              </div>

              <div className="flex-1 overflow-y-auto overscroll-contain">
                {activeTab === 'transcript' && (
                  <div className="h-full flex flex-col">
                    {isLoadingConsultations ? (
                      <div className="flex-1 flex items-center justify-center">
                        <span className="material-symbols-outlined text-3xl text-secondary dark:text-emerald-400 animate-spin">progress_activity</span>
                      </div>
                    ) : !activeConsultation ? (
                      <div className="flex-1 flex items-center justify-center p-8">
                        <div className="text-center">
                          <span className="material-symbols-outlined text-4xl text-outline dark:text-slate-500 block mb-2">folder_off</span>
                          <p className="text-sm text-on-surface-variant dark:text-slate-400">No consultations yet</p>
                          <p className="text-xs text-outline dark:text-slate-500 mt-1">Start a recording to create the first consultation.</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <PatientSummary
                          consultation={activeConsultation}
                          onPatientUpdated={refreshPatientData}
                        />
                        <div className="flex-1 min-h-0 p-4">
                          <TranscriptFeed rawTranscript={activeConsultation.rawTranscript} consultationId={activeConsultation.id} />
                        </div>
                      </>
                    )}
                  </div>
                )}

                {activeTab === 'soap' && activeConsultation && (
                  <div className="h-full p-4">
                    <SoapNoteEditor
                      consultation={activeConsultation}
                      onConsultationUpdated={(updated) => {
                        setConsultations(consultations.map((c) => (c.id === updated.id ? updated : c)))
                      }}
                    />
                  </div>
                )}

                {activeTab === 'soap' && !activeConsultation && (
                  <div className="flex-1 flex items-center justify-center p-8">
                    <div className="text-center">
                      <span className="material-symbols-outlined text-4xl text-outline dark:text-slate-500 block mb-2">description</span>
                      <p className="text-sm text-on-surface-variant dark:text-slate-400">No SOAP notes yet</p>
                      <p className="text-xs text-outline dark:text-slate-500 mt-1">Start a recording to generate a SOAP note.</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <span className="material-symbols-outlined text-5xl text-outline dark:text-slate-500 block mb-3">person_search</span>
                <p className="text-sm text-on-surface-variant dark:text-slate-400">Select a patient to view their consultations</p>
                <button
                  onClick={() => setMobileSidebarOpen(true)}
                  className="md:hidden mt-4 px-4 py-2 rounded-lg bg-secondary dark:bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1.5 mx-auto active:scale-95 transition-all shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">people</span>
                  Browse Patients
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}