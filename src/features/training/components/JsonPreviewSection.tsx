import CollapsibleSection from '../../../components/CollapsibleSection'
import { buildConfig } from '../buildConfig'
import type { FormState } from '../types'

interface Props {
  form: FormState
}

export default function JsonPreviewSection({ form }: Props) {
  const payload = { job_id: form.job_id || undefined, config: buildConfig(form) }

  return (
    <CollapsibleSection title="Preview JSON">
      <pre className="p-4 text-xs font-mono text-gray-300 overflow-auto max-h-72 bg-gray-950">
        {JSON.stringify(payload, null, 2)}
      </pre>
    </CollapsibleSection>
  )
}
