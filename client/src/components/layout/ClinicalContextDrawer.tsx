interface ClinicalContextDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export default function ClinicalContextDrawer({ isOpen, onClose }: ClinicalContextDrawerProps) {
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
          {/* Patient Demographics */}
          <div className="bg-surface-container-low/60 dark:bg-slate-800/50 rounded p-3.5 border border-outline-variant/60 dark:border-slate-700/60">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-headline-sm font-headline-sm font-bold text-on-surface dark:text-white">Amina Adeleke</h4>
                <p className="text-label-sm font-label-sm text-on-surface-variant dark:text-slate-400 mt-0.5">42 F &bull; DOB: 14-Aug-1982</p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-container-high dark:bg-slate-800 font-semibold text-on-surface dark:text-slate-200">
                MRN 9482-B
              </span>
            </div>
            <div className="mt-3 pt-2.5 border-t border-outline-variant/60 dark:border-slate-700/60 flex items-center justify-between text-label-sm font-label-sm text-on-surface-variant dark:text-slate-400">
              <span>Primary Lang: English / Igala</span>
              <span>Blood: O+</span>
            </div>
          </div>

          {/* Allergies */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-label-sm font-label-sm font-bold uppercase tracking-wider text-error dark:text-rose-400 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-error dark:text-rose-400">warning</span>
                Critical Allergies
              </span>
              <span className="text-[10px] font-mono text-error dark:text-rose-400 font-semibold">2 ACTIVE</span>
            </div>
            <div className="space-y-1.5">
              {[
                { name: 'Penicillin', severity: 'Severe Anaphylaxis' },
                { name: 'Sulfa Drugs', severity: 'Moderate Rash/Hives' },
              ].map((a) => (
                <div key={a.name} className="p-2 rounded bg-error-container/30 dark:bg-rose-950/40 border border-error/30 dark:border-rose-900/50 text-error dark:text-rose-300 flex items-center justify-between text-label-sm font-label-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">block</span>
                    <span className="font-semibold">{a.name}</span>
                  </div>
                  <span className="text-[11px] font-medium bg-surface-container-lowest dark:bg-slate-900 px-1.5 py-0.2 rounded border border-error/20 dark:border-rose-900/50">
                    {a.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Vitals */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-label-sm font-label-sm font-bold uppercase tracking-wider text-on-surface-variant dark:text-slate-400">
                Latest Vitals (Triage)
              </span>
              <span className="text-[10px] font-mono text-outline dark:text-slate-500">Today 08:45 AM</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Blood Pressure', value: '138/86', unit: 'mmHg', status: 'Stage 1', statusColor: 'text-secondary dark:text-emerald-400' },
                { label: 'Heart Rate', value: '78', unit: 'bpm', status: 'Regular', statusColor: 'text-on-tertiary-container dark:text-emerald-400' },
                { label: 'Pulse Oximetry', value: '98%', unit: 'SpO2', status: 'Room Air', statusColor: 'text-on-surface-variant dark:text-slate-400' },
                { label: 'Temp / BMI', value: '98.4°F', unit: 'Temp', status: 'BMI: 26.4', statusColor: 'text-on-surface-variant dark:text-slate-400' },
              ].map((v) => (
                <div key={v.label} className="p-2.5 rounded bg-surface-container-low dark:bg-slate-800/90 border border-outline-variant/60 dark:border-slate-700">
                  <div className="text-[11px] text-on-surface-variant dark:text-slate-400 font-label-sm font-medium">{v.label}</div>
                  <div className="text-title-md font-title-md font-bold text-on-surface dark:text-white mt-0.5">{v.value}</div>
                  <div className={`text-[10px] font-mono ${v.statusColor}`}>{v.status}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Encounter History */}
          <div className="border-t border-outline-variant/60 dark:border-slate-700/60 pt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-label-sm font-label-sm font-bold uppercase tracking-wider text-on-surface-variant dark:text-slate-400">
                Encounter History
              </span>
              <span className="material-symbols-outlined text-outline dark:text-slate-500 text-base">history</span>
            </div>
            <div className="p-2.5 rounded bg-surface-container-low/50 dark:bg-slate-800/50 border border-outline-variant/50 dark:border-slate-700/50 text-label-sm font-label-sm">
              <div className="flex items-center justify-between font-semibold text-on-surface dark:text-slate-200">
                <span>Hypertension Follow-up</span>
                <span className="text-[10px] font-mono text-on-surface-variant dark:text-slate-400">3 wks ago</span>
              </div>
              <p className="text-on-surface-variant dark:text-slate-400 text-xs mt-1 leading-normal">
                Started Lisinopril titration; EKG showed normal sinus rhythm with non-specific ST changes. Advised sodium restriction.
              </p>
            </div>
          </div>

          {/* Medications */}
          <div className="border-t border-outline-variant/60 dark:border-slate-700/60 pt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-label-sm font-label-sm font-bold uppercase tracking-wider text-on-surface-variant dark:text-slate-400">
                Active Prescriptions
              </span>
              <span className="text-[10px] font-mono bg-surface-container-high dark:bg-slate-800 px-1.5 py-0.2 rounded font-semibold text-on-surface dark:text-slate-200">2 MEDS</span>
            </div>
            <div className="space-y-2 text-label-sm font-label-sm">
              {[
                { name: 'Lisinopril 10mg PO Daily', desc: 'ACE Inhibitor &bull; Dispensed 30d refill' },
                { name: 'Metoprolol Succinate 25mg', desc: 'Beta Blocker &bull; PO Once Daily with food' },
              ].map((m) => (
                <div key={m.name} className="p-2 rounded bg-surface-container-low dark:bg-slate-800/90 border border-outline-variant/60 dark:border-slate-700 flex items-start gap-2">
                  <span className="material-symbols-outlined text-secondary dark:text-emerald-400 text-base mt-0.5">medication</span>
                  <div className="flex-1">
                    <div className="font-semibold text-on-surface dark:text-slate-200">{m.name}</div>
                    <div className="text-[11px] text-on-surface-variant dark:text-slate-400">{m.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Status */}
          <div className="p-3 bg-secondary-container/20 dark:bg-emerald-950/40 rounded border border-secondary/30 dark:border-emerald-600/30 flex items-center gap-3">
            <span className="material-symbols-outlined text-secondary dark:text-emerald-400 text-xl">psychology</span>
            <div className="flex-1 text-xs">
              <span className="font-semibold text-on-surface dark:text-slate-200 block">AI Background Parser Active</span>
              <span className="text-on-surface-variant dark:text-slate-400">Awaiting doctor pause or stop command to synthesize draft.</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
