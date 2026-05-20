import { useState } from 'react'
import { useTrainingForm } from '../features/training/useTrainingForm'
import { PH1_FIELDS, PH2_FIELDS, inputCls, FIELD_DESCRIPTIONS } from '../features/training/constants'
import FormField from '../components/FormField'
import TrainingSpinner from '../components/TrainingSpinner'
import WasteScannerLoader from '../components/WasteScannerLoader'
import RequiredConfigSection from '../features/training/components/RequiredConfigSection'
import OptionalConfigSection from '../features/training/components/OptionalConfigSection'
import PhaseParamsSection from '../features/training/components/PhaseParamsSection'
import JsonPreviewSection from '../features/training/components/JsonPreviewSection'
import JobsList from '../features/training/components/JobsList'

export default function TrainingPage() {
  const [previewScanner, setPreviewScanner] = useState(false)
  const {
    form,
    setStr,
    setBool,
    setDatasetSource,
    jobs,
    runningJobIds,
    loading,
    error,
    handleSubmit,
  } = useTrainingForm()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Training Jobs</h1>
        <button
          type="button"
          onClick={() => setPreviewScanner(p => !p)}
          className="text-xs text-gray-500 hover:text-cyan-400 font-mono border border-gray-800 rounded px-2 py-1"
        >
          {previewScanner ? 'Ocultar preview' : '🔬 Preview scanner'}
        </button>
      </div>

      {previewScanner && (
        <div className="border border-gray-800 rounded-lg overflow-hidden bg-gray-950">
          <div className="px-3 py-2 bg-gray-900 border-b border-gray-800 text-xs text-gray-500 font-mono">
            WasteScannerLoader — preview
          </div>
          <WasteScannerLoader jobId="preview-00000000" debug />
        </div>
      )}

      {runningJobIds.length > 0 && (
        <div className="rounded border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm">
          <p className="font-medium text-amber-300">
            Hay {runningJobIds.length} job(s) entrenando ahora.
          </p>
          <p className="mt-1 font-mono text-amber-200/90 break-all">
            {runningJobIds.join(', ')}
          </p>
        </div>
      )}
      {loading ? (
        <TrainingSpinner />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField label="Job ID" description={FIELD_DESCRIPTIONS.job_id}>
            <input
              type="text"
              className={inputCls}
              placeholder="job-2fases-001"
              value={form.job_id}
              onChange={setStr('job_id')}
            />
          </FormField>

          <RequiredConfigSection
            form={form}
            setStr={setStr}
            setDatasetSource={setDatasetSource}
          />

          <OptionalConfigSection form={form} setStr={setStr} setBool={setBool} />

          <PhaseParamsSection title="Phase 1" fields={PH1_FIELDS} form={form} setStr={setStr} />
          <PhaseParamsSection title="Phase 2" fields={PH2_FIELDS} form={form} setStr={setStr} />

          <JsonPreviewSection form={form} />

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm font-medium"
          >
            Lanzar job
          </button>
        </form>
      )}

      <JobsList jobs={jobs} />
    </div>
  )
}
