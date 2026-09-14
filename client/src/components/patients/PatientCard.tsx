import type { PatientConsultation } from '@/types'
import Badge from '@/components/ui/Badge'

interface PatientCardProps {
  consultation: PatientConsultation
  isActive: boolean
  onClick: () => void
}

export default function PatientCard({ consultation, isActive, onClick }: PatientCardProps) {
  const initials = consultation.patientIdentifier
    ? consultation.patientIdentifier.slice(0, 2).toUpperCase()
    : 'PT'

  const priorityVariant = consultation.Priority === 'URGENT' ? 'review' : 'default'

  return (
    <div
      onClick={onClick}
      className={`p-2.5 rounded-lg cursor-pointer transition-all relative ${
        isActive
          ? 'border-2 border-secondary/40 dark:border-emerald-500/50 bg-secondary-container/20 dark:bg-emerald-950/30 shadow-xs'
          : consultation.Priority === 'URGENT'
          ? 'border border-error/30 dark:border-rose-900/50 bg-error-container/20 dark:bg-rose-950/20 hover:bg-error-container/30 dark:hover:bg-rose-950/30'
          : 'border border-outline-variant/70 dark:border-slate-800 bg-surface-container-lowest dark:bg-slate-900 hover:bg-surface-container-low/50 dark:hover:bg-slate-850'
      }`}
    >
      <div className="flex items-start justify-between gap-1">
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
              isActive
                ? 'bg-secondary-container dark:bg-emerald-900/60 text-on-secondary-container dark:text-emerald-300 ring-1 ring-secondary/40 dark:ring-emerald-500'
                : consultation.Priority === 'URGENT'
                ? 'bg-error-container dark:bg-rose-900/50 text-on-error-container dark:text-rose-300 ring-1 border-error/20'
                : 'bg-surface-container-high dark:bg-slate-800 text-on-surface dark:text-slate-200'
            }`}
          >
            {initials}
          </div>
          <div>
            <h3 className="text-body-sm font-headline-sm font-semibold text-on-surface dark:text-slate-200 leading-tight">
              {consultation.patientIdentifier || 'Unknown Patient'}
            </h3>
            <span className="text-[11px] font-label-sm text-outline dark:text-slate-400">
              {consultation.Priority}
            </span>
          </div>
        </div>
        <Badge variant={priorityVariant}>
          {consultation.Priority === 'URGENT' ? 'Review' : 'Signed'}
        </Badge>
      </div>

      <p className="text-[11px] text-on-surface-variant dark:text-slate-400 mt-2 font-medium">
        Consultation
      </p>

      <div className="flex items-center justify-between pt-2 mt-2 border-t border-outline-variant/40 dark:border-slate-800 text-[10px]">
        <span className="text-outline dark:text-slate-400 font-code-transcript">
          {new Date(consultation.createdAt).toLocaleDateString()}
        </span>
        <span className="text-outline dark:text-slate-400 font-medium flex items-center gap-0.5">
          <span className="material-symbols-outlined text-[12px] text-secondary dark:text-emerald-400">check_circle</span>
          Exported
        </span>
      </div>
    </div>
  )
}
