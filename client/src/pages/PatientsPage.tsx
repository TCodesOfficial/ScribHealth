import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import PatientList from '@/components/patients/PatientList'
import PatientSummary from '@/components/patients/PatientSummary'
import TranscriptFeed from '@/components/recording/TranscriptFeed'
import SoapNoteEditor from '@/components/soap/SoapNoteEditor'
import consultationService from '@/services/consultation.service'
import type { PatientConsultation } from '@/types'

export default function PatientsPage() {
  const [consultations, setConsultations] = useState<PatientConsultation[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await consultationService.getHistory()
        setConsultations(data)
        if (data.length > 0) setActiveId(data[0].id)
      } catch {
        // silent fail - show empty state
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const activeConsultation = consultations.find((c) => c.id === activeId) || null

  // Mobile tab state
  const [mobileTab, setMobileTab] = useState<'patients' | 'transcript' | 'soap'>('patients')

  return (
    <DashboardLayout showContextDrawer={false}>
      {/* Mobile segmented view controller */}
      <nav className="md:hidden bg-surface-container-low dark:bg-slate-900 border-b border-outline-variant dark:border-slate-800 px-2 py-1.5 flex items-center gap-1 shrink-0 z-30">
        {([
          { key: 'patients', label: `Patients (${consultations.length})` },
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
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <span className="material-symbols-outlined text-4xl text-secondary dark:text-emerald-400 animate-spin block mb-2">progress_activity</span>
              <p className="text-sm text-on-surface-variant dark:text-slate-400">Loading consultations...</p>
            </div>
          </div>
        ) : consultations.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <span className="material-symbols-outlined text-4xl text-outline dark:text-slate-500 block mb-2">folder_off</span>
              <p className="text-sm text-on-surface-variant dark:text-slate-400">No consultations yet</p>
              <p className="text-xs text-outline dark:text-slate-500 mt-1">Start a recording to create your first consultation.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Column 1: Patient list */}
            <div className={`${mobileTab === 'patients' ? 'flex' : 'hidden'} md:flex`}>
              <PatientList
                consultations={consultations}
                activeId={activeId}
                onSelect={setActiveId}
              />
            </div>

            {/* Column 2: Transcript + summary */}
            <div className={`${mobileTab === 'transcript' ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-1/2 lg:w-5/12 xl:w-1/2 border-r border-outline-variant dark:border-slate-800 overflow-hidden`}>
              {activeConsultation && <PatientSummary consultation={activeConsultation} />}
              <div className="flex-1 overflow-hidden">
                <TranscriptFeed />
              </div>
            </div>

            {/* Column 3: SOAP note */}
            <div className={`${mobileTab === 'soap' ? 'flex' : 'hidden'} md:flex w-full md:w-1/2 lg:w-7/12 xl:w-1/2`}>
              {activeConsultation && <SoapNoteEditor consultation={activeConsultation} />}
            </div>
          </>
        )}
      </main>
    </DashboardLayout>
  )
}
