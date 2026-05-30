import { useEffect, useState } from 'react'

const STORAGE_KEY = 'cv_gpu_config'

export interface GpuConfig {
  max_price: string
  min_cuda: string
}

const DEFAULTS: GpuConfig = { max_price: '', min_cuda: '' }

function load(): GpuConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS
  } catch {
    return DEFAULTS
  }
}

interface Props {
  value: GpuConfig
  onChange: (v: GpuConfig) => void
}

export function useGpuConfig() {
  const [gpu, setGpuState] = useState<GpuConfig>(load)

  const setGpu = (next: GpuConfig) => {
    setGpuState(next)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
  }

  return { gpu, setGpu }
}

export default function GpuConfigSection({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)

  // Auto-open if non-default values are set
  useEffect(() => {
    if (value.max_price || value.min_cuda) setOpen(true)
  }, [])

  const set = (field: keyof GpuConfig) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...value, [field]: e.target.value })

  const hasValues = value.max_price || value.min_cuda

  return (
    <div className="border border-gray-800 rounded">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-400 hover:text-gray-200"
      >
        <span className="font-medium">
          GPU
          {hasValues && (
            <span className="ml-2 text-xs text-indigo-400 font-normal">
              {[value.max_price && `≤$${value.max_price}/hr`, value.min_cuda && `CUDA≥${value.min_cuda}`].filter(Boolean).join(' · ')}
            </span>
          )}
        </span>
        <span className="text-gray-600 text-xs">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-3 pb-3 pt-1 space-y-3 border-t border-gray-800">
          <p className="text-[11px] text-gray-600">
            Se aplica a todos los jobs. Vacío = sin restricción.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Precio máximo ($/hr)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="sin límite"
                value={value.max_price}
                onChange={set('max_price')}
                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">CUDA mínima</label>
              <input
                type="number"
                min="0"
                step="0.1"
                placeholder="cualquiera"
                value={value.min_cuda}
                onChange={set('min_cuda')}
                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
          {(value.max_price || value.min_cuda) && (
            <button
              type="button"
              onClick={() => onChange(DEFAULTS)}
              className="text-xs text-gray-600 hover:text-gray-400"
            >
              Limpiar
            </button>
          )}
        </div>
      )}
    </div>
  )
}
