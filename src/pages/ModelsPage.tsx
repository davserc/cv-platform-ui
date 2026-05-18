import { useState, useEffect } from 'react'
import { listModels, deleteModel, type ModelSummary } from '../api/client'

export default function ModelsPage() {
  const [models, setModels] = useState<ModelSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await listModels()
      setModels(res.items)
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

  const statusColor = (status: string | null) => {
    if (status === 'active') return 'text-green-400'
    if (status === 'failed') return 'text-red-400'
    return 'text-gray-400'
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

      <div className="space-y-2">
        {models.map(model => (
          <div
            key={model.model_id}
            className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded px-4 py-3 text-sm"
          >
            <div>
              <p className="font-mono text-gray-200">{model.model_id}</p>
              <p className={`text-xs mt-0.5 ${statusColor(model.status)}`}>
                {model.status ?? 'desconocido'}
              </p>
            </div>
            <button
              onClick={() => handleDelete(model.model_id)}
              className="text-xs text-red-500 hover:text-red-400 border border-red-900 rounded px-2 py-1"
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
