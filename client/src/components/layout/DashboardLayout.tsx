import { useState, type ReactNode } from 'react'
import TopNav from './TopNav'
import Sidebar from './Sidebar'

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const toggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(!sidebarOpen)
    } else {
      setSidebarCollapsed(!sidebarCollapsed)
    }
  }

  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-background dark:bg-slate-950 transition-colors duration-200">
      <TopNav onMenuToggle={toggleSidebar} onContextToggle={() => {}} />

      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar
          isOpen={sidebarOpen}
          isCollapsed={sidebarCollapsed}
          onToggle={toggleSidebar}
          onClose={closeSidebar}
        />

        <main className="flex-1 flex flex-col bg-background dark:bg-slate-950 overflow-y-auto min-w-0 transition-all duration-300 pb-6">
          {children}

          {/* Developer footer */}
          <div className="mt-auto border-t border-slate-200 dark:border-slate-800 px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 shrink-0">
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 dark:text-slate-500">
              <span>
                Developed by <span className="font-semibold text-slate-500 dark:text-slate-400">Amadi Tobias</span>
              </span>
              <a
                href="mailto:amadiebube1@gmail.com"
                className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
              >
                amadiebube1@gmail.com
              </a>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
