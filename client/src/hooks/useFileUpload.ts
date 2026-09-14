import { useState, useRef, useCallback } from 'react'

const MAX_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = [
  'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav',
  'audio/ogg', 'audio/webm', 'audio/mp4', 'audio/m4a',
  'audio/x-m4a', 'audio/flac', 'audio/x-flac',
]

interface UseFileUploadReturn {
  selectedFile: File | null
  error: string
  selectFile: (file: File) => boolean
  clearFile: () => void
  fileInputRef: React.RefObject<HTMLInputElement | null>
  openPicker: () => void
}

export function useFileUpload(): UseFileUploadReturn {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const selectFile = useCallback((file: File): boolean => {
    setError('')

    if (!ALLOWED_TYPES.includes(file.type) && !file.type.startsWith('audio/')) {
      setError('Invalid file type. Please select an audio file.')
      return false
    }

    if (file.size > MAX_SIZE) {
      setError(`File too large. Maximum size is ${MAX_SIZE / (1024 * 1024)}MB.`)
      return false
    }

    setSelectedFile(file)
    return true
  }, [])

  const clearFile = useCallback(() => {
    setSelectedFile(null)
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  const openPicker = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  return {
    selectedFile,
    error,
    selectFile,
    clearFile,
    fileInputRef,
    openPicker,
  }
}
