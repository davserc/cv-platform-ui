import type { JobEntry } from '../types'

interface Props {
  jobs: JobEntry[]
}

export default function JobsList({ jobs }: Props) {
  if (jobs.length === 0) return null

  return (
    <section>
      <h2 className="text-sm font-medium text-gray-400 mb-3">Jobs enviados esta sesión</h2>
      <div className="space-y-2">
        {jobs.map(job => (
          <div
            key={job.job_id}
            className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded px-4 py-3 text-sm"
          >
            <span className="font-mono text-gray-200">{job.job_id}</span>
            <div className="flex items-center gap-4 text-gray-400">
              <span className="text-yellow-400">{job.status}</span>
              <span>{job.submitted_at}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
