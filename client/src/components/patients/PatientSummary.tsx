import type { PatientConsultation } from '@/types'

interface PatientSummaryProps {
  consultation: PatientConsultation
}

export default function PatientSummary({ consultation }: PatientSummaryProps) {
  const name = consultation.patientIdentifier || 'Unknown Patient'

  return (
    <div className="p-3.5 md:p-4 bg-surface-container-lowest dark:bg-slate-900 border-b border-outline-variant dark:border-slate-800 space-y-2.5 md:space-y-3 shrink-0">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-title-md md:text-headline-sm font-headline-sm font-bold text-on-surface dark:text-white">
              {name}
            </h2>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-label-sm font-semibold bg-secondary-container/50 dark:bg-emerald-950/60 text-on-secondary-container dark:text-emerald-300 border border-secondary/30 dark:border-emerald-600/40">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary dark:bg-emerald-500 animate-pulse" />
              Encounter In-Progress
            </span>
          </div>
          <p className="text-label-sm text-outline dark:text-slate-400 mt-0.5">
            Cardiology Outpatient Consultation
          </p>
        </div>
        <span className="text-[11px] font-code-transcript text-outline dark:text-slate-400 bg-surface-container-high dark:bg-slate-800 px-2 py-1 rounded border border-outline-variant/60 dark:border-slate-700 shrink-0">
          #{consultation.id.slice(0, 8)}
        </span>
      </div>

      {/* Quick badges */}
      <div className="flex flex-wrap items-center gap-1.5 md:gap-2 pt-0.5">
        <span className="px-2 py-0.5 rounded text-[11px] font-label-sm bg-surface-container-high dark:bg-slate-800 text-on-surface dark:text-slate-200 border border-outline-variant/60 dark:border-slate-700 flex items-center gap-1">
          <span className="material-symbols-outlined text-[13px] text-secondary dark:text-emerald-400">favorite</span>
          Priority: {consultation.Priority}
        </span>
        <span className="px-2 py-0.5 rounded text-[11px] font-label-sm bg-surface-container-high dark:bg-slate-800 text-on-surface dark:text-slate-200 border border-outline-variant/60 dark:border-slate-700">
          {consultation.icd10Codes.length} ICD-10 Codes
        </span>
      </div>
    </div>
  )
}
