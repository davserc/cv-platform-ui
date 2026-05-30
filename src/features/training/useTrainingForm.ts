import { useEffect, useRef, useState } from 'react'
import { fetchRecentTrainingJobs, fetchRunningTrainingJobs, submitTrainingJob, type JobStatus } from '../../api/client'
import { buildConfig } from './buildConfig'
import { INITIAL, type FormState, type JobEntry } from './types'

export function useTrainingForm() {
  const [form, setForm] = useState<FormState>(INITIAL)
  const [jobs, setJobs] = useState<JobEntry[]>([])
  const [runningJobIds, setRunningJobIds] = useState<string[]>([])
  const [jobDetails, setJobDetails] = useState<Record<string, JobStatus>>({})
  const everRanRef = useRef<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    const refresh = async () => {
      try {
        const [runningRes, recentRes] = await Promise.all([
          fetchRunningTrainingJobs(),
          fetchRecentTrainingJobs(),
        ])
        const ids = runningRes.running_job_ids ?? []
        ids.forEach(id => everRanRef.current.add(id))
        if (!mounted) return
        setRunningJobIds(ids)
        const details: Record<string, JobStatus> = {}
        for (const item of recentRes.items) {
          details[item.job_id] = item
        }
        setJobDetails(details)
      } catch {
        if (mounted) setRunningJobIds([])
      }
    }

    refresh()
    const id = setInterval(refresh, 10000)
    return () => {
      mounted = false
      clearInterval(id)
    }
  }, [])

  const setStr =
    (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }))

  const setBool =
    (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.checked }))

  const setDatasetSource = (src: 'gs' | 'url') =>
    setForm(prev => ({ ...prev, dataset_source: src }))

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    const datasetVal =
      form.dataset_source === 'gs' ? form.dataset_gs_uri : form.train_dataset_url

    if (!form.model || !form.name || !form.project || !datasetVal) {
      setError('Los campos requeridos (model, name, project y dataset) son obligatorios.')
      return
    }

    setLoading(true)
    try {
      const config = buildConfig(form)
      const res = await submitTrainingJob({ job_id: form.job_id || undefined, config })
      setJobs(prev => [
        { job_id: res.job_id, status: res.status, submitted_at: new Date().toLocaleTimeString() },
        ...prev,
      ])
      setForm(prev => ({ ...prev, job_id: '' }))
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }

  return {
    form,
    setStr,
    setBool,
    setForm,
    setDatasetSource,
    jobs,
    runningJobIds,
    everRanIds: everRanRef.current,
    jobDetails,
    loading,
    error,
    handleSubmit,
  }
}
