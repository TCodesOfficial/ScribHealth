import { useState, useEffect, useMemo } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import PatientCard from '@/components/patients/PatientCard'
import PatientSummary from '@/components/patients/PatientSummary'
import TranscriptFeed from '@/components/recording/TranscriptFeed'
import SoapNoteEditor from '@/components/soap/SoapNoteEditor'
import patientService from '@/services/patient.service'
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

  useEffect(() => {
    const load = async () => {
      try {
        const data = await patientService.getPatients()
        setPatients(data)
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

  const handleSelectPatient = (id: string) => {
    setActivePatientId(id)
    setMobileSidebarOpen(false)
  }

  const sidebarClasses =
    (mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full') +
    ' md:translate-x-0 ' +
    (sidebarCollapsed ? 'md:w-16' : 'md:w-72 lg:w-80') +
    ' fixed md:relative top-16 md:top-0 bottom-0 left-0 z-40 w-72 md:z-auto ' +
    'bg-surface-container-lowest dark:bg-slate-900 border-r border-outline-variant dark:border-slate-800 ' +
    'flex flex-col h-[calc(100%-4rem)] md:h-full overflow-hidden transition-all duration-300 ease-in-out shrink-0 shadow-xl md:shadow-none'

  const tabButtonClass = (tab: string) => {
    const base = 'flex-1 py-2.5 px-4 text-[11px] font-label-sm font-semibold text-center transition-all border-b-2 '
    if (activeTab === tab) {
      return base + 'border-secondary dark:border-emerald-500 bg-secondary/5 dark:bg-emerald-950/20 text-secondary dark:text-emerald-400'
    }
    return base + 'border-transparent text-on-surface-variant dark:text-slate-400 hover:bg-surface-container-high dark:hover:bg-slate-800'
  }

  return (
    <DashboardLayout>
      <div className="flex-1 flex overflow-hidden w-full h-full bg-background dark:bg-slate-950 relative">
        {mobileSidebarOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="md:hidden fixed top-16 left-2 z-50 p-2 rounded-lg bg-surface-container-high dark:bg-slate-800 border border-outline-variant dark:border-slate-700 shadow-lg text-on-surface dark:text-slate-200"
          title="Toggle patient list"
        >
          <span className="material-symbols-outlined text-[20px]">
            {mobileSidebarOpen ? 'close' : 'people'}
          </span>
        </button>

        <aside className={sidebarClasses}>
          <div className="p-3 border-b border-outline-variant dark:border-slate-800 space-y-2.5 shrink-0 bg-surface-container-low/20 dark:bg-slate-850">
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

          <div className="flex-1 overflow-y-auto p-2.5 space-y-2 custom-scrollbar">
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
            <div className="p-2.5 border-t border-outline-variant dark:border-slate-800 bg-surface-container-low/30 dark:bg-slate-850 shrink-0 text-[11px] text-outline dark:text-slate-400">
              <span className="font-label-sm">Sorted by: Most Recent</span>
            </div>
          )}
        </aside>

        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          {activePatientId ? (
            <>
              <div className="flex items-center border-b border-outline-variant dark:border-slate-800 bg-surface-container-low/30 dark:bg-slate-850 shrink-0">
                <button onClick={() => setActiveTab('transcript')} className={tabButtonClass('transcript')}>
                  <span className="material-symbols-outlined text-[14px] mr-1 align-middle">subtitles</span>
                  Transcript
                </button>
                <button onClick={() => setActiveTab('soap')} className={tabButtonClass('soap')}>
                  <span className="material-symbols-outlined text-[14px] mr-1 align-middle">description</span>
                  SOAP Note
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
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
                          onPatientUpdated={async () => {
                            try {
                              const data = await patientService.getPatients()
                              setPatients(data)
                              if (activePatientId) {
                                const patient = await patientService.getPatientById(activePatientId)
                                setConsultations(patient.consultations || [])
                              }
                            } catch {}
                          }}
                        />
                        <div className="flex-1 p-4">
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
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}