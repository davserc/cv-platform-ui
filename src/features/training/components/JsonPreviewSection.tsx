import { useEffect, useRef, useState } from 'react'
import CollapsibleSection from '../../../components/CollapsibleSection'
import { buildConfig } from '../buildConfig'
import type { FormState } from '../types'

interface Props {
  form: FormState
  onFormChange: (form: FormState) => void
}

function buildPayload(form: FormState) {
  return { job_id: form.job_id || undefined, config: buildConfig(form) }
}

function jsonToForm(json: unknown, current: FormState): FormState {
  if (!json || typeof json !== 'object') return current
  const p = json as Record<string, unknown>
  const cfg = (p.config ?? {}) as Record<string, unknown>

  const s = (v: unknown): string => (v != null ? String(v) : '')
  const b = (v: unknown, fallback: boolean): boolean => (v != null ? Boolean(v) : fallback)

  return {
    job_id: s(p.job_id),
    model: s(cfg.model) || current.model,
    name: s(cfg.name) || current.name,
    project: s(cfg.project) || current.project,
    dataset_source: cfg.dataset_gs_uri ? 'gs' : cfg.train_dataset_url ? 'url' : current.dataset_source,
    dataset_gs_uri: s(cfg.dataset_gs_uri),
    train_dataset_url: s(cfg.train_dataset_url),
    notify_email: s(cfg.notify_email) || current.notify_email,
    device: s(cfg.device) || current.device,
    install_gsutil: b(cfg.install_gsutil, current.install_gsutil),
    save: b(cfg.save, current.save),
    ph1_epochs: s(cfg.ph1_epochs),
    ph1_patience: s(cfg.ph1_patience),
    ph1_imgsz: s(cfg.ph1_imgsz),
    ph1_batch: s(cfg.ph1_batch),
    ph1_workers: s(cfg.ph1_workers),
    ph1_freeze: s(cfg.ph1_freeze),
    ph1_lr0: s(cfg.ph1_lr0),
    ph1_lrf: s(cfg.ph1_lrf),
    ph1_mosaic: s(cfg.ph1_mosaic),
    ph1_close_mosaic: s(cfg.ph1_close_mosaic),
    ph1_degrees: s(cfg.ph1_degrees),
    ph1_translate: s(cfg.ph1_translate),
    ph1_aug_scale: s(cfg.ph1_aug_scale),
    ph1_fliplr: s(cfg.ph1_fliplr),
    ph1_copy_paste: s(cfg.ph1_copy_paste),
    ph1_cls: s(cfg.ph1_cls),
    ph1_erasing: s(cfg.ph1_erasing),
    ph1_class_weights_auto: s(cfg.ph1_class_weights_auto),
    ph1_class_weights_power: s(cfg.ph1_class_weights_power),
    ph1_per_class_metrics: s(cfg.ph1_per_class_metrics),
    ph1_save_period: s(cfg.ph1_save_period),
    ph2_epochs: s(cfg.ph2_epochs),
    ph2_patience: s(cfg.ph2_patience),
    ph2_imgsz: s(cfg.ph2_imgsz),
    ph2_batch: s(cfg.ph2_batch),
    ph2_workers: s(cfg.ph2_workers),
    ph2_freeze: s(cfg.ph2_freeze),
    ph2_lr0: s(cfg.ph2_lr0),
    ph2_lrf: s(cfg.ph2_lrf),
    ph2_mosaic: s(cfg.ph2_mosaic),
    ph2_close_mosaic: s(cfg.ph2_close_mosaic),
    ph2_degrees: s(cfg.ph2_degrees),
    ph2_translate: s(cfg.ph2_translate),
    ph2_aug_scale: s(cfg.ph2_aug_scale),
    ph2_fliplr: s(cfg.ph2_fliplr),
    ph2_copy_paste: s(cfg.ph2_copy_paste),
    ph2_cls: s(cfg.ph2_cls),
    ph2_erasing: s(cfg.ph2_erasing),
    ph2_class_weights_auto: s(cfg.ph2_class_weights_auto),
    ph2_class_weights_power: s(cfg.ph2_class_weights_power),
    ph2_per_class_metrics: s(cfg.ph2_per_class_metrics),
    ph2_save_period: s(cfg.ph2_save_period),
    ph2_dropout: s(cfg.ph2_dropout),
    ph2_cos_lr: s(cfg.ph2_cos_lr),
    ph2_focal_loss: s(cfg.ph2_focal_loss),
    ph2_focal_gamma: s(cfg.ph2_focal_gamma),
  }
}

export default function JsonPreviewSection({ form, onFormChange }: Props) {
  const canonical = JSON.stringify(buildPayload(form), null, 2)
  const [jsonText, setJsonText] = useState(canonical)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const editingRef = useRef(false)

  // When form changes via field inputs, sync to JSON (only if not editing the textarea)
  useEffect(() => {
    if (!editingRef.current) {
      setJsonText(canonical)
    }
  }, [canonical])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    setJsonText(text)
    try {
      const parsed = JSON.parse(text)
      onFormChange(jsonToForm(parsed, form))
      setError('')
    } catch {
      setError('JSON inválido')
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleReset = () => {
    setJsonText(canonical)
    setError('')
  }

  return (
    <CollapsibleSection title="Preview JSON">
      <div>
        <div className="flex justify-end gap-3 mb-1.5">
          {error && <span className="text-xs text-red-400 mr-auto">{error}</span>}
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-gray-600 hover:text-gray-400"
          >
            Resetear
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="text-xs text-gray-500 hover:text-gray-300"
          >
            {copied ? 'Copiado ✓' : 'Copiar'}
          </button>
        </div>
        <textarea
          value={jsonText}
          onChange={handleChange}
          onFocus={() => { editingRef.current = true }}
          onBlur={() => {
            editingRef.current = false
            // Normalize indentation on blur if JSON is valid
            if (!error) setJsonText(canonical)
          }}
          spellCheck={false}
          className={`w-full p-4 text-xs font-mono text-gray-300 bg-gray-950 border rounded resize-y focus:outline-none ${
            error ? 'border-red-700 focus:border-red-500' : 'border-gray-800 focus:border-blue-600'
          }`}
          style={{ minHeight: '16rem' }}
        />
      </div>
    </CollapsibleSection>
  )
}
