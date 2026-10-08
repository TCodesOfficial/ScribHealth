import type { Patient } from '@/types'

interface PatientCardProps {
  patient: Patient
  isActive: boolean
  onClick: () => void
}

export default function PatientCard({ patient, isActive, onClick }: PatientCardProps) {
  const initials = `${patient.firstName[0] || ''}${patient.lastName[0] || ''}`.toUpperCase() || 'PT'

  const lastConsultation = patient.consultations?.[0]
  const consultationCount = patient._count?.consultations ?? 0

  return (
    <div
      onClick={onClick}
      className={`p-2.5 rounded-lg cursor-pointer transition-all relative ${
        isActive
          ? 'border-2 border-secondary/40 dark:border-emerald-500/50 bg-secondary-container/20 dark:bg-emerald-950/30 shadow-xs'
          : 'border border-outline-variant/70 dark:border-slate-800 bg-surface-container-lowest dark:bg-slate-900 hover:bg-surface-container-low/50 dark:hover:bg-slate-800'
      }`}
    >
      <div className="flex items-start justify-between gap-1">
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
              isActive
                ? 'bg-secondary-container dark:bg-emerald-900/60 text-on-secondary-container dark:text-emerald-300 ring-1 ring-secondary/40 dark:ring-emerald-500'
                : 'bg-secondary-container/40 dark:bg-emerald-900/40 text-on-secondary-container dark:text-emerald-300'
            }`}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <h3 className="text-body-sm font-headline-sm font-semibold text-on-surface dark:text-slate-200 leading-tight truncate">
              {patient.firstName} {patient.lastName}
            </h3>
            <div className="flex items-center gap-1.5 text-[11px] text-on-surface-variant dark:text-slate-400">
              {patient.mrn && <span className="font-mono">{patient.mrn}</span>}
              {patient.gender && <span>&bull; {patient.gender}</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 mt-2 border-t border-outline-variant/40 dark:border-slate-800 text-[10px]">
        <span className="text-on-surface-variant dark:text-slate-400 font-medium">
          {consultationCount} {consultationCount === 1 ? 'visit' : 'visits'}
        </span>
        {lastConsultation && (
          <span className="text-outline dark:text-slate-400 font-code-transcript">
            Last: {new Date(lastConsultation.createdAt).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  )
}
