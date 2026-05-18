import { useState } from 'react'
import { submitTrainingJob } from '../../api/client'
import { buildConfig } from './buildConfig'
import { INITIAL, type FormState, type JobEntry } from './types'

export function useTrainingForm() {
  const [form, setForm] = useState<FormState>(INITIAL)
  const [jobs, setJobs] = useState<JobEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

  return { form, setStr, setBool, setDatasetSource, jobs, loading, error, handleSubmit }
}
