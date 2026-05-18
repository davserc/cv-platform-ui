import CollapsibleSection from '../../../components/CollapsibleSection'
import FormField from '../../../components/FormField'
import { inputCls, FIELD_DESCRIPTIONS, type PhaseField } from '../constants'
import type { FormState } from '../types'

interface Props {
  title: string
  fields: PhaseField[]
  form: FormState
  setStr: (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => void
}

export default function PhaseParamsSection({ title, fields, form, setStr }: Props) {
  return (
    <CollapsibleSection title={title} badge="opcional">
      <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3">
        {fields.map(([field, label, placeholder]) => (
          <FormField key={field} label={label} description={FIELD_DESCRIPTIONS[field]}>
            <input
              type="number"
              step="any"
              className={inputCls}
              placeholder={placeholder}
              value={form[field] as string}
              onChange={setStr(field)}
            />
          </FormField>
        ))}
      </div>
    </CollapsibleSection>
  )
}
