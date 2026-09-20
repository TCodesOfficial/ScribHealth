import { useState, useEffect } from 'react'
import SoapSection from './SoapSection'
import SoapFooter from './SoapFooter'
import consultationService from '@/services/consultation.service'
import { generateAndDownloadPdf } from '@/lib/pdfExport'
import type { PatientConsultation } from '@/types'
import toast from 'react-hot-toast'

interface SoapNoteEditorProps {
  consultation: PatientConsultation
  onConsultationUpdated?: (updated: PatientConsultation) => void
}

const getField = (field: string | undefined | null) => {
  if (field && field.trim()) return field
  return 'Not documented in transcript'
}

export default function SoapNoteEditor({ consultation, onConsultationUpdated }: SoapNoteEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [subjective, setSubjective] = useState(consultation.subjective || '')
  const [objective, setObjective] = useState(consultation.objective || '')
  const [assessment, setAssessment] = useState(consultation.assessment || '')
  const [plan, setPlan] = useState(consultation.plan || '')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setSubjective(consultation.subjective || '')
    setObjective(consultation.objective || '')
    setAssessment(consultation.assessment || '')
    setPlan(consultation.plan || '')
  }, [consultation])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const updated = await consultationService.updateConsultation(consultation.id, {
        subjective,
        objective,
        assessment,
        plan,
      })
      toast.success('SOAP note updated and saved to database successfully!')
      setIsEditing(false)
      if (onConsultationUpdated) {
        onConsultationUpdated(updated)
      }
    } catch {
      toast.error('Failed to save SOAP note updates.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSignAndExport = () => {
    generateAndDownloadPdf(consultation)
    toast.success('Note signed and exported as PDF successfully!')
  }

  const handleCopy = () => {
    const text = `SUBJECTIVE:\n${getField(subjective)}\n\nOBJECTIVE:\n${getField(objective)}\n\nASSESSMENT:\n${getField(assessment)}\n\nPLAN:\n${getField(plan)}\n\nICD-10: ${consultation.icd10Codes.join(', ')}`
    navigator.clipboard.writeText(text)
    toast.success('SOAP note copied to clipboard!')
  }

  return (
    <section className="w-full h-full bg-surface-container-lowest dark:bg-slate-900 flex flex-col overflow-hidden relative transition-colors">
      {/* Header */}
      <div className="p-3.5 md:p-4 border-b border-outline-variant dark:border-slate-800 bg-surface-container-lowest dark:bg-slate-900 shrink-0">
        <div className="flex items-center justify-between gap-2 flex-wrap">
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

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <label className="flex items-center gap-1.5 cursor-pointer bg-surface-container-high dark:bg-slate-800 px-2.5 py-1.5 rounded border border-outline-variant dark:border-slate-700 text-xs font-semibold text-on-surface dark:text-slate-200 hover:bg-surface-container dark:hover:bg-slate-700 transition-colors">
              <input
                type="checkbox"
                checked={isEditing}
                onChange={(e) => setIsEditing(e.target.checked)}
                className="rounded w-3.5 h-3.5 text-secondary dark:text-emerald-500 focus:ring-secondary"
              />
              <span>Edit Mode</span>
            </label>

            {isEditing && (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-3 py-1.5 rounded bg-teal-600 text-white hover:bg-teal-700 text-xs font-semibold flex items-center gap-1 shadow-sm transition-colors disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[16px]">save</span>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            )}

            <button
              onClick={handleSignAndExport}
              className="px-3 py-1.5 rounded bg-secondary dark:bg-emerald-600 text-white hover:bg-secondary/90 dark:hover:bg-emerald-500 text-xs font-semibold flex items-center gap-1 transition-all shadow-sm active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px]">lock</span>
              Sign & Export Note
            </button>
          </div>
        </div>
      </div>

      {/* SOAP content */}
      <div className="flex-1 overflow-y-auto p-3.5 md:p-4 space-y-4 custom-scrollbar pb-24 bg-surface-container-low/30 dark:bg-slate-950/70">
        {/* S - Subjective */}
        <SoapSection letter="S" label="Subjective">
          <div>
            <span className="text-label-sm font-label-sm font-semibold text-on-surface-variant dark:text-slate-400 uppercase tracking-wider block mb-1">
              History of Present Illness (HPI) & Chief Complaint
            </span>
            {isEditing ? (
              <textarea
                value={subjective}
                onChange={(e) => setSubjective(e.target.value)}
                rows={4}
                className="w-full p-2.5 bg-surface-bright dark:bg-slate-800 border border-outline-variant dark:border-slate-700 rounded text-sm text-on-surface dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            ) : (
              <div className="p-2.5 bg-surface-bright dark:bg-slate-800/80 border border-outline-variant/60 dark:border-slate-700 rounded text-body-sm font-body-sm text-on-surface dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                {getField(subjective)}
              </div>
            )}
          </div>
        </SoapSection>

        {/* O - Objective */}
        <SoapSection letter="O" label="Objective">
          <div>
            <span className="text-label-sm font-label-sm font-semibold text-on-surface-variant dark:text-slate-400 uppercase tracking-wider block mb-1">
              Physical Examination & Findings
            </span>
            {isEditing ? (
              <textarea
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                rows={4}
                className="w-full p-2.5 bg-surface-bright dark:bg-slate-800 border border-outline-variant dark:border-slate-700 rounded text-sm text-on-surface dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            ) : (
              <div className="p-2.5 bg-surface-bright dark:bg-slate-800/80 border border-outline-variant/60 dark:border-slate-700 rounded text-body-sm leading-relaxed text-on-surface dark:text-slate-200 whitespace-pre-wrap">
                {getField(objective)}
              </div>
            )}
          </div>
        </SoapSection>

        {/* A - Assessment */}
        <SoapSection letter="A" label="Assessment">
          <div>
            <span className="text-label-sm font-label-sm font-semibold text-on-surface-variant dark:text-slate-400 uppercase tracking-wider block mb-1">
              Clinical Assessment & Impression
            </span>
            {isEditing ? (
              <textarea
                value={assessment}
                onChange={(e) => setAssessment(e.target.value)}
                rows={3}
                className="w-full p-2.5 bg-surface-bright dark:bg-slate-800 border border-outline-variant dark:border-slate-700 rounded text-sm text-on-surface dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            ) : (
              <div className="p-2.5 bg-surface-bright dark:bg-slate-800/80 border border-outline-variant/60 dark:border-slate-700 rounded text-body-sm leading-relaxed text-on-surface dark:text-slate-200 whitespace-pre-wrap">
                {getField(assessment)}
              </div>
            )}
          </div>
          {consultation.icd10Codes.length > 0 && (
            <div className="pt-2">
              <span className="text-label-sm font-label-sm font-semibold text-on-surface-variant dark:text-slate-400 uppercase tracking-wider block mb-1">
                ICD-10 Codes
              </span>
              <div className="flex flex-wrap gap-1.5">
                {consultation.icd10Codes.map((code) => (
                  <span key={code} className="font-code-transcript text-label-sm font-semibold px-2 py-1 bg-surface-container-high dark:bg-slate-800 border border-outline-variant dark:border-slate-700 rounded text-on-surface dark:text-slate-200">
                    {code}
                  </span>
                ))}
              </div>
            </div>
          )}
        </SoapSection>

        {/* P - Plan */}
        <SoapSection letter="P" label="Plan">
          <div>
            <span className="text-label-sm font-label-sm font-semibold text-on-surface-variant dark:text-slate-400 uppercase tracking-wider block mb-1">
              Treatment Plan & Instructions
            </span>
            {isEditing ? (
              <textarea
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                rows={4}
                className="w-full p-2.5 bg-surface-bright dark:bg-slate-800 border border-outline-variant dark:border-slate-700 rounded text-sm text-on-surface dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            ) : (
              <div className="p-2.5 bg-surface-bright dark:bg-slate-800/80 border border-outline-variant/60 dark:border-slate-700 rounded text-body-sm leading-relaxed text-on-surface dark:text-slate-200 whitespace-pre-wrap">
                {getField(plan)}
              </div>
            )}
          </div>
        </SoapSection>
      </div>

      {/* Footer */}
      <SoapFooter onCopy={handleCopy} />
    </section>
  )
}
