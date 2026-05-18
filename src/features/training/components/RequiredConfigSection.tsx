import FormField from '../../../components/FormField'
import { inputCls, FIELD_DESCRIPTIONS } from '../constants'
import type { FormState } from '../types'

interface Props {
  form: FormState
  setStr: (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => void
  setDatasetSource: (src: 'gs' | 'url') => void
}

const TEXT_FIELDS: { field: keyof FormState; placeholder: string }[] = [
  { field: 'model', placeholder: 'yolo11s.pt' },
  { field: 'name', placeholder: 'exp_2fases' },
  { field: 'project', placeholder: 'runs' },
]

export default function RequiredConfigSection({ form, setStr, setDatasetSource }: Props) {
  const datasetField = form.dataset_source === 'gs' ? 'dataset_gs_uri' : 'train_dataset_url'
  const datasetPlaceholder =
    form.dataset_source === 'gs' ? 'gs://bucket/dataset.zip' : 'https://...'

  return (
    <section className="border border-gray-700 rounded-lg p-4 space-y-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
        Config — Obligatorios <span className="text-red-400">*</span>
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {TEXT_FIELDS.map(({ field, placeholder }) => (
          <FormField
            key={field}
            label={field}
            description={FIELD_DESCRIPTIONS[field]}
            required
          >
            <input
              type="text"
              className={inputCls}
              placeholder={placeholder}
              value={form[field] as string}
              onChange={setStr(field)}
            />
          </FormField>
        ))}
      </div>

      <div>
        <FormField
          label="dataset source"
          description={
            form.dataset_source === 'gs'
              ? FIELD_DESCRIPTIONS.dataset_gs_uri
              : FIELD_DESCRIPTIONS.train_dataset_url
          }
          required
        >
          <div className="flex gap-5 mb-2 mt-1">
            {(['gs', 'url'] as const).map(src => (
              <label key={src} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="dataset_source"
                  value={src}
                  checked={form.dataset_source === src}
                  onChange={() => setDatasetSource(src)}
                  className="accent-blue-500"
                />
                {src === 'gs' ? 'GCS URI (dataset_gs_uri)' : 'HTTP URL (train_dataset_url)'}
              </label>
            ))}
          </div>
          <input
            type="text"
            className={inputCls}
            placeholder={datasetPlaceholder}
            value={form[datasetField]}
            onChange={setStr(datasetField)}
          />
        </FormField>
      </div>
    </section>
  )
}
