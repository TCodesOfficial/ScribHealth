import { useState } from 'react'
import PatientCard from './PatientCard'
import type { Patient } from '@/types'

interface PatientListProps {
  patients: Patient[]
  activeId: string | null
  onSelect: (id: string) => void
  isLoading: boolean
}

export default function PatientList({ patients, activeId, onSelect, isLoading }: PatientListProps) {
  const [search, setSearch] = useState('')
  const patientArray = Array.isArray(patients) ? patients : []

  const filtered = patientArray.filter((p) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      p.firstName.toLowerCase().includes(q) ||
      p.lastName.toLowerCase().includes(q) ||
      p.mrn?.toLowerCase().includes(q)
    )
  })

  return (
    <section className="w-full md:w-72 lg:w-80 shrink-0 bg-surface-container-lowest dark:bg-slate-900 border-r border-outline-variant dark:border-slate-800 flex flex-col h-full overflow-hidden transition-colors">
      {/* Header */}
      <div className="p-3 border-b border-outline-variant dark:border-slate-800 space-y-2.5 shrink-0 bg-surface-container-low/20 dark:bg-slate-850">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-secondary dark:text-emerald-400 text-[18px]">patient_list</span>
            <h2 className="text-body-sm font-headline-sm font-bold text-on-surface dark:text-white">Patients Directory</h2>
          </div>
          <span className="text-[11px] font-label-sm px-2 py-0.5 rounded-full bg-surface-container-high dark:bg-slate-800 text-outline dark:text-slate-400 font-semibold border border-outline-variant/60 dark:border-slate-700">
            {patientArray.length} Patients
          </span>
        </div>

        {/* Search */}
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-2.5 text-outline dark:text-slate-400 text-[16px]">search</span>
          <input
            type="text"
            placeholder="Search name, MRN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-body-sm bg-surface-container-low dark:bg-slate-800 rounded border border-outline-variant dark:border-slate-700 text-on-surface dark:text-slate-200 placeholder:text-outline dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-secondary dark:focus:ring-emerald-500 text-[12px]"
          />
        </div>
      </div>

      {/* Patient list */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2 custom-scrollbar">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <span className="material-symbols-outlined text-3xl text-secondary dark:text-emerald-400 animate-spin block mb-2">progress_activity</span>
            <p className="text-xs text-on-surface-variant dark:text-slate-400">Loading patients...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <span className="material-symbols-outlined text-3xl text-outline dark:text-slate-500 block mb-2">person_off</span>
            <p className="text-xs text-on-surface-variant dark:text-slate-400">No patients found</p>
            <p className="text-[10px] text-outline dark:text-slate-500 mt-1">Start a recording to create your first patient.</p>
          </div>
        ) : (
          filtered.map((p) => (
            <PatientCard
              key={p.id}
              patient={p}
              isActive={p.id === activeId}
              onClick={() => onSelect(p.id)}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-2.5 border-t border-outline-variant dark:border-slate-800 bg-surface-container-low/30 dark:bg-slate-850 shrink-0 text-[11px] text-outline dark:text-slate-400">
        <span className="font-label-sm">Sorted by: Most Recent</span>
      </div>
    </section>
  )
}
