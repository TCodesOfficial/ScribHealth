import { NavLink } from 'react-router-dom'

interface SidebarProps {
  isOpen: boolean
  isCollapsed: boolean
  onToggle: () => void
  onClose: () => void
}

const navItems = [
  { to: '/recording', icon: 'mic', label: 'Live Recording', activePulse: true },
  { to: '/patients', icon: 'folder_shared', label: 'Patient Directory' },
  { to: '/patients', icon: 'description', label: 'SOAP Notes Archive' },
]

export default function Sidebar({ isOpen, isCollapsed, onToggle, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
          bg-white dark:bg-slate-900
          border-r border-slate-200 dark:border-slate-800
          flex flex-col shrink-0 select-none
          transition-all duration-300 ease-in-out h-full
          ${isCollapsed ? 'lg:w-16' : 'lg:w-64'}
          w-64
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          shadow-2xl lg:shadow-none
        `}
      >
        {/* Header */}
        <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between overflow-hidden">
          <div className="flex items-center gap-2 min-w-0">
            <span className="material-symbols-outlined text-teal-600 dark:text-teal-400 text-[20px] shrink-0" title="MetroHealth General">
              local_hospital
            </span>
            {!isCollapsed && (
              <div className="min-w-0 truncate">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white leading-tight truncate">
                  MetroHealth General
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  Cardiology &bull; Room 402
                </p>
              </div>
            )}
          </div>
          <button
            onClick={onToggle}
            aria-label="Toggle Sidebar"
            className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors items-center justify-center shrink-0 ml-1"
          >
            <span className="material-symbols-outlined text-[19px]">
              {isCollapsed ? 'menu_open' : 'left_panel_close'}
            </span>
          </button>
          <button
            onClick={onClose}
            aria-label="Close Sidebar"
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-2 space-y-1.5 flex-1">
          {navItems.map((item, idx) => (
            <div key={idx} className="relative group">
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive && idx === 0
                      ? 'bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 font-semibold border-l-2 border-teal-600 dark:border-teal-400'
                      : isActive
                      ? 'bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 font-semibold border border-teal-200 dark:border-teal-800'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white font-medium'
                  }`
                }
              >
                <span className="material-symbols-outlined text-[20px] shrink-0">{item.icon}</span>
                {!isCollapsed && <span>{item.label}</span>}
                {item.activePulse && !isCollapsed && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-teal-500 dark:bg-teal-400 animate-pulse shrink-0" />
                )}
              </NavLink>
              {isCollapsed && (
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-[12px] font-medium rounded-lg shadow-md whitespace-nowrap hidden group-hover:block pointer-events-none z-50">
                  {item.label}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 space-y-3 bg-slate-50 dark:bg-slate-850/50">
          {!isCollapsed ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300">
              <span className="material-symbols-outlined text-[15px] text-teal-600 dark:text-teal-400">shield</span>
              <span className="text-[11px] font-semibold">HIPAA Shield Active</span>
            </div>
          ) : (
            <div className="relative group flex items-center justify-center p-2 rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-600 dark:text-teal-400 cursor-default">
              <span className="material-symbols-outlined text-[18px]">shield</span>
              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-[11px] font-medium rounded-lg shadow-md whitespace-nowrap hidden group-hover:block pointer-events-none z-50">
                HIPAA Shield Active
              </div>
            </div>
          )}

          {!isCollapsed ? (
            <a className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 flex items-center gap-1 pl-1 transition-colors" href="#">
              <span className="material-symbols-outlined text-[14px]">help_outline</span>
              Help & Support
            </a>
          ) : (
            <div className="relative group flex items-center justify-center p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-[18px]">help_outline</span>
              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-[11px] font-medium rounded-lg shadow-md whitespace-nowrap hidden group-hover:block pointer-events-none z-50">
                Help & Support
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
