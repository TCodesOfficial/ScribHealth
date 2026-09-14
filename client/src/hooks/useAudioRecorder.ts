import { useState, useRef, useCallback } from 'react'

interface UseAudioRecorderReturn {
  isRecording: boolean
  isPaused: boolean
  elapsed: number
  start: () => void
  pause: () => void
  resume: () => void
  stop: () => Promise<Blob | null>
  formatTime: (seconds: number) => string
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [elapsed, setElapsed] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1)
    }, 1000)
  }, [])

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm',
      })

      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start(1000)
      setIsRecording(true)
      setIsPaused(false)
      setElapsed(0)
      startTimer()
    } catch (err) {
      console.error('Failed to start recording:', err)
      throw new Error('Microphone access denied. Please allow microphone permissions.')
    }
  }, [startTimer])

  const pause = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause()
      stopTimer()
      setIsPaused(true)
    }
  }, [stopTimer])

  const resume = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume()
      startTimer()
      setIsPaused(false)
    }
  }, [startTimer])

  const stop = useCallback(async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current
      if (!recorder) {
        resolve(null)
        return
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType })
        const stream = recorder.stream
        stream.getTracks().forEach((track) => track.stop())
        resolve(blob)
      }

      if (recorder.state === 'inactive') {
        stopTimer()
        setIsRecording(false)
        setIsPaused(false)
        resolve(null)
        return
      }

      recorder.stop()
      stopTimer()
      setIsRecording(false)
      setIsPaused(false)
    })
  }, [stopTimer])

  return {
    isRecording,
    isPaused,
    elapsed,
    start,
    pause,
    resume,
    stop,
    formatTime,
  }
}
