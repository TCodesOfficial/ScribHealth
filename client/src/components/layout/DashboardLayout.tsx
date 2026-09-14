import { useState, type ReactNode } from 'react'
import TopNav from './TopNav'
import Sidebar from './Sidebar'
import ClinicalContextDrawer from './ClinicalContextDrawer'
import MobileBottomNav from './MobileBottomNav'

interface DashboardLayoutProps {
  children: ReactNode
  showContextDrawer?: boolean
}

export default function DashboardLayout({ children, showContextDrawer = true }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [contextOpen, setContextOpen] = useState(false)

  const toggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(!sidebarOpen)
    } else {
      setSidebarCollapsed(!sidebarCollapsed)
    }
  }

  const closeSidebar = () => setSidebarOpen(false)
  const toggleContext = () => setContextOpen(!contextOpen)

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-background dark:bg-slate-950 transition-colors duration-200">
      <TopNav onMenuToggle={toggleSidebar} onContextToggle={toggleContext} />

      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar
          isOpen={sidebarOpen}
          isCollapsed={sidebarCollapsed}
          onToggle={toggleSidebar}
          onClose={closeSidebar}
        />

        <main className="flex-1 flex flex-col bg-background dark:bg-slate-950 overflow-y-auto min-w-0 transition-all duration-300 pb-20 md:pb-6">
          {children}
        </main>

        {showContextDrawer && (
          <ClinicalContextDrawer isOpen={contextOpen} onClose={() => setContextOpen(false)} />
        )}
      </div>

      <MobileBottomNav />
    </div>
  )
}
