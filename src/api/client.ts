import { API_KEY_STORAGE_KEY } from '../context/ApiKeyContext'

const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? 'http://localhost:8080/api/v1'

function getApiKey(): string {
  const key = localStorage.getItem(API_KEY_STORAGE_KEY)
  if (!key) throw new Error('API Key no configurada. Ir a Configuracion para cargarla.')
  return key
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': getApiKey(),
      ...options.headers,
    },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`${res.status} ${res.statusText}: ${text}`)
  }
  return res.json()
}

// --- Training ---
export interface TrainConfig {
  // Required (model + name + project + one dataset source)
  model?: string
  name?: string
  project?: string
  dataset_gs_uri?: string
  train_dataset_url?: string
  // Optional general
  device?: string
  install_gsutil?: boolean
  save?: boolean
  // Phase 1
  ph1_epochs?: number
  ph1_patience?: number
  ph1_imgsz?: number
  ph1_batch?: number
  ph1_workers?: number
  ph1_freeze?: number
  ph1_lr0?: number
  ph1_lrf?: number
  ph1_mosaic?: number
  ph1_close_mosaic?: number
  ph1_degrees?: number
  ph1_translate?: number
  ph1_aug_scale?: number
  ph1_fliplr?: number
  ph1_copy_paste?: number
  ph1_cls?: number
  ph1_erasing?: number
  ph1_class_weights_auto?: number
  ph1_class_weights_power?: number
  ph1_per_class_metrics?: number
  ph1_save_period?: number
  // Phase 2
  ph2_epochs?: number
  ph2_patience?: number
  ph2_imgsz?: number
  ph2_batch?: number
  ph2_workers?: number
  ph2_freeze?: number
  ph2_lr0?: number
  ph2_lrf?: number
  ph2_mosaic?: number
  ph2_close_mosaic?: number
  ph2_degrees?: number
  ph2_translate?: number
  ph2_aug_scale?: number
  ph2_fliplr?: number
  ph2_copy_paste?: number
  ph2_cls?: number
  ph2_erasing?: number
  ph2_class_weights_auto?: number
  ph2_class_weights_power?: number
  ph2_per_class_metrics?: number
  ph2_save_period?: number
  ph2_dropout?: number
  ph2_cos_lr?: number
  ph2_focal_loss?: number
  ph2_focal_gamma?: number
  [key: string]: unknown
}

export interface TrainRequest {
  job_id?: string
  config: TrainConfig
}

export interface TrainResponse {
  status: string
  job_id: string
}

export const submitTrainingJob = (payload: TrainRequest) =>
  request<TrainResponse>('/train/', { method: 'POST', body: JSON.stringify(payload) })

export interface TrainLogsResponse {
  job_id: string
  log: string
  available: boolean
}

export const fetchTrainingLogs = (jobId: string) =>
  request<TrainLogsResponse>(`/train/${jobId}/logs`)

// --- Models ---
export interface ModelSummary {
  model_id: string
  status: string | null
}

export interface ModelsListResponse {
  items: ModelSummary[]
}

export const listModels = () => request<ModelsListResponse>('/models/')

export const deleteModel = (modelId: string) =>
  request<{ status: string; model_id: string; deleted: boolean }>(`/models/${modelId}`, {
    method: 'DELETE',
  })

// --- Inference ---
export interface InferRequest {
  model_id?: string
  inputs: string[]
}

export interface InferResponse {
  predictions: Record<string, unknown>[]
}

export const runInference = (payload: InferRequest) =>
  request<InferResponse>('/infer/', { method: 'POST', body: JSON.stringify(payload) })

// POST /infer/upload — multipart, returns JSON predictions
export const uploadAndInfer = async (file: File, modelId?: string): Promise<InferResponse> => {
  const form = new FormData()
  form.append('file', file)
  const qs = modelId ? `?model_id=${encodeURIComponent(modelId)}` : ''
  const res = await fetch(`${BASE_URL}/infer/upload${qs}`, {
    method: 'POST',
    headers: { 'X-API-KEY': getApiKey() },
    body: form,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`${res.status} ${res.statusText}: ${text}`)
  }
  return res.json()
}

// POST /infer/upload/annotated — multipart, returns PNG blob → object URL
export const uploadAndGetAnnotated = async (file: File, modelId?: string): Promise<string> => {
  const form = new FormData()
  form.append('file', file)
  const qs = modelId ? `?model_id=${encodeURIComponent(modelId)}` : ''
  const res = await fetch(`${BASE_URL}/infer/upload/annotated${qs}`, {
    method: 'POST',
    headers: { 'X-API-KEY': getApiKey() },
    body: form,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`${res.status} ${res.statusText}: ${text}`)
  }
  const blob = await res.blob()
  return URL.createObjectURL(blob)
}
