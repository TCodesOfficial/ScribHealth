import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import ClinicalContextDrawer from '@/components/layout/ClinicalContextDrawer'
import PatientList from '@/components/patients/PatientList'
import PatientSummary from '@/components/patients/PatientSummary'
import TranscriptFeed from '@/components/recording/TranscriptFeed'
import SoapNoteEditor from '@/components/soap/SoapNoteEditor'
import patientService from '@/services/patient.service'
import type { Patient, PatientConsultation } from '@/types'

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [activePatientId, setActivePatientId] = useState<string | null>(null)
  const [consultations, setConsultations] = useState<PatientConsultation[]>([])
  const [activeConsultationId, setActiveConsultationId] = useState<string | null>(null)
  const [isLoadingPatients, setIsLoadingPatients] = useState(true)
  const [isLoadingConsultations, setIsLoadingConsultations] = useState(false)
  const [contextOpen, setContextOpen] = useState(false)

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
      setActiveConsultationId(null)
      return
    }

    const load = async () => {
      setIsLoadingConsultations(true)
      try {
        const patient = await patientService.getPatientById(activePatientId)
        setConsultations(patient.consultations || [])
        if (patient.consultations && patient.consultations.length > 0) {
          setActiveConsultationId(patient.consultations[0].id)
        } else {
          setActiveConsultationId(null)
        }
      } catch {
        setConsultations([])
        setActiveConsultationId(null)
      } finally {
        setIsLoadingConsultations(false)
      }
    }
    load()
  }, [activePatientId])

  const activeConsultation = consultations.find((c) => c.id === activeConsultationId) || null

  const [mobileTab, setMobileTab] = useState<'patients' | 'transcript' | 'soap'>('patients')

  return (
    <DashboardLayout>
      {/* Mobile segmented view controller */}
      <nav className="md:hidden bg-surface-container-low dark:bg-slate-900 border-b border-outline-variant dark:border-slate-800 px-2 py-1.5 flex items-center gap-1 shrink-0 z-30">
        {([
          { key: 'patients', label: `Patients (${patients.length})` },
          { key: 'transcript', label: 'Transcript' },
          { key: 'soap', label: 'SOAP Note' },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setMobileTab(tab.key)}
            className={`flex-1 py-1.5 px-2 rounded text-[11px] font-label-sm font-semibold text-center transition-all ${
              mobileTab === tab.key
                ? 'bg-secondary dark:bg-emerald-600 text-white shadow-xs'
                : 'text-on-surface-variant dark:text-slate-300 hover:bg-surface-container-high dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="flex-1 flex overflow-hidden w-full bg-background dark:bg-slate-950 relative">
        {/* Column 1: Patient list */}
        <div className={`${mobileTab === 'patients' ? 'flex' : 'hidden'} md:flex`}>
          <PatientList
            patients={patients}
            activeId={activePatientId}
            onSelect={setActivePatientId}
            isLoading={isLoadingPatients}
          />
        </div>

        {/* Column 2: Transcript + summary */}
        <div className={`${mobileTab === 'transcript' ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-1/2 lg:w-5/12 xl:w-1/2 border-r border-outline-variant dark:border-slate-800 overflow-hidden`}>
          {isLoadingConsultations ? (
            <div className="flex-1 flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl text-secondary dark:text-emerald-400 animate-spin">progress_activity</span>
            </div>
          ) : !activePatientId ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <span className="material-symbols-outlined text-4xl text-outline dark:text-slate-500 block mb-2">person_search</span>
                <p className="text-sm text-on-surface-variant dark:text-slate-400">Select a patient to view their consultations</p>
              </div>
            </div>
          ) : consultations.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <span className="material-symbols-outlined text-4xl text-outline dark:text-slate-500 block mb-2">folder_off</span>
                <p className="text-sm text-on-surface-variant dark:text-slate-400">No consultations yet</p>
                <p className="text-xs text-outline dark:text-slate-500 mt-1">Start a recording to create the first consultation.</p>
              </div>
            </div>
          ) : (
            <>
              {activeConsultation && <PatientSummary consultation={activeConsultation} />}
              <div className="flex-1 overflow-hidden">
                <TranscriptFeed rawTranscript={activeConsultation?.rawTranscript} />
              </div>
            </>
          )}
        </div>

        {/* Column 3: SOAP note */}
        <div className={`${mobileTab === 'soap' ? 'flex' : 'hidden'} md:flex w-full md:w-1/2 lg:w-7/12 xl:w-1/2`}>
          {activeConsultation ? (
            <SoapNoteEditor consultation={activeConsultation} />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <span className="material-symbols-outlined text-4xl text-outline dark:text-slate-500 block mb-2">description</span>
                <p className="text-sm text-on-surface-variant dark:text-slate-400">Select a consultation to view the SOAP note</p>
              </div>
            </div>
          )}
        </div>
      </main>

      <ClinicalContextDrawer
        consultation={activeConsultation}
        isOpen={contextOpen}
        onClose={() => setContextOpen(false)}
      />
    </DashboardLayout>
  )
}
