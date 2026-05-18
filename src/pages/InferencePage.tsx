import { useState, useEffect, useRef } from 'react'
import {
  runInference,
  uploadAndInfer,
  uploadAndGetAnnotated,
  listModels,
  type ModelSummary,
} from '../api/client'

type Mode = 'url' | 'upload'

const selectCls =
  'w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500'
const inputCls =
  'w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500'
const btnPrimary =
  'bg-blue-600 hover:bg-blue-700 disabled:opacity-40 px-4 py-2 rounded text-sm font-medium'
const btnSecondary =
  'bg-gray-800 hover:bg-gray-700 disabled:opacity-40 px-4 py-2 rounded text-sm font-medium border border-gray-700'

export default function InferencePage() {
  const [models, setModels]         = useState<ModelSummary[]>([])
  const [modelId, setModelId]       = useState('')
  const [mode, setMode]             = useState<Mode>('upload')
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')

  // URL mode
  const [imageUrl, setImageUrl]     = useState('')

  // Upload mode
  const [file, setFile]             = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const fileInputRef                = useRef<HTMLInputElement>(null)

  // Results
  const [jsonResult, setJsonResult]       = useState<Record<string, unknown>[] | null>(null)
  const [annotatedUrl, setAnnotatedUrl]   = useState<string | null>(null)

  // Load models once
  useEffect(() => {
    listModels().then(r => setModels(r.items)).catch(() => {})
  }, [])

  // Generate a local preview URL when a file is picked
  useEffect(() => {
    if (!file) { setFilePreview(null); return }
    const url = URL.createObjectURL(file)
    setFilePreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  // Revoke annotated blob URL on unmount or when replaced
  useEffect(() => {
    return () => { if (annotatedUrl) URL.revokeObjectURL(annotatedUrl) }
  }, [annotatedUrl])

  const clearResults = () => { setJsonResult(null); setAnnotatedUrl(null); setError('') }

  const switchMode = (m: Mode) => { setMode(m); clearResults() }

  // ── Handlers ────────────────────────────────────────────────────

  const handleUrlInfer = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!imageUrl.trim()) { setError('Ingresá una URL de imagen.'); return }
    clearResults(); setLoading(true)
    try {
      const res = await runInference({ model_id: modelId || undefined, inputs: [imageUrl.trim()] })
      setJsonResult(res.predictions)
    } catch (err) { setError(String(err)) }
    finally { setLoading(false) }
  }

  const handleUploadJson = async () => {
    if (!file) { setError('Seleccioná un archivo primero.'); return }
    clearResults(); setLoading(true)
    try {
      const res = await uploadAndInfer(file, modelId || undefined)
      setJsonResult(res.predictions)
    } catch (err) { setError(String(err)) }
    finally { setLoading(false) }
  }

  const handleUploadAnnotated = async () => {
    if (!file) { setError('Seleccioná un archivo primero.'); return }
    clearResults(); setLoading(true)
    try {
      const url = await uploadAndGetAnnotated(file, modelId || undefined)
      setAnnotatedUrl(url)
    } catch (err) { setError(String(err)) }
    finally { setLoading(false) }
  }

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const dropped = e.dataTransfer.files[0]
    if (dropped?.type.startsWith('image/')) { setFile(dropped); clearResults() }
  }

  // ── Render ───────────────────────────────────────────────────────

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold">Inferencia</h1>

      {/* Model selector */}
      <div>
        <label className="block text-sm text-gray-400 mb-1">Modelo</label>
        <select className={selectCls} value={modelId} onChange={e => setModelId(e.target.value)}>
          <option value="">Modelo activo por defecto</option>
          {models.map(m => (
            <option key={m.model_id} value={m.model_id}>
              {m.model_id}{m.status === 'active' ? ' (activo)' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Mode tabs */}
      <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-lg p-1 w-fit">
        {(['upload', 'url'] as Mode[]).map(m => (
          <button
            key={m}
            type="button"
            onClick={() => switchMode(m)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              mode === m
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {m === 'upload' ? 'Subir archivo' : 'Por URL'}
          </button>
        ))}
      </div>

      {/* ── Upload mode ── */}
      {mode === 'upload' && (
        <div className="space-y-4">
          {/* Drop zone */}
          <div
            onDragOver={e => e.preventDefault()}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-gray-500 hover:bg-gray-900/40 transition-colors"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) { setFile(f); clearResults() } }}
            />
            {file ? (
              <div className="text-center">
                <p className="text-sm text-gray-200 font-medium">{file.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
                <p className="text-xs text-blue-400 mt-1">Click para cambiar</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-2xl mb-2">🖼️</p>
                <p className="text-sm text-gray-400">Arrastrá una imagen o hacé click</p>
                <p className="text-xs text-gray-600 mt-1">JPG · PNG · WEBP</p>
              </div>
            )}
          </div>

          {/* Preview */}
          {filePreview && (
            <img
              src={filePreview}
              alt="preview"
              className="max-h-52 rounded border border-gray-700 object-contain"
            />
          )}

          {/* Action buttons */}
          <div className="flex gap-3 flex-wrap">
            <button
              type="button"
              onClick={handleUploadJson}
              disabled={!file || loading}
              className={btnPrimary}
            >
              {loading ? 'Procesando…' : 'Predicciones JSON'}
            </button>
            <button
              type="button"
              onClick={handleUploadAnnotated}
              disabled={!file || loading}
              className={btnSecondary}
            >
              {loading ? 'Procesando…' : 'Imagen anotada'}
            </button>
          </div>
        </div>
      )}

      {/* ── URL mode ── */}
      {mode === 'url' && (
        <form onSubmit={handleUrlInfer} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">URL de imagen</label>
            <input
              className={inputCls}
              placeholder="https://… o gs://…"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
            />
          </div>
          {imageUrl.startsWith('http') && (
            <img
              src={imageUrl}
              alt="preview"
              className="max-h-52 rounded border border-gray-700 object-contain"
            />
          )}
          <button type="submit" disabled={loading} className={btnPrimary}>
            {loading ? 'Procesando…' : 'Correr inferencia'}
          </button>
        </form>
      )}

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {/* ── Results ── */}
      {jsonResult && (
        <section>
          <h2 className="text-sm font-medium text-gray-400 mb-3">Predicciones</h2>
          <pre className="bg-gray-900 border border-gray-800 rounded p-4 text-xs font-mono overflow-auto max-h-96 text-gray-300">
            {JSON.stringify(jsonResult, null, 2)}
          </pre>
        </section>
      )}

      {annotatedUrl && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-gray-400">Imagen anotada</h2>
            <a
              href={annotatedUrl}
              download="annotated.png"
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              Descargar PNG
            </a>
          </div>
          <img
            src={annotatedUrl}
            alt="imagen anotada"
            className="max-w-full rounded border border-gray-700"
          />
        </section>
      )}
    </div>
  )
}
