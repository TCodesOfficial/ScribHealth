import type { PatientConsultation } from '@/types'

interface ClinicalContextDrawerProps {
  isOpen: boolean
  onClose: () => void
  consultation?: PatientConsultation | null
}

export default function ClinicalContextDrawer({ isOpen, onClose, consultation }: ClinicalContextDrawerProps) {
  const hasData = !!consultation

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 xl:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed xl:static inset-y-0 right-0 z-50 xl:z-auto w-80
          bg-surface-container-lowest dark:bg-slate-900
          border-l border-outline-variant dark:border-slate-800
          flex flex-col shrink-0 overflow-y-auto select-none
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full xl:translate-x-0'}
          shadow-2xl xl:shadow-none h-full
        `}
      >
        {/* Header */}
        <div className="p-4 border-b border-outline-variant dark:border-slate-800 bg-surface-container-low/50 dark:bg-slate-850 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-on-surface-variant dark:text-slate-400 text-lg">patient_list</span>
            <span className="text-label-md font-label-md font-bold text-on-surface dark:text-slate-200 uppercase tracking-wider">
              Clinical Context
            </span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-surface-container-high dark:hover:bg-slate-800 rounded text-on-surface-variant dark:text-slate-400 transition-colors">
            <span className="material-symbols-outlined text-lg">chevron_right</span>
          </button>
        </div>

        <div className="p-4 space-y-5">
          {!hasData ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <span className="material-symbols-outlined text-4xl text-outline dark:text-slate-500 block mb-2">
                health_and_safety
              </span>
              <p className="text-sm text-on-surface-variant dark:text-slate-400 font-medium">
                No consultation selected
              </p>
              <p className="text-xs text-outline dark:text-slate-500 mt-1">
                Start a recording or select a patient to view clinical context.
              </p>
            </div>
          ) : (
            <>
              {/* Patient Demographics */}
              <div className="bg-surface-container-low/60 dark:bg-slate-800/50 rounded p-3.5 border border-outline-variant/60 dark:border-slate-700/60">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-headline-sm font-headline-sm font-bold text-on-surface dark:text-white">
                      {consultation.patientIdentifier || 'Unknown Patient'}
                    </h4>
                    <p className="text-label-sm font-label-sm text-on-surface-variant dark:text-slate-400 mt-0.5">
                      {consultation.id.slice(0, 8)}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-container-high dark:bg-slate-800 font-semibold text-on-surface dark:text-slate-200">
                    {consultation.Priority}
                  </span>
                </div>
              </div>

              {/* SOAP Summary sections */}
              {[
                { label: 'Subjective', content: consultation.subjective, icon: 'person', color: 'text-secondary dark:text-emerald-400' },
                { label: 'Objective', content: consultation.objective, icon: 'clinical_notes', color: 'text-on-tertiary-container dark:text-emerald-400' },
                { label: 'Assessment', content: consultation.assessment, icon: 'diagnosis', color: 'text-secondary dark:text-emerald-400' },
                { label: 'Plan', content: consultation.plan, icon: 'rule', color: 'text-on-tertiary-container dark:text-emerald-400' },
              ].map((section) => (
                <div key={section.label} className="border-t border-outline-variant/60 dark:border-slate-700/60 pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-label-sm font-label-sm font-bold uppercase tracking-wider ${section.color} flex items-center gap-1`}>
                      <span className={`material-symbols-outlined text-sm ${section.color}`}>{section.icon}</span>
                      {section.label}
                    </span>
                  </div>
                  <div className="p-2.5 rounded bg-surface-container-low/50 dark:bg-slate-800/50 border border-outline-variant/50 dark:border-slate-700/50 text-label-sm font-label-sm text-on-surface dark:text-slate-200 leading-relaxed">
                    {section.content || 'Not documented'}
                  </div>
                </div>
              ))}

              {/* ICD-10 Codes */}
              {consultation.icd10Codes.length > 0 && (
                <div className="border-t border-outline-variant/60 dark:border-slate-700/60 pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-label-sm font-label-sm font-bold uppercase tracking-wider text-on-surface-variant dark:text-slate-400">
                      ICD-10 Codes
                    </span>
                    <span className="text-[10px] font-mono bg-surface-container-high dark:bg-slate-800 px-1.5 py-0.2 rounded font-semibold text-on-surface dark:text-slate-200">
                      {consultation.icd10Codes.length} CODES
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {consultation.icd10Codes.map((code) => (
                      <span key={code} className="px-2 py-0.5 rounded bg-surface-container-high dark:bg-slate-800 border border-outline-variant/60 dark:border-slate-700 text-[11px] font-mono text-on-surface dark:text-slate-200">
                        {code}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Status */}
              <div className="p-3 bg-secondary-container/20 dark:bg-emerald-950/40 rounded border border-secondary/30 dark:border-emerald-600/30 flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary dark:text-emerald-400 text-xl">psychology</span>
                <div className="flex-1 text-xs">
                  <span className="font-semibold text-on-surface dark:text-slate-200 block">AI Documentation Complete</span>
                  <span className="text-on-surface-variant dark:text-slate-400">SOAP note generated from consultation recording.</span>
                </div>
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  )
}
