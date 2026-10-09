import { useState } from 'react'
import type { PatientConsultation } from '@/types'
import EditPatientModal from '@/components/patients/EditPatientModal'
import { generateAndDownloadPdf } from '@/lib/pdfExport'
import toast from 'react-hot-toast'

interface PatientSummaryProps {
  consultation: PatientConsultation
  onPatientUpdated?: () => void
}

export default function PatientSummary({ consultation, onPatientUpdated }: PatientSummaryProps) {
  const patient = consultation.patient
  const name = patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient'
  const isWalkIn = patient?.mrn?.startsWith('WALKIN-') || patient?.firstName === 'Walk-in'
  const walkInDate = patient?.createdAt ? new Date(patient.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : ''

  const [isEditing, setIsEditing] = useState(false)

  const handleSignAndExport = () => {
    generateAndDownloadPdf(consultation)
    toast.success('Note signed and exported as PDF successfully!')
  }

  return (
    <div className="p-3.5 md:p-4 bg-surface-container-lowest dark:bg-slate-900 border-b border-outline-variant dark:border-slate-800 space-y-3 shrink-0 relative">
      {/* Top Floating Recommended Ward Badge */}
      {consultation.recommendedWard && (
        <div className="flex justify-end mb-1 sm:absolute sm:top-3 sm:right-3 md:right-4 sm:mb-0 z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 shadow-sm animate-pulse">
            <span className="material-symbols-outlined text-[16px]">local_hospital</span>
            Recommended Ward: {consultation.recommendedWard}
          </span>
        </div>
      )}

      <div className="flex items-start justify-between gap-2 sm:pr-44">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-title-md md:text-headline-sm font-headline-sm font-bold text-on-surface dark:text-white">
              {name}
            </h2>
            {isWalkIn && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                Walk-in &bull; {walkInDate}
              </span>
            )}
            {consultation.Priority && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-label-sm font-semibold bg-secondary-container/50 dark:bg-emerald-950/60 text-on-secondary-container dark:text-emerald-300 border border-secondary/30 dark:border-emerald-600/40">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary dark:bg-emerald-500" />
                {consultation.Priority} Priority
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-label-sm text-outline dark:text-slate-400 mt-0.5">
            {patient?.mrn && <span className="font-mono">MRN: {patient.mrn}</span>}
            {patient?.gender && <span>&bull; {patient.gender}</span>}
            {patient?.phone && <span>&bull; {patient.phone}</span>}
          </div>
        </div>
      </div>

      {/* Quick Actions & Badges */}
      <div className="flex flex-wrap items-center justify-center sm:justify-between gap-2 pt-1">
        <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
          <span className="px-2 py-0.5 rounded text-[11px] font-label-sm bg-surface-container-high dark:bg-slate-800 text-on-surface dark:text-slate-200 border border-outline-variant/60 dark:border-slate-700 flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px] text-secondary dark:text-emerald-400">favorite</span>
            Priority: {consultation.Priority}
          </span>
          <span className="px-2 py-0.5 rounded text-[11px] font-label-sm bg-surface-container-high dark:bg-slate-800 text-on-surface dark:text-slate-200 border border-outline-variant/60 dark:border-slate-700">
            {consultation.icd10Codes.length} ICD-10 Codes
          </span>
        </div>

        <div className="flex items-center gap-2">
          {patient && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-2.5 py-1 rounded bg-surface-container-high dark:bg-slate-800 text-on-surface dark:text-slate-200 hover:bg-surface-container-highest dark:hover:bg-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors border border-outline-variant/60 dark:border-slate-700"
            >
              <span className="material-symbols-outlined text-[14px]">edit</span>
              Edit Patient Data
            </button>
          )}
          <button
            onClick={handleSignAndExport}
            className="px-3 py-1 rounded bg-secondary dark:bg-emerald-600 text-white hover:bg-secondary/90 dark:hover:bg-emerald-500 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
          >
            <span className="material-symbols-outlined text-[14px]">lock</span>
            Sign & Export Note
          </button>
        </div>
      </div>

      {/* Edit Patient Modal */}
      {isEditing && patient && (
        <EditPatientModal
          patient={patient}
          onClose={() => setIsEditing(false)}
          onUpdated={onPatientUpdated}
        />
      )}
    </div>
  )
}
