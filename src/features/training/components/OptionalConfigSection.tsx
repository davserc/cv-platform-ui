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

      {/* Notificación por email */}
      <div className="rounded-md border border-gray-700 bg-gray-900/50 p-3 space-y-1">
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-4 h-4 text-blue-400 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2.003 5.884 10 9.882l7.997-3.998A2 2 0 0 0 16 4H4a2 2 0 0 0-1.997 1.884z"/>
            <path d="m18 8.118-8 4-8-4V14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.118z"/>
          </svg>
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Notificación por email
          </span>
          {FIELD_DESCRIPTIONS.notify_email && (
            <InfoPopover description={FIELD_DESCRIPTIONS.notify_email} />
          )}
        </div>
        <input
          type="email"
          className={inputCls}
          placeholder="tu@email.com  (deja vacío para usar el default del servidor)"
          value={form.notify_email}
          onChange={setStr('notify_email')}
        />
        {form.notify_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.notify_email) && (
          <p className="text-xs text-red-400 mt-1">Email inválido</p>
        )}
      </div>

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
