import { NavLink } from 'react-router-dom'

const items = [
  { to: '/recording', icon: 'mic', label: 'Record' },
  { to: '/patients', icon: 'folder_shared', label: 'Patients' },
  { to: '/patients', icon: 'vital_signs', label: 'Context' },
  { to: '/patients', icon: 'clinical_notes', label: 'Notes' },
]

export default function MobileBottomNav() {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-container-lowest dark:bg-slate-900 border-t border-outline-variant dark:border-slate-800 z-30 px-3 py-2 flex items-center justify-around shadow-lg">
      {items.map((item, idx) => (
        <NavLink
          key={idx}
          to={item.to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 transition-colors ${
              isActive && idx === 0
                ? 'text-secondary dark:text-emerald-400 font-semibold'
                : isActive
                ? 'text-secondary dark:text-emerald-400'
                : 'text-on-surface-variant dark:text-slate-400 hover:text-on-surface dark:hover:text-white'
            }`
          }
        >
          <span className="material-symbols-outlined text-xl">{item.icon}</span>
          <span className="text-[10px]">{item.label}</span>
        </NavLink>
      ))}
    </div>
  )
}
