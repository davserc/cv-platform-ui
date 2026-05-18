import FormField from '../../../components/FormField'
import InfoPopover from '../../../components/InfoPopover'
import { inputCls, FIELD_DESCRIPTIONS } from '../constants'
import type { FormState } from '../types'

interface Props {
  form: FormState
  setStr: (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => void
  setBool: (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => void
}

const BOOL_FIELDS: Array<keyof FormState> = ['install_gsutil', 'save']

export default function OptionalConfigSection({ form, setStr, setBool }: Props) {
  return (
    <section className="border border-gray-800 rounded-lg p-4 space-y-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
        Config — Opcionales
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormField label="device" description={FIELD_DESCRIPTIONS.device}>
          <input
            type="text"
            className={inputCls}
            placeholder="0"
            value={form.device}
            onChange={setStr('device')}
          />
        </FormField>
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-2">
        {BOOL_FIELDS.map(field => (
          <div key={field} className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={form[field] as boolean}
                onChange={setBool(field)}
                className="accent-blue-500 w-4 h-4"
              />
              {field}
            </label>
            {FIELD_DESCRIPTIONS[field] && (
              <InfoPopover description={FIELD_DESCRIPTIONS[field]!} />
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
