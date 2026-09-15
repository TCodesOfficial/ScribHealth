import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import PatientList from '@/components/patients/PatientList'
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
  const [activeTab, setActiveTab] = useState<'transcript' | 'soap'>('transcript')
  const [isLoadingPatients, setIsLoadingPatients] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await patientService.getPatients()
        setPatients(data)
      } catch {
        // silent
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
      try {
        const patient = await patientService.getPatientById(activePatientId)
        setConsultations(patient.consultations || [])
        setActiveTab('transcript')
      } catch {
        setConsultations([])
      }
    }
    load()
  }, [activePatientId])

  const activeConsultation = consultations.find((c) => c.id) || null

  return (
    <DashboardLayout>
      <main className="flex-1 flex overflow-hidden w-full bg-background dark:bg-slate-950 relative">
        {/* Sidebar: Patient list + tabs */}
        <div className="w-full md:w-72 lg:w-80 bg-surface-container-lowest dark:bg-slate-900 border-r border-outline-variant dark:border-slate-800 flex flex-col h-full overflow-hidden">
          {/* Patient list header with search */}
          <div className="p-3 border-b border-outline-variant dark:border-slate-800 space-y-2.5 shrink-0 bg-surface-container-low/20 dark:bg-slate-850">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-secondary dark:text-emerald-400 text-[18px]">patient_list</span>
                <h2 className="text-body-sm font-headline-sm font-bold text-on-surface dark:text-white">Patients Directory</h2>
              </div>
              <span className="text-[11px] font-label-sm px-2 py-0.5 rounded-full bg-surface-container-high dark:bg-slate-800 text-outline dark:text-slate-400 font-semibold border border-outline-variant/60 dark:border-slate-700">
                {patients.length} Patients
              </span>
            </div>

            {/* Search */}
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-2.5 text-outline dark:text-slate-400 text-[16px]">search</span>
              <input
                type="text"
                placeholder="Search name, MRN..."
                className="w-full pl-8 pr-3 py-1.5 text-body-sm bg-surface-container-low dark:bg-slate-800 rounded border border-outline-variant dark:border-slate-700 text-on-surface dark:text-slate-200 placeholder:text-outline dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-secondary dark:focus:ring-emerald-500 text-[12px]"
              />
            </div>
          </div>

          {/* Patient list */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2 custom-scrollbar">
            {isLoadingPatients ? (
              <div className="flex flex-col items-center justify-center py-12">
                <span className="material-symbols-outlined text-3xl text-secondary dark:text-emerald-400 animate-spin block mb-2">progress_activity</span>
                <p className="text-xs text-on-surface-variant dark:text-slate-400">Loading patients...</p>
              </div>
            ) : patients.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <span className="material-symbols-outlined text-3xl text-outline dark:text-slate-500 block mb-2">person_off</span>
                <p className="text-xs text-on-surface-variant dark:text-slate-400">No patients found</p>
                <p className="text-[10px] text-outline dark:text-slate-500 mt-1">Start a recording to create your first patient.</p>
              </div>
            ) : patients.map((p) => (
              <PatientCard
                key={p.id}
                patient={p}
                isActive={p.id === activePatientId}
                onClick={() => setActivePatientId(p.id)}
              />
            ))}
          </div>
        </div>

        {/* Main content area: Transcript/SOAP tabs */}
        <div className="flex-1 flex flex-col bg-background dark:bg-slate-950 overflow-y-auto min-w-0 px-4">
          {activePatientId ? (
            <div className="flex flex-col h-full">
              {/* Tabs navigation */}
              <div className="border-b border-outline-variant dark:border-slate-800 bg-surface-container-low/30 dark:bg-slate-850">
                <button
                  key="transcript"
                  onClick={() => setActiveTab('transcript')}
                  className={`flex-1 py-2 text-[11px] font-label-sm font-semibold text-center transition-all ${
                    activeTab === 'transcript'
                      ? 'bg-secondary dark:bg-emerald-600 text-white'
                      : 'text-on-surface-variant dark:text-slate-300 hover:bg-surface-container-high dark:hover:bg-slate-800'
                  }`}
                >
                  Transcript
                </button>
                <button
                  key="soap"
                  onClick={() => setActiveTab('soap')}
                  className={`flex-1 py-2 text-[11px] font-label-sm font-semibold text-center transition-all ${
                    activeTab === 'soap'
                      ? 'bg-secondary dark:bg-emerald-600 text-white'
                      : 'text-on-surface-variant dark:text-slate-300 hover:bg-surface-container-high dark:hover:bg-slate-800'
                  }`}
                >
                  SOAP Note
                </button>
              </div>

              {/* Tab content */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {activeTab === 'transcript' && (
                  <div className="flex-1 overflow-hidden">
                    {isLoadingPatients ? (
                      <div className="flex-1 flex items-center justify-center">
                        <span className="material-symbols-outlined text-3xl text-secondary dark:text-emerald-400 animate-spin">progress_activity</span>
                      </div>
                    ) : !activeConsultation ? (
                      <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                          <span className="material-symbols-outlined text-4xl text-outline dark:text-slate-500 block mb-2">folder_off</span>
                          <p className="text-sm text-on-surface-variant dark:text-slate-400">No consultations yet</p>
                          <p className="text-xs text-outline dark:text-slate-500 mt-1">Start a recording to create the first consultation.</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <PatientSummary consultation={activeConsultation} />
                        <div className="flex-1 overflow-hidden">
                          <TranscriptFeed rawTranscript={activeConsultation?.rawTranscript} />
                        </div>
                      </>
                    )}
                  </div>
                ))

                {activeTab === 'soap' && (
                  <div className="flex-1 overflow-hidden">
                    <SoapNoteEditor consultation={activeConsultation} />
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Default state: No patient selected - show only patient list, hide transcript/SOAP */
            <div className="flex-1 flex-col items-center justify-center p-8 text-center">
              <span className="material-symbols-outlined text-4xl text-outline dark:text-slate-500 block mb-2">person_search</span>
              <p className="text-sm text-on-surface-variant dark:text-slate-400">Select a patient to view their consultations</p>
            </div>
          )}
        </div>
      </main>
    </DashboardLayout>
  )
}