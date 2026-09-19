import jsPDF from 'jspdf'
import type { PatientConsultation } from '@/types'

export interface SignedRecord {
  id: string
  consultationId: string
  patientName: string
  mrn?: string
  signedAt: string
  recommendedWard?: string
  priority: string
  subjective: string
  objective: string
  assessment: string
  plan: string
  icd10Codes: string[]
}

const SIGNED_RECORDS_KEY = 'scribehealth_signed_records'

export function getSignedRecords(): SignedRecord[] {
  try {
    const raw = localStorage.getItem(SIGNED_RECORDS_KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export function saveSignedRecord(record: SignedRecord): void {
  try {
    const records = getSignedRecords()
    // Avoid duplicates
    const filtered = records.filter((r) => r.consultationId !== record.consultationId)
    localStorage.setItem(SIGNED_RECORDS_KEY, JSON.stringify([record, ...filtered]))
  } catch {
    // silent
  }
}

export function generateAndDownloadPdf(consultation: PatientConsultation, clinicianName = 'Clinician'): void {
  const doc = new jsPDF()
  const patient = consultation.patient
  const patientName = patient ? `${patient.firstName} ${patient.lastName}` : 'Walk-in Patient'
  const filename = `${patientName} transcript.pdf`.replace(/[/\\?%*:|"<>]/g, '-')

  // Page setup
  const pageWidth = doc.internal.pageSize.getWidth()
  let y = 15

  // Header background
  doc.setFillColor(15, 118, 110) // Teal-700
  doc.rect(0, 0, pageWidth, 28, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text('SCRIBEHEALTH AI • CLINICAL REPORT', 14, 13)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text('Professional Medical Consultation Summary & SOAP Note', 14, 21)

  y = 36

  // Patient Details Box
  doc.setFillColor(243, 244, 246)
  doc.roundedRect(14, y, pageWidth - 28, 26, 2, 2, 'F')

  doc.setTextColor(17, 24, 39)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text(`Patient: ${patientName}`, 18, y + 7)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(75, 85, 99)
  const mrnText = patient?.mrn ? `MRN: ${patient.mrn}` : 'MRN: N/A'
  const dobText = patient?.dateOfBirth ? `DOB: ${new Date(patient.dateOfBirth).toLocaleDateString()}` : ''
  const genderText = patient?.gender ? `Gender: ${patient.gender}` : ''
  const wardText = consultation.recommendedWard ? `Recommended Ward: ${consultation.recommendedWard}` : ''

  doc.text([mrnText, dobText, genderText, wardText].filter(Boolean).join('   |   '), 18, y + 14)
  doc.text(`Encounter Date: ${new Date(consultation.createdAt).toLocaleString()}   |   Priority: ${consultation.Priority}`, 18, y + 21)

  y += 34

  // Helper for section rendering
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

  addSection('Subjective', consultation.subjective)
  addSection('Objective', consultation.objective)
  addSection('Assessment', consultation.assessment)
  addSection('Plan', consultation.plan)

  // ICD-10 Codes
  if (consultation.icd10Codes && consultation.icd10Codes.length > 0) {
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
    doc.text(consultation.icd10Codes.join(', '), 14, y)
    y += 10
  }

  // Footer / Signature
  if (y > 250) {
    doc.addPage()
    y = 20
  }
  y += 10
  doc.setLineWidth(0.5)
  ;(doc as any).setLineDash([2, 2], 0)
  doc.line(14, y, pageWidth - 14, y)
  ;(doc as any).setLineDash([]) // reset

  y += 8
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(17, 24, 39)
  doc.text(`Signed and Certified by: ${clinicianName}`, 14, y)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(107, 114, 128)
  doc.text(`Signed Date: ${new Date().toLocaleString()}`, 14, y + 5)
  doc.text('ScribeHealth AI Hospital System • HIPAA Compliant', pageWidth - 14, y + 5, { align: 'right' })

  // Save PDF
  doc.save(filename)

  // Save to signed records store
  saveSignedRecord({
    id: `signed-${Date.now()}`,
    consultationId: consultation.id,
    patientName,
    mrn: patient?.mrn || undefined,
    signedAt: new Date().toISOString(),
    recommendedWard: consultation.recommendedWard || undefined,
    priority: consultation.Priority,
    subjective: consultation.subjective,
    objective: consultation.objective,
    assessment: consultation.assessment,
    plan: consultation.plan,
    icd10Codes: consultation.icd10Codes,
  })
}
