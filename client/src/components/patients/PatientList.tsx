import { useState } from 'react'
import PatientCard from './PatientCard'
import type { PatientConsultation } from '@/types'

interface PatientListProps {
  consultations: PatientConsultation[]
  activeId: string | null
  onSelect: (id: string) => void
}

type FilterTab = 'all' | 'recent' | 'urgent'

export default function PatientList({ consultations, activeId, onSelect }: PatientListProps) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterTab>('all')

  const filtered = consultations.filter((c) => {
    const matchesSearch =
      !search ||
      c.patientIdentifier?.toLowerCase().includes(search.toLowerCase()) ||
      c.icd10Codes.some((code) => code.toLowerCase().includes(search.toLowerCase()))

    if (filter === 'recent') {
      const threeDaysAgo = new Date()
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
      return matchesSearch && new Date(c.createdAt) >= threeDaysAgo
    }
    if (filter === 'urgent') {
      return matchesSearch && c.Priority === 'URGENT'
    }
    return matchesSearch
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
            {consultations.length} Records
          </span>
        </div>

        {/* Search */}
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-2.5 text-outline dark:text-slate-400 text-[16px]">search</span>
          <input
            type="text"
            placeholder="Search name, MRN, dx..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-12 py-1.5 text-body-sm bg-surface-container-low dark:bg-slate-800 rounded border border-outline-variant dark:border-slate-700 text-on-surface dark:text-slate-200 placeholder:text-outline dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-secondary dark:focus:ring-emerald-500 text-[12px]"
          />
          <span className="absolute right-2 px-1.5 py-0.5 text-[9px] font-code-transcript font-semibold rounded bg-surface-container-high dark:bg-slate-700 text-outline dark:text-slate-300 border border-outline-variant/60 dark:border-slate-600">
            ⌘K
          </span>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar pb-0.5">
          {([
            { key: 'all', label: `All (${consultations.length})` },
            { key: 'urgent', label: `Urgent (${consultations.filter((c) => c.Priority === 'URGENT').length})` },
            { key: 'recent', label: 'Recent' },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-2 py-0.5 rounded-full text-[11px] font-label-sm font-semibold whitespace-nowrap transition-all ${
                filter === tab.key
                  ? 'bg-secondary dark:bg-emerald-600 text-on-secondary shadow-xs'
                  : 'bg-surface-container-high dark:bg-slate-800 text-on-surface-variant dark:text-slate-400 hover:text-on-surface dark:hover:text-white border border-outline-variant/60 dark:border-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Patient list */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2 custom-scrollbar">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-on-surface-variant dark:text-slate-400 text-sm">
            No patients found
          </div>
        ) : (
          filtered.map((c) => (
            <PatientCard
              key={c.id}
              consultation={c}
              isActive={c.id === activeId}
              onClick={() => onSelect(c.id)}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-2.5 border-t border-outline-variant dark:border-slate-800 bg-surface-container-low/30 dark:bg-slate-850 shrink-0 flex items-center justify-between text-[11px] text-outline dark:text-slate-400">
        <span className="font-label-sm">Sorted by: Most Recent</span>
        <button className="hover:text-on-surface dark:hover:text-white font-semibold text-secondary dark:text-emerald-400 flex items-center gap-0.5">
          <span className="material-symbols-outlined text-[13px]">tune</span>Filters
        </button>
      </div>
    </section>
  )
}
