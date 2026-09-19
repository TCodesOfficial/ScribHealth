import { useState } from 'react'
import type { PatientConsultation } from '@/types'
import patientService from '@/services/patient.service'
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
  const [firstName, setFirstName] = useState(patient?.firstName || '')
  const [lastName, setLastName] = useState(patient?.lastName || '')
  const [mrn, setMrn] = useState(patient?.mrn || '')
  const [gender, setGender] = useState(patient?.gender || '')
  const [phone, setPhone] = useState(patient?.phone || '')
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!patient) return
    setIsSaving(true)
    try {
      await patientService.updatePatient(patient.id, {
        firstName,
        lastName,
        mrn: mrn || undefined,
        gender: gender || undefined,
        phone: phone || undefined,
      })
      toast.success('Patient details updated successfully!')
      setIsEditing(false)
      if (onPatientUpdated) onPatientUpdated()
    } catch {
      toast.error('Failed to update patient details.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSignAndExport = () => {
    generateAndDownloadPdf(consultation)
    toast.success('Note signed and exported as PDF successfully!')
  }

  return (
    <div className="p-3.5 md:p-4 bg-surface-container-lowest dark:bg-slate-900 border-b border-outline-variant dark:border-slate-800 space-y-3 shrink-0 relative">
      {/* Top Floating Recommended Ward Badge */}
      {consultation.recommendedWard && (
        <div className="absolute top-3 right-3 md:right-4 z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 shadow-sm animate-pulse">
            <span className="material-symbols-outlined text-[16px]">local_hospital</span>
            Recommended Ward: {consultation.recommendedWard}
          </span>
        </div>
      )}

      <div className="flex items-start justify-between gap-2 pr-44">
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
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
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
      {isEditing && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-md:w-full max-w-md p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-teal-600 dark:text-teal-400">badge</span>
                Edit Patient Information
              </h3>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">MRN (Medical Record Number)</label>
                <input
                  type="text"
                  value={mrn}
                  onChange={(e) => setMrn(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Gender</label>
                <input
                  type="text"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  placeholder="Male, Female, Other"
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-teal-600 text-white hover:bg-teal-700 transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
