import { useState, useEffect } from 'react'
import { listModels, deleteModel, type ModelSummary } from '../api/client'

function mAP50(m: ModelSummary): number {
  if (!m.metrics) return -1
  return m.metrics['mAP50'] ?? m.metrics['box_mAP50'] ?? m.metrics['mAP'] ?? -1
}

function MetricBadge({ label, value }: { label: string; value: number | undefined }) {
  if (value === undefined) return null
  const pct = Math.round(value * 100)
  const color =
    pct >= 60 ? 'text-green-400' : pct >= 35 ? 'text-yellow-400' : 'text-red-400'
  return (
    <div className="flex flex-col items-center min-w-[64px]">
      <span className={`text-base font-bold font-mono ${color}`}>{pct}%</span>
      <span className="text-[10px] text-gray-500 mt-0.5">{label}</span>
    </div>
  )
}

function StatusBadge({ status }: { status: string | null }) {
  const map: Record<string, string> = {
    active: 'bg-green-900 text-green-300',
    registered: 'bg-blue-900 text-blue-300',
    failed: 'bg-red-900 text-red-400',
  }
  const cls = map[status ?? ''] ?? 'bg-gray-800 text-gray-400'
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${cls}`}>
      {status ?? 'desconocido'}
    </span>
  )
}

function RankBadge({ rank }: { rank: number }) {
  const colors = ['text-yellow-400', 'text-gray-300', 'text-orange-400']
  const cls = colors[rank - 1] ?? 'text-gray-500'
  return (
    <span className={`text-lg font-bold font-mono w-8 text-center ${cls}`}>
      #{rank}
    </span>
  )
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

export default function ModelsPage() {
  const [models, setModels] = useState<ModelSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await listModels()
      const sorted = [...res.items].sort((a, b) => mAP50(b) - mAP50(a))
      setModels(sorted)
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id: string) => {
    if (!confirm(`Eliminar modelo ${id}?`)) return
    try {
      await deleteModel(id)
      setModels(prev => prev.filter(m => m.model_id !== id))
    } catch (err) {
      alert(String(err))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Modelos</h1>
        <button
          onClick={load}
          className="text-sm text-gray-400 hover:text-gray-200 border border-gray-700 rounded px-3 py-1"
        >
          Actualizar
        </button>
      </div>

      {loading && <p className="text-gray-500 text-sm">Cargando...</p>}
      {error && <p className="text-red-400 text-sm">{error}</p>}

      {!loading && models.length === 0 && (
        <p className="text-gray-500 text-sm">No hay modelos registrados.</p>
      )}

      <div className="space-y-3">
        {models.map((model, idx) => {
          const score = mAP50(model)
          const hasMetrics = score >= 0
          return (
            <div
              key={model.model_id}
              className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-sm"
            >
              {/* Header row */}
              <div className="flex items-start gap-3">
                <RankBadge rank={idx + 1} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-gray-200 font-medium truncate">
                      {model.name ?? model.model_id}
                    </span>
                    {model.version && (
                      <span className="text-[10px] text-gray-500 font-mono">v{model.version}</span>
                    )}
                    <StatusBadge status={model.status} />
                  </div>
                  <p className="text-[11px] text-gray-600 font-mono mt-0.5 truncate">
                    {model.model_id}
                  </p>
                </div>

                <button
                  onClick={() => handleDelete(model.model_id)}
                  className="text-xs text-red-500 hover:text-red-400 border border-red-900 rounded px-2 py-1 shrink-0"
                >
                  Eliminar
                </button>
              </div>

              {/* Metrics row */}
              {hasMetrics && model.metrics && (
                <div className="mt-3 flex items-center gap-4">
                  <MetricBadge label="mAP50" value={model.metrics['mAP50'] ?? model.metrics['box_mAP50']} />
                  <MetricBadge label="Precisión" value={model.metrics['box_p']} />
                  <MetricBadge label="Recall" value={model.metrics['box_r']} />
                  {model.metrics['mask_mAP50'] !== undefined && (
                    <MetricBadge label="mAP50-seg" value={model.metrics['mask_mAP50']} />
                  )}

                  {/* mAP50 bar */}
                  <div className="flex-1 ml-2">
                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${Math.min(100, Math.round((mAP50(model)) * 100))}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Footer row */}
              <div className="mt-2 flex items-center gap-4 text-[10px] text-gray-600">
                {model.job_id && (
                  <span>job: <span className="font-mono">{model.job_id}</span></span>
                )}
                <span>creado: {formatDate(model.created_at)}</span>
                {model.updated_at && model.updated_at !== model.created_at && (
                  <span>actualizado: {formatDate(model.updated_at)}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
