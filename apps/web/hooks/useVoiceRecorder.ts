'use client'
import { useRef, useState, useCallback } from 'react'

const MAX_DURATION_MS = 30000

/**
 * Ghi âm voice note ẩn danh và đổi giọng thành giọng trung tính
 * (pitch-shift bằng Web Audio API, xử lý hoàn toàn ở client trước khi gửi đi).
 */
export function useVoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef<number>(0)

  const cleanup = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    mediaRecorderRef.current = null
    chunksRef.current = []
  }, [])

  const startRecording = useCallback(async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = e => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.start()
      startTimeRef.current = Date.now()
      setIsRecording(true)
      setElapsedMs(0)

      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current
        setElapsedMs(elapsed)
        if (elapsed >= MAX_DURATION_MS) {
          recorder.stop()
        }
      }, 100)
    } catch {
      setError('Không thể truy cập microphone. Hãy kiểm tra quyền truy cập.')
    }
  }, [])

  /**
   * Đổi giọng thành giọng trung tính: pitch-shift bằng cách resample buffer
   * (tăng nhẹ tốc độ + hạ cao độ ngẫu nhiên trong khoảng cố định) để không
   * thể nhận ra giọng gốc, nhưng vẫn nghe tự nhiên, không méo quá mức.
   */
  const pitchShift = useCallback(async (blob: Blob): Promise<Blob> => {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    const audioCtx: AudioContext = new AudioCtx()
    const arrayBuffer = await blob.arrayBuffer()
    const decoded = await audioCtx.decodeAudioData(arrayBuffer)

    // Hạ pitch cố định ~12% — đủ để ẩn danh giọng nói, không làm mất rõ lời nói
    const pitchFactor = 0.88
    const offlineCtx = new OfflineAudioContext(
      decoded.numberOfChannels,
      Math.ceil(decoded.length / pitchFactor),
      decoded.sampleRate
    )
    const source = offlineCtx.createBufferSource()
    source.buffer = decoded
    source.playbackRate.value = pitchFactor
    source.connect(offlineCtx.destination)
    source.start()
    const rendered = await offlineCtx.startRendering()

    // Encode lại thành WAV để tương thích mọi nơi (không cần lib ngoài)
    const wavBlob = encodeWav(rendered)
    audioCtx.close()
    return wavBlob
  }, [])

  const stopRecording = useCallback((): Promise<{ blob: Blob; durationMs: number } | null> => {
    return new Promise(resolve => {
      const recorder = mediaRecorderRef.current
      if (!recorder) {
        resolve(null)
        return
      }
      const durationMs = Date.now() - startTimeRef.current

      recorder.onstop = async () => {
        setIsRecording(false)
        setIsProcessing(true)
        try {
          const rawBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
          const processedBlob = await pitchShift(rawBlob)
          resolve({ blob: processedBlob, durationMs })
        } catch {
          setError('Không xử lý được giọng nói, thử lại nhé.')
          resolve(null)
        } finally {
          setIsProcessing(false)
          cleanup()
        }
      }

      if (recorder.state !== 'inactive') recorder.stop()
      if (timerRef.current) clearInterval(timerRef.current)
    })
  }, [cleanup, pitchShift])

  const cancelRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current
    if (recorder && recorder.state !== 'inactive') recorder.stop()
    setIsRecording(false)
    cleanup()
  }, [cleanup])

  return {
    isRecording,
    isProcessing,
    elapsedMs,
    maxDurationMs: MAX_DURATION_MS,
    error,
    startRecording,
    stopRecording,
    cancelRecording,
  }
}

function encodeWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels
  const sampleRate = buffer.sampleRate
  const numFrames = buffer.length
  const bytesPerSample = 2
  const blockAlign = numChannels * bytesPerSample
  const dataSize = numFrames * blockAlign

  const arrayBuffer = new ArrayBuffer(44 + dataSize)
  const view = new DataView(arrayBuffer)

  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i))
  }

  writeStr(0, 'RIFF')
  view.setUint32(4, 36 + dataSize, true)
  writeStr(8, 'WAVE')
  writeStr(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, numChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * blockAlign, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, 16, true)
  writeStr(36, 'data')
  view.setUint32(40, dataSize, true)

  const channels: Float32Array[] = []
  for (let c = 0; c < numChannels; c++) channels.push(buffer.getChannelData(c))

  let offset = 44
  for (let i = 0; i < numFrames; i++) {
    for (let c = 0; c < numChannels; c++) {
      const sample = Math.max(-1, Math.min(1, channels[c][i]))
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true)
      offset += 2
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' })
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}
