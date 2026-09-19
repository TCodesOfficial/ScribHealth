import SoapSection from './SoapSection'
import SoapFooter from './SoapFooter'
import type { PatientConsultation } from '@/types'

interface SoapNoteEditorProps {
  consultation: PatientConsultation
}

const getField = (field: string | undefined | null) => {
  if (field && field.trim()) return field
  return 'Not documented in transcript'
}

export default function SoapNoteEditor({ consultation }: SoapNoteEditorProps) {
  const handleCopy = () => {
    const text = `SUBJECTIVE:\n${getField(consultation.subjective)}\n\nOBJECTIVE:\n${getField(consultation.objective)}\n\nASSESSMENT:\n${getField(consultation.assessment)}\n\nPLAN:\n${getField(consultation.plan)}\n\nICD-10: ${consultation.icd10Codes.join(', ')}`
    navigator.clipboard.writeText(text)
  }

  return (
    <section className="w-full h-full bg-surface-container-lowest dark:bg-slate-900 flex flex-col overflow-hidden relative transition-colors">
      {/* Header */}
      <div className="p-3.5 md:p-4 border-b border-outline-variant dark:border-slate-800 bg-surface-container-lowest dark:bg-slate-900 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-title-md md:text-headline-sm font-headline-sm font-bold text-on-surface dark:text-white">
                Clinical Documentation
              </h2>
              <span className="text-label-sm font-label-sm text-outline dark:text-slate-400 hidden sm:inline">
                &middot; Encounter #{consultation.id.slice(0, 8)}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-secondary-container/40 dark:bg-emerald-950/60 text-on-secondary-container dark:text-emerald-300 text-[11px] font-label-sm font-semibold">
                <span className="material-symbols-outlined text-[13px]">auto_awesome</span>
                AI Generated
              </span>
              <span className="text-outline dark:text-slate-500">&middot;</span>
              <span className="text-[11px] text-outline dark:text-slate-400 font-medium">Confidence: 99.4%</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <label className="flex items-center gap-1.5 cursor-pointer bg-surface-container-high dark:bg-slate-800 px-2.5 py-1 rounded border border-outline-variant dark:border-slate-700 text-label-sm font-label-sm font-medium text-on-surface dark:text-slate-200 hover:bg-surface-container dark:hover:bg-slate-700 transition-colors">
              <input type="checkbox" defaultChecked className="rounded w-3.5 h-3.5 text-secondary dark:text-emerald-500 focus:ring-secondary" />
              <span className="hidden sm:inline">Edit Mode</span>
            </label>
            <button className="p-1.5 rounded hover:bg-surface-container-high dark:hover:bg-slate-800 text-outline dark:text-slate-400 hover:text-on-surface dark:hover:text-white transition-colors" title="Fullscreen">
              <span className="material-symbols-outlined text-[18px]">open_in_full</span>
            </button>
          </div>
        </div>
      </div>

      {/* SOAP content */}
      <div className="flex-1 overflow-y-auto p-3.5 md:p-4 space-y-4 custom-scrollbar pb-24 bg-surface-container-low/30 dark:bg-slate-950/70">
        {/* S - Subjective */}
        <SoapSection
          letter="S"
          label="Subjective"
          rightAction={
            <button className="text-[11px] font-label-sm text-secondary dark:text-emerald-400 hover:underline flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[13px]">replay</span>
              Regen Section
            </button>
          }
        >
          <div>
            <span className="text-label-sm font-label-sm font-semibold text-on-surface-variant dark:text-slate-400 uppercase tracking-wider block mb-1">
              Chief Complaint
            </span>
            <div className="p-2.5 bg-surface-bright dark:bg-slate-800/80 border border-outline-variant/60 dark:border-slate-700 rounded text-body-sm font-body-sm text-on-surface dark:text-slate-200">
              {getField(consultation.subjective.split('\n')[0])}
            </div>
          </div>
          <div>
            <span className="text-label-sm font-label-sm font-semibold text-on-surface-variant dark:text-slate-400 uppercase tracking-wider block mb-1">
              History of Present Illness (HPI)
            </span>
            <div className="p-2.5 bg-surface-bright dark:bg-slate-800/80 border border-outline-variant/60 dark:border-slate-700 rounded text-body-sm font-body-sm text-on-surface dark:text-slate-200 leading-relaxed">
              {getField(consultation.subjective)}
            </div>
          </div>
        </SoapSection>

{/* O - Objective */}
        <SoapSection
          letter="O"
          label="Objective"
          rightAction={
            <span className="text-[11px] font-code-transcript text-outline dark:text-slate-500">Telemetry Synced</span>
          }
        >
          <div>
            <span className="text-label-sm font-label-sm font-semibold text-on-surface-variant dark:text-slate-400 uppercase tracking-wider block mb-1">
              Physical Examination & Findings
            </span>
            <div className="p-2.5 bg-surface-bright dark:bg-slate-800/80 border border-outline-variant/60 dark:border-slate-700 rounded text-body-sm leading-relaxed text-on-surface dark:text-slate-200">
              {getField(consultation.objective)}
            </div>
          </div>
        </SoapSection>

        {/* A - Assessment */}
        <SoapSection
          letter="A"
          label="Assessment"
          rightAction={
            <span className="text-label-sm font-label-sm text-secondary dark:text-emerald-400 font-semibold">ICD-10 Code Mapped</span>
          }
        >
          <div className="p-2.5 rounded border border-outline-variant dark:border-slate-700 bg-surface-bright dark:bg-slate-800/80 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-label-sm font-label-sm font-bold text-secondary dark:text-emerald-400 uppercase">Primary</span>
                <span className="text-body-sm font-headline-sm font-semibold text-on-surface dark:text-slate-200">Clinical Assessment</span>
              </div>
              <p className="text-[12px] text-on-surface-variant dark:text-slate-400 mt-0.5">
                {getField(consultation.assessment)}
              </p>
            </div>
          </div>
          {consultation.icd10Codes.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {consultation.icd10Codes.map((code) => (
                <span key={code} className="font-code-transcript text-label-sm font-semibold px-2 py-1 bg-surface-container-high dark:bg-slate-800 border border-outline-variant dark:border-slate-700 rounded text-on-surface dark:text-slate-200">
                  {code}
                </span>
              ))}
            </div>
          )}
        </SoapSection>

{/* P - Plan */}
        <SoapSection
          letter="P"
          label="Plan"
          rightAction={
            <span className="text-[11px] font-label-sm text-outline dark:text-slate-500">Protocol</span>
          }
        >
          <div>
            <span className="text-label-sm font-label-sm font-semibold text-on-surface-variant dark:text-slate-400 uppercase tracking-wider block mb-1">
              Treatment Plan & Instructions
            </span>
            <div className="p-2.5 bg-surface-bright dark:bg-slate-800/80 border border-outline-variant/60 dark:border-slate-700 rounded text-body-sm leading-relaxed text-on-surface dark:text-slate-200">
              {getField(consultation.plan)}
            </div>
          </div>
        </SoapSection>
      </div>

      {/* Footer */}
      <SoapFooter onCopy={handleCopy} />
    </section>
  )
}
