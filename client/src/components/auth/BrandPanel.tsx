export default function BrandPanel() {
  return (
    <section className="lg:col-span-5 bg-transparent p-5 sm:p-8 md:p-10 lg:p-12 flex flex-col justify-between relative border-b lg:border-b-0 lg:border-r border-white/10">
      <div className="relative z-10 flex flex-col justify-between h-full space-y-6 sm:space-y-8">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 text-white flex items-center justify-lg shadow-lg shadow-teal-500/25">
              <span className="material-symbols-outlined text-2xl">clinical_notes</span>
            </div>
            <div>
              <span className="font-headline-sm text-headline-sm font-bold tracking-tight text-white flex items-center gap-2">
                ScribeHealth AI
              </span>
              <p className="text-label-sm text-teal-300/80 font-medium">
                Autonomous Clinical Documentation
              </p>
            </div>
          </div>

          <div className="mt-8 sm:mt-12 space-y-3 sm:space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-teal-400/20 text-teal-300 text-xs font-semibold backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              Enterprise Healthcare Platform
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-bold font-headline-lg text-white leading-tight tracking-tight">
              Intelligent clinical documentation, delivered effortlessly.
            </h1>
            <p className="text-sm text-slate-300/90 font-body-md leading-relaxed max-w-lg">
              Ambiently translate complex physician-patient encounters into structured, EHR-ready SOAP notes with unmatched precision.
            </p>
          </div>

          {/* Feature cards */}
          <div className="mt-6 sm:mt-8 space-y-2.5 sm:space-y-3">
            {[
              { icon: 'verified', title: '99.4% Clinical Precision', desc: 'Benchmarked across tertiary hospital systems' },
              { icon: 'shield', title: 'HIPAA & SOC2 Type II Certified', desc: 'Zero data retention with zero-knowledge encryption' },
              { icon: 'speech_to_text', title: 'Instant Voice-to-SOAP', desc: 'Handles multi-dialect encounters and surgical terminology' },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-center gap-3 p-3 sm:p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md transition-all duration-200"
              >
                <div className="p-2 rounded-lg bg-teal-500/20 text-teal-300 shrink-0">
                  <span className="material-symbols-outlined text-lg">{item.icon}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {item.title}
                  </p>
                  <p className="text-xs text-slate-300/80">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div className="pt-5 sm:pt-6 border-t border-white/10">
          <blockquote className="text-xs sm:text-sm text-slate-300 italic font-body-sm leading-relaxed">
            &ldquo;ScribeHealth has eliminated end-of-day charting fatigue across our hospital departments.&rdquo;
          </blockquote>
          <div className="flex items-center gap-3 mt-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-teal-500/20">
              MS
            </div>
            <div>
              <p className="text-xs font-bold text-white">
                Marcus Sterling, MD, FACS
              </p>
              <p className="text-[11px] text-teal-300/80">
                Chief Medical Officer, MetroHealth
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
