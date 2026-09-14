import logo from '@/assets/logo.svg'

export default function BrandPanel() {
  return (
    <section className="lg:col-span-5 bg-transparent p-4 sm:p-6 md:p-8 lg:p-10 flex flex-col justify-between relative border-b lg:border-b-0 lg:border-r border-slate-200/30 dark:border-white/10 overflow-hidden">
      <div className="relative z-10 flex flex-col justify-between h-full">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-3">
            <img src={logo} alt="ScribeHealth AI" className="w-10 h-10 sm:w-11 sm:h-11" />
            <div>
              <span className="font-headline-sm text-headline-sm font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                ScribeHealth AI
              </span>
              <p className="text-label-sm text-teal-600 dark:text-teal-300/80 font-medium">
                Autonomous Clinical Documentation
              </p>
            </div>
          </div>

          <div className="mt-6 sm:mt-8 lg:mt-10 space-y-2.5 sm:space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-100/80 dark:bg-white/5 border border-teal-200 dark:border-teal-400/20 text-teal-700 dark:text-teal-300 text-xs font-semibold backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-teal-500 dark:bg-teal-400 animate-pulse" />
              Enterprise Healthcare Platform
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-[28px] font-bold font-headline-lg text-slate-900 dark:text-white leading-tight tracking-tight">
              Intelligent clinical documentation, delivered effortlessly.
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300/90 font-body-md leading-relaxed max-w-lg">
              Ambiently translate complex physician-patient encounters into structured, EHR-ready SOAP notes with unmatched precision.
            </p>
          </div>

          {/* Feature cards */}
          <div className="mt-5 sm:mt-6 lg:mt-8 space-y-2 sm:space-y-2.5">
            {[
              { icon: 'verified', title: '99.4% Clinical Precision', desc: 'Benchmarked across tertiary hospital systems' },
              { icon: 'shield', title: 'HIPAA & SOC2 Type II Certified', desc: 'Zero data retention with zero-knowledge encryption' },
              { icon: 'speech_to_text', title: 'Instant Voice-to-SOAP', desc: 'Handles multi-dialect encounters and surgical terminology' },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-center gap-3 p-2.5 sm:p-3 rounded-xl bg-slate-100/60 dark:bg-white/5 hover:bg-slate-200/60 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 backdrop-blur-md transition-all duration-200"
              >
                <div className="p-1.5 sm:p-2 rounded-lg bg-teal-100 dark:bg-teal-500/20 text-teal-600 dark:text-teal-300 shrink-0">
                  <span className="material-symbols-outlined text-lg">{item.icon}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {item.title}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-300/80">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Developer credit */}
        <div className="pt-4 sm:pt-5 border-t border-slate-200/50 dark:border-white/10 mt-4 sm:mt-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-teal-500/20">
              AT
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                Amadi Tobias
              </p>
              <p className="text-[11px] text-teal-600 dark:text-teal-300/80">
                Developer &amp; Owner
              </p>
            </div>
          </div>
          <a
            href="mailto:amadiebube1@gmail.com"
            className="inline-flex items-center gap-1.5 mt-2 text-[11px] text-slate-400 dark:text-teal-300/60 hover:text-teal-600 dark:hover:text-teal-300 transition-colors"
          >
            <span className="material-symbols-outlined text-[13px]">mail</span>
            amadiebube1@gmail.com
          </a>
        </div>
      </div>
    </section>
  )
}
