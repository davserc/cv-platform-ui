import { useState } from 'react'
import { useApiKey } from '../context/ApiKeyContext'

function maskKey(key: string): string {
  if (key.length <= 8) return '•'.repeat(key.length)
  return `${key.slice(0, 4)}${'•'.repeat(key.length - 8)}${key.slice(-4)}`
}

export default function ConfigPage() {
  const { apiKey, setApiKey } = useApiKey()
  const [input, setInput] = useState('')
  const [showInput, setShowInput] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim()) return
    setApiKey(input.trim())
    setInput('')
    setShowInput(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleClear = () => {
    setApiKey('')
    setSaved(false)
  }

  return (
    <div className="max-w-xl space-y-8">
      <h1 className="text-xl font-semibold">Configuracion</h1>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">API Key</h2>

        {/* Current key status */}
        {apiKey ? (
          <div className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-4 space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
              <span className="text-sm text-gray-400">API Key configurada</span>
              {saved && (
                <span className="ml-auto text-xs text-green-400">Guardada correctamente</span>
              )}
            </div>
            <p className="font-mono text-sm text-gray-300 tracking-wider">{maskKey(apiKey)}</p>
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setShowInput(v => !v)}
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                {showInput ? 'Cancelar' : 'Cambiar'}
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-red-400 hover:text-red-300"
              >
                Eliminar
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-950/40 border border-yellow-700/40 rounded-lg px-4 py-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-400 shrink-0" />
              <span className="text-sm text-yellow-300 font-medium">Sin API Key</span>
            </div>
            <p className="text-sm text-yellow-200/70">
              Los servicios de backend (Training, Models, Inference) no estan disponibles hasta que
              configures el API Key.
            </p>
          </div>
        )}

        {/* Form: shown always when no key, or conditionally when changing */}
        {(!apiKey || showInput) && (
          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                {apiKey ? 'Nueva API Key' : 'API Key'}{' '}
                <span className="text-red-400">*</span>
              </label>
              <input
                type="password"
                autoComplete="off"
                className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm font-mono focus:outline-none focus:border-blue-500"
                placeholder="tp4_..."
                value={input}
                onChange={e => setInput(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={!input.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 px-4 py-2 rounded text-sm font-medium"
            >
              Guardar
            </button>
          </form>
        )}
      </section>
    </div>
  )
}
