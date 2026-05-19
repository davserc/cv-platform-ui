import { useState } from 'react'
import type { JobEntry } from '../types'
import TrainingLogViewer from './TrainingLogViewer'

interface Props {
  jobs: JobEntry[]
}

export default function JobsList({ jobs }: Props) {
  const [openLogJobId, setOpenLogJobId] = useState<string | null>(null)

  if (jobs.length === 0) return null

  return (
    <section>
      <h2 className="text-sm font-medium text-gray-400 mb-3">Jobs enviados esta sesión</h2>
      <div className="space-y-3">
        {jobs.map(job => (
          <div key={job.job_id} className="space-y-2">
            <div className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded px-4 py-3 text-sm">
              <span className="font-mono text-gray-200">{job.job_id}</span>
              <div className="flex items-center gap-4 text-gray-400">
                <span className="text-yellow-400">{job.status}</span>
                <span>{job.submitted_at}</span>
                <button
                  type="button"
                  onClick={() =>
                    setOpenLogJobId(prev => (prev === job.job_id ? null : job.job_id))
                  }
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  {openLogJobId === job.job_id ? 'Ocultar log' : 'Ver log'}
                </button>
              </div>
            </div>

            {openLogJobId === job.job_id && (
              <TrainingLogViewer jobId={job.job_id} />
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
