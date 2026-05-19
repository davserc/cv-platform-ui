import { useEffect, useRef, useState } from 'react'
import { fetchTrainingLogs } from '../../../api/client'

const POLL_INTERVAL_MS = 15_000

interface Props {
  jobId: string
}

export default function TrainingLogViewer({ jobId }: Props) {
  const [log, setLog] = useState('')
  const [available, setAvailable] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let active = true

    const fetch = async () => {
      try {
        const data = await fetchTrainingLogs(jobId)
        if (!active) return
        setLog(data.log)
        setAvailable(data.available)
        if (data.available) setLastUpdated(new Date())
      } catch {
        // silencioso — el job puede no tener log aún
      }
    }

    fetch()
    const id = setInterval(fetch, POLL_INTERVAL_MS)
    return () => {
      active = false
      clearInterval(id)
    }
  }, [jobId])

  // Auto-scroll al final cuando llega nuevo contenido
  useEffect(() => {
    if (log && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [log])

  return (
    <div className="border border-gray-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-2">
          {available ? (
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-gray-600" />
          )}
          <span className="text-xs text-gray-400 font-mono">train.log</span>
          <span className="text-xs text-gray-600 font-mono truncate max-w-48">
            {jobId}
          </span>
        </div>
        {lastUpdated && (
          <span className="text-[10px] text-gray-600">
            Actualizado {lastUpdated.toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Log content */}
      <div
        ref={containerRef}
        className="overflow-auto max-h-80 bg-gray-950 p-3"
      >
        {!available ? (
          <p className="text-xs text-gray-600 italic">
            Log aún no disponible — el training acaba de comenzar o todavía no llegó el primer ciclo de descarga (~75s)...
          </p>
        ) : log ? (
          <pre className="text-xs font-mono text-gray-300 whitespace-pre-wrap leading-relaxed">
            {log}
          </pre>
        ) : (
          <p className="text-xs text-gray-600 italic">Sin contenido aún.</p>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
