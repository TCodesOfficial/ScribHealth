import { useState, useEffect } from 'react'
import { getSignedRecords, type SignedRecord } from '@/lib/pdfExport'
import jsPDF from 'jspdf'
import toast from 'react-hot-toast'

interface SignedRecordsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SignedRecordsModal({ isOpen, onClose }: SignedRecordsModalProps) {
  const [records, setRecords] = useState<SignedRecord[]>([])
  const [selectedRecord, setSelectedRecord] = useState<SignedRecord | null>(null)

  useEffect(() => {
    if (isOpen) {
      setRecords(getSignedRecords())
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleRedownload = (rec: SignedRecord) => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    let y = 15

    doc.setFillColor(15, 118, 110)
    doc.rect(0, 0, pageWidth, 28, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.text('SCRIBEHEALTH • CLINICAL REPORT', 14, 13)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text('Professional Medical Consultation Summary & SOAP Note', 14, 21)

    y = 36

    doc.setFillColor(243, 244, 246)
    doc.roundedRect(14, y, pageWidth - 28, 26, 2, 2, 'F')

    doc.setTextColor(17, 24, 39)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text(`Patient: ${rec.patientName}`, 18, y + 7)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(75, 85, 99)
    const mrnText = rec.mrn ? `MRN: ${rec.mrn}` : 'MRN: N/A'
    const wardText = rec.recommendedWard ? `Recommended Ward: ${rec.recommendedWard}` : ''
    doc.text([mrnText, wardText].filter(Boolean).join('   |   '), 18, y + 14)
    doc.text(`Signed Date: ${new Date(rec.signedAt).toLocaleString()}   |   Priority: ${rec.priority}`, 18, y + 21)

    y += 34

    const addSection = (title: string, content: string) => {
      if (y > 260) {
        doc.addPage()
        y = 20
      }
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.setTextColor(15, 118, 110)
      doc.text(title.toUpperCase(), 14, y)
      y += 5

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(31, 41, 55)

      const splitText = doc.splitTextToSize(content || 'Not documented', pageWidth - 28)
      doc.text(splitText, 14, y)
      y += splitText.length * 5 + 6
    }

    addSection('Subjective', rec.subjective)
    addSection('Objective', rec.objective)
    addSection('Assessment', rec.assessment)
    addSection('Plan', rec.plan)

    if (rec.icd10Codes && rec.icd10Codes.length > 0) {
      if (y > 260) {
        doc.addPage()
        y = 20
      }
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.setTextColor(15, 118, 110)
      doc.text('ICD-10 CODES', 14, y)
      y += 5

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(31, 41, 55)
      doc.text(rec.icd10Codes.join(', '), 14, y)
      y += 10
    }

    const filename = `${rec.patientName} transcript.pdf`.replace(/[/\\?%*:|"<>]/g, '-')
    doc.save(filename)
    toast.success(`Re-downloaded ${filename}`)
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest dark:bg-slate-900 rounded-xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl border border-outline-variant dark:border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-outline-variant dark:border-slate-800 flex items-center justify-between bg-surface-container-lowest dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary dark:text-emerald-400 text-xl">folder_managed</span>
            <h2 className="text-base font-bold text-on-surface dark:text-white">
              Signed & Exported Consultation Records
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-secondary-container/40 dark:bg-emerald-950 text-on-secondary-container dark:text-emerald-300 text-xs font-semibold">
              {records.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-outline dark:text-slate-400 hover:text-on-surface dark:hover:text-white"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 divide-y divide-outline-variant/40 dark:divide-slate-800">
          {records.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-4xl text-outline dark:text-slate-500 block mb-2">folder_off</span>
              <p className="text-sm font-semibold text-on-surface dark:text-slate-200">No signed records found</p>
              <p className="text-xs text-outline dark:text-slate-400 mt-1">
                Click "Sign & Export Note" on any consultation note to sign and export it.
              </p>
            </div>
          ) : (
            records.map((rec) => (
              <div key={rec.id} className="py-3.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-on-surface dark:text-white truncate">
                      {rec.patientName}
                    </h3>
                    {rec.mrn && (
                      <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-surface-container-high dark:bg-slate-800 text-on-surface-variant dark:text-slate-400">
                        {rec.mrn}
                      </span>
                    )}
                    {rec.recommendedWard && (
                      <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-medium">
                        Ward: {rec.recommendedWard}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-on-surface-variant dark:text-slate-400 mt-1 line-clamp-1">
                    <strong className="text-on-surface dark:text-slate-200">Assessment:</strong> {rec.assessment}
                  </p>
                  <p className="text-[11px] text-outline dark:text-slate-500 mt-0.5">
                    Signed: {new Date(rec.signedAt).toLocaleString()} &bull; Priority: {rec.priority}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setSelectedRecord(rec)}
                    className="px-3 py-1.5 rounded-lg bg-surface-container-high dark:bg-slate-800 text-on-surface dark:text-slate-200 hover:bg-surface-container-highest dark:hover:bg-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                    View
                  </button>
                  <button
                    onClick={() => handleRedownload(rec)}
                    className="px-3 py-1.5 rounded-lg bg-secondary dark:bg-emerald-600 text-white hover:bg-secondary/90 text-xs font-semibold flex items-center gap-1 transition-colors shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    PDF
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* View Record Details Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black/70 z-60 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest dark:bg-slate-900 rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl border border-outline-variant dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-outline-variant dark:border-slate-800 flex items-center justify-between bg-surface-container-lowest dark:bg-slate-900">
              <div>
                <h3 className="text-sm font-bold text-on-surface dark:text-white">
                  Signed Record: {selectedRecord.patientName}
                </h3>
                <p className="text-xs text-outline dark:text-slate-400">
                  Signed at {new Date(selectedRecord.signedAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1.5 rounded-lg text-outline dark:text-slate-400 hover:text-on-surface dark:hover:text-white"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {[
                { label: 'Subjective', content: selectedRecord.subjective },
                { label: 'Objective', content: selectedRecord.objective },
                { label: 'Assessment', content: selectedRecord.assessment },
                { label: 'Plan', content: selectedRecord.plan },
              ].map((sec) => (
                <div key={sec.label}>
                  <h4 className="text-xs font-bold text-on-surface-variant dark:text-slate-400 uppercase tracking-wider mb-1">
                    {sec.label}
                  </h4>
                  <div className="p-2.5 rounded bg-surface-container-low dark:bg-slate-800 border border-outline-variant dark:border-slate-700 text-xs text-on-surface dark:text-slate-200 leading-relaxed">
                    {sec.content}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-outline-variant dark:border-slate-800 flex justify-end gap-2 bg-surface-container-low/30 dark:bg-slate-800/50">
              <button
                onClick={() => handleRedownload(selectedRecord)}
                className="px-4 py-2 rounded-lg bg-secondary dark:bg-emerald-600 text-white hover:bg-secondary/90 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
