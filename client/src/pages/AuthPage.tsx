import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import BrandPanel from '@/components/auth/BrandPanel'
import LoginForm from '@/components/auth/LoginForm'
import SignupForm from '@/components/auth/SignupForm'
import ThemeToggle from '@/components/ui/ThemeToggle'

const particles = [
  { size: 'sm', left: '10%', delay: '0s', duration: '18s' },
  { size: 'md', left: '20%', delay: '3s', duration: '22s' },
  { size: 'sm', left: '35%', delay: '7s', duration: '16s' },
  { size: 'lg', left: '45%', delay: '1s', duration: '25s' },
  { size: 'sm', left: '55%', delay: '5s', duration: '20s' },
  { size: 'md', left: '65%', delay: '9s', duration: '19s' },
  { size: 'sm', left: '75%', delay: '2s', duration: '23s' },
  { size: 'lg', left: '85%', delay: '6s', duration: '17s' },
  { size: 'sm', left: '15%', delay: '11s', duration: '21s' },
  { size: 'md', left: '50%', delay: '4s', duration: '24s' },
  { size: 'sm', left: '90%', delay: '8s', duration: '18s' },
  { size: 'sm', left: '30%', delay: '10s', duration: '20s' },
]

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin')
  const { login, signup } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (email: string, password: string) => {
    await login(email, password)
    navigate('/recording')
  }

  const handleSignup = async (email: string, password: string, name: string, location?: string) => {
    await signup(email, password, name, location)
    navigate('/recording')
  }

  return (
    <main className="animated-gradient-bg antialiased h-screen flex flex-col font-body-md relative overflow-hidden transition-colors duration-500">
      {/* Animated particles */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {particles.map((p, i) => (
          <div
            key={i}
            className={`particle particle-${p.size}`}
            style={{
              left: p.left,
              bottom: '-10px',
              animationDelay: p.delay,
              animationDuration: p.duration,
            }}
          />
        ))}
      </div>

      {/* Ambient glow effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-24 -left-20 w-[600px] h-[600px] rounded-full bg-teal-500/15 blur-[130px]" />
        <div className="absolute top-1/4 right-0 w-[700px] h-[700px] rounded-full bg-emerald-500/10 blur-[150px]" />
        <div className="absolute -bottom-28 left-1/3 w-[650px] h-[650px] rounded-full bg-cyan-500/10 blur-[140px]" />
      </div>

      <div className="flex-1 w-full h-full grid grid-cols-1 lg:grid-cols-12 relative z-10">
        {/* Left: Brand Panel */}
        <BrandPanel />

        {/* Right: Auth Form */}
        <section className="lg:col-span-7 bg-transparent flex flex-col p-4 sm:p-6 md:p-8 lg:p-12 overflow-hidden">
          {/* Top bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 sm:pb-4 mb-3 sm:mb-4 border-b border-slate-200/30 dark:border-white/15 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-slate-200/50 dark:bg-white/10 backdrop-blur-md flex items-center justify-center text-teal-600 dark:text-teal-300 border border-slate-300/50 dark:border-white/15">
                <span className="material-symbols-outlined text-lg">local_hospital</span>
              </div>
              <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                MetroHealth Portal
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-2.5 ml-auto">
              <ThemeToggle />
              <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-400/25 backdrop-blur-md shadow-sm whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-ping" />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 -ml-2.5" />
                Secure Workspace
              </div>
            </div>
          </div>

          {/* Auth card — centered, fixed width */}
          <div className="flex-1 flex items-center justify-center min-h-0">
            <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 sm:p-7 lg:p-8 relative max-h-[calc(100vh-10rem)] overflow-y-auto">
              {/* Top accent */}
              <div className="absolute -top-px left-8 right-8 sm:left-10 sm:right-10 h-[2px] bg-gradient-to-r from-transparent via-teal-500 to-transparent" />

              {/* Tabs */}
              <div className="p-1 bg-slate-100 rounded-xl flex items-center mb-5">
                <button
                  onClick={() => setActiveTab('signin')}
                  className={`flex-1 py-2.5 text-center rounded-lg text-sm font-semibold transition-all duration-200 ${
                    activeTab === 'signin'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setActiveTab('signup')}
                  className={`flex-1 py-2.5 text-center rounded-lg text-sm font-semibold transition-all duration-200 ${
                    activeTab === 'signup'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Form content */}
              {activeTab === 'signin' ? (
                <LoginForm onSubmit={handleLogin} />
              ) : (
                <SignupForm onSubmit={handleSignup} />
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 sm:pt-4 mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-white/70 shrink-0">
            <div className="flex items-center gap-2 bg-slate-100/80 dark:bg-white/5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-white/10 backdrop-blur-sm">
              <span className="material-symbols-outlined text-teal-600 dark:text-teal-400 text-sm">verified_user</span>
              <span className="font-medium text-slate-700 dark:text-white/90">
                HIPAA Compliant &bull; 256-bit Encrypted
              </span>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 ml-auto sm:ml-0">
              <a className="text-teal-600 dark:text-teal-300/80 hover:text-teal-700 dark:hover:text-white transition-colors hover:underline" href="mailto:amadiebube1@gmail.com">
                IT Helpdesk
              </a>
              <span className="text-slate-300 dark:text-white/30">&bull;</span>
              <a className="text-teal-600 dark:text-teal-300/80 hover:text-teal-700 dark:hover:text-white transition-colors hover:underline" href="#">
                Privacy Policy
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
