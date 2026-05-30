import { useEffect, useState } from 'react'
import type { JobStatus } from '../../../api/client'
import type { JobEntry } from '../types'
import TrainingLogViewer from './TrainingLogViewer'

interface Props {
  jobs: JobEntry[]
  runningJobIds?: string[]
  everRanIds?: Set<string>
  jobDetails?: Record<string, JobStatus>
}

const SESSION_KEY = 'cv_training_jobs'

function loadPersistedJobs(): JobEntry[] {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function persistJobs(jobs: JobEntry[]) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(jobs))
  } catch {}
}

function parseRetry(error: string | null | undefined): { count: number; reason: string } | null {
  if (!error) return null
  const m = error.match(/cuda_retry_(\d+)/)
  if (m) return { count: parseInt(m[1]), reason: 'CUDA' }
  if (error.includes('timed out') || error.includes('Connection closed')) return { count: 0, reason: 'SSH' }
  if (error.includes('No address associated')) return { count: 0, reason: 'DNS' }
  if (error.includes('404')) return { count: 0, reason: 'instancia eliminada' }
  if (error.includes('stale_running')) return { count: 0, reason: 'pod reiniciado' }
  return null
}

function StatusBadge({ status, error, isRunning }: { status: string; error?: string | null; isRunning: boolean }) {
  const retry = parseRetry(error)

  if (isRunning && retry) {
    return (
      <span className="text-amber-400 text-xs">
        reintento {retry.count}/3 · {retry.reason}
      </span>
    )
  }

  const map: Record<string, string> = {
    running: 'text-green-400',
    retrying: 'text-amber-400',
    succeeded: 'text-gray-400',
    failed: 'text-red-400',
    queued: 'text-yellow-400',
  }
  const cls = map[status] ?? 'text-yellow-400'
  const label = status === 'succeeded' ? 'completado' : status

  return (
    <span className={`text-xs ${cls}`}>
      {label}
      {status === 'failed' && retry ? ` · ${retry.reason}` : ''}
    </span>
  )
}

function AttemptHistory({ error }: { error: string | null | undefined }) {
  if (!error) return null
  const retry = parseRetry(error)
  if (!retry) return null

  return (
    <div className="px-3 py-1.5 bg-amber-950/40 border border-amber-800/40 rounded text-[11px] text-amber-400/80 font-mono">
      Intento {retry.count} falló por error {retry.reason} → buscando nueva GPU...
    </div>
  )
}

const PAGE_SIZE = 5

export default function JobsList({ jobs, runningJobIds = [], everRanIds = new Set(), jobDetails = {} }: Props) {
  const [openLogJobIds, setOpenLogJobIds] = useState<Set<string>>(new Set())
  const [persistedJobs, setPersistedJobs] = useState<JobEntry[]>(loadPersistedJobs)
  const [page, setPage] = useState(0)

  useEffect(() => {
    if (jobs.length === 0) return
    setPersistedJobs(prev => {
      const existingIds = new Set(prev.map(j => j.job_id))
      const newEntries = jobs.filter(j => !existingIds.has(j.job_id))
      if (newEntries.length === 0) return prev
      const merged = [...newEntries, ...prev]
      persistJobs(merged)
      return merged
    })
  }, [jobs])

  const knownIds = new Set(persistedJobs.map(j => j.job_id))
  const syntheticRunning: JobEntry[] = runningJobIds
    .filter(id => !knownIds.has(id))
    .map(id => ({ job_id: id, status: 'running', submitted_at: '' }))

  const allJobs = [...syntheticRunning, ...persistedJobs]

  useEffect(() => {
    if (runningJobIds.length === 0) return
    setOpenLogJobIds(prev => {
      const next = new Set(prev)
      runningJobIds.forEach(id => next.add(id))
      return next
    })
  }, [runningJobIds.join(',')])

  // Reset to page 0 when list grows
  useEffect(() => { setPage(0) }, [allJobs.length])

  const totalPages = Math.ceil(allJobs.length / PAGE_SIZE)
  const pageJobs = allJobs.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const toggleLog = (jobId: string) =>
    setOpenLogJobIds(prev => {
      const next = new Set(prev)
      next.has(jobId) ? next.delete(jobId) : next.add(jobId)
      return next
    })

  if (allJobs.length === 0) return null

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-gray-400">
          Jobs de entrenamiento
          <span className="ml-2 text-gray-600 font-normal">({allJobs.length})</span>
        </h2>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-2 py-1 text-xs rounded border border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-500 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ‹
            </button>
            <span className="text-xs text-gray-500 px-1">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="px-2 py-1 text-xs rounded border border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-500 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ›
            </button>
          </div>
        )}
      </div>
      <div className="space-y-3">
        {pageJobs.map(job => {
          const detail = jobDetails[job.job_id]
          const isRunning = runningJobIds.includes(job.job_id)
          const dbStatus = detail?.status
          const displayStatus = isRunning ? 'running' : dbStatus ?? (everRanIds.has(job.job_id) ? 'succeeded' : job.status)
          const logOpen = openLogJobIds.has(job.job_id)
          const error = detail?.error

          return (
            <div key={job.job_id} className="space-y-1.5">
              <div className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded px-4 py-3 text-sm">
                <span className="font-mono text-gray-200 text-xs truncate max-w-xs">{job.job_id}</span>
                <div className="flex items-center gap-3 shrink-0">
                  <StatusBadge status={displayStatus} error={error} isRunning={isRunning} />
                  {job.submitted_at && <span className="text-xs text-gray-600">{job.submitted_at}</span>}
                  <button
                    type="button"
                    onClick={() => toggleLog(job.job_id)}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    {logOpen ? 'Ocultar log' : 'Ver log'}
                  </button>
                </div>
              </div>

              {/* Retry hint — shown when running but previous attempt failed */}
              {isRunning && error && <AttemptHistory error={error} />}

              {logOpen && <TrainingLogViewer jobId={job.job_id} />}
            </div>
          )
        })}
      </div>
    </section>
  )
}
