import { useTrainingForm } from '../features/training/useTrainingForm'
import { PH1_FIELDS, PH2_FIELDS, inputCls, FIELD_DESCRIPTIONS } from '../features/training/constants'
import FormField from '../components/FormField'
import TrainingSpinner from '../components/TrainingSpinner'
import RequiredConfigSection from '../features/training/components/RequiredConfigSection'
import OptionalConfigSection from '../features/training/components/OptionalConfigSection'
import PhaseParamsSection from '../features/training/components/PhaseParamsSection'
import JsonPreviewSection from '../features/training/components/JsonPreviewSection'
import JobsList from '../features/training/components/JobsList'
export default function TrainingPage() {
  const {
    form,
    setForm,
    setStr,
    setBool,
    setDatasetSource,
    jobs,
    runningJobIds,
    everRanIds,
    jobDetails,
    loading,
    error,
    handleSubmit,
  } = useTrainingForm()

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold">Training Jobs</h1>

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

          <JsonPreviewSection form={form} onFormChange={setForm} />

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm font-medium"
          >
            Lanzar job
          </button>
        </form>
      )}

      <JobsList jobs={jobs} runningJobIds={runningJobIds} everRanIds={everRanIds} jobDetails={jobDetails} />
    </div>
  )
}
