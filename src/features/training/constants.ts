import type { FormState } from './types'

export const inputCls =
  'w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500'

// [field key, display label, placeholder (backend default)]
export type PhaseField = [keyof FormState, string, string]

export const PH1_FIELDS: PhaseField[] = [
  ['ph1_epochs', 'epochs', 'ej: 25'],
  ['ph1_patience', 'patience', '25'],
  ['ph1_imgsz', 'imgsz', '896'],
  ['ph1_batch', 'batch', '-1'],
  ['ph1_workers', 'workers', '4'],
  ['ph1_freeze', 'freeze', '10'],
  ['ph1_lr0', 'lr0', '0.01'],
  ['ph1_lrf', 'lrf', '0.01'],
  ['ph1_mosaic', 'mosaic', '0.7'],
  ['ph1_close_mosaic', 'close_mosaic', '10'],
  ['ph1_degrees', 'degrees', '8'],
  ['ph1_translate', 'translate', '0.08'],
  ['ph1_aug_scale', 'aug_scale', '0.35'],
  ['ph1_fliplr', 'fliplr', '0.5'],
  ['ph1_copy_paste', 'copy_paste', '0.4'],
  ['ph1_cls', 'cls', '1.0'],
  ['ph1_erasing', 'erasing', '0.1'],
  ['ph1_class_weights_auto', 'class_weights_auto', '0 / 1'],
  ['ph1_class_weights_power', 'class_weights_power', '0.5'],
  ['ph1_per_class_metrics', 'per_class_metrics', '0 / 1'],
  ['ph1_save_period', 'save_period', '5'],
]

export const PH2_FIELDS: PhaseField[] = [
  ['ph2_epochs', 'epochs', 'ej: 100'],
  ['ph2_patience', 'patience', '20'],
  ['ph2_imgsz', 'imgsz', '896'],
  ['ph2_batch', 'batch', '-1'],
  ['ph2_workers', 'workers', '4'],
  ['ph2_freeze', 'freeze', '0'],
  ['ph2_lr0', 'lr0', '0.002'],
  ['ph2_lrf', 'lrf', '0.01'],
  ['ph2_mosaic', 'mosaic', '0.7'],
  ['ph2_close_mosaic', 'close_mosaic', '15'],
  ['ph2_degrees', 'degrees', '8'],
  ['ph2_translate', 'translate', '0.08'],
  ['ph2_aug_scale', 'aug_scale', '0.35'],
  ['ph2_fliplr', 'fliplr', '0.5'],
  ['ph2_copy_paste', 'copy_paste', '0.6'],
  ['ph2_cls', 'cls', '1.0'],
  ['ph2_erasing', 'erasing', '0.1'],
  ['ph2_class_weights_auto', 'class_weights_auto', '0 / 1'],
  ['ph2_class_weights_power', 'class_weights_power', '0.7'],
  ['ph2_per_class_metrics', 'per_class_metrics', '0 / 1'],
  ['ph2_save_period', 'save_period', '3'],
  ['ph2_dropout', 'dropout', '0.2'],
  ['ph2_cos_lr', 'cos_lr', '0 / 1'],
  ['ph2_focal_loss', 'focal_loss', '0 / 1'],
  ['ph2_focal_gamma', 'focal_gamma', '1.5'],
]

export const FIELD_DESCRIPTIONS: Partial<Record<keyof FormState, string>> = {
  // Top-level
  job_id:
    'Identificador único del job. Si se deja vacío se genera automáticamente.',

  // Required config
  model:
    'Modelo YOLO de partida que define arquitectura y tamaño de la red. Opciones: yolo11n.pt (nano), yolo11s.pt (small), yolo11m.pt (medium), yolo11l.pt (large), yolo11x.pt (extra-large).',
  name:
    'Nombre del experimento. Se usa como nombre de la subcarpeta donde se guardan pesos, métricas y logs.',
  project:
    'Directorio raíz donde se crean los experimentos. Los resultados quedan en project/name/.',
  dataset_gs_uri:
    'URI del dataset en Google Cloud Storage. Debe ser un .zip con estructura YOLO (carpetas images/ y labels/ con splits train/val/test).',
  train_dataset_url:
    'URL HTTP/HTTPS del dataset a descargar. Debe ser un .zip con estructura YOLO (carpetas images/ y labels/).',

  // Optional general
  device:
    'Dispositivo de cómputo. "0" para la primera GPU, "0,1" para múltiples GPUs, "cpu" para CPU (mucho más lento).',
  install_gsutil:
    'Instala gsutil antes de iniciar el entrenamiento. Necesario si el servidor no lo tiene y el dataset está en GCS.',
  save:
    'Guarda los pesos del modelo al finalizar el entrenamiento.',

  // Phase 1
  ph1_epochs:
    'Cantidad de épocas en la fase 1 (entrenamiento con parte del backbone congelado).',
  ph1_patience:
    'Early stopping: épocas sin mejora en val/mAP50 antes de detener la fase 1.',
  ph1_imgsz:
    'Tamaño de imagen de entrada en píxeles (cuadrada). Valores más altos mejoran precisión pero consumen más VRAM.',
  ph1_batch:
    'Tamaño del batch. -1 activa auto-batch que usa ~60% de la VRAM disponible.',
  ph1_workers:
    'Workers para carga de datos en paralelo. 0 carga en el hilo principal.',
  ph1_freeze:
    'Capas del backbone a congelar en la fase 1. Preserva features generales y entrena solo la cabeza del modelo.',
  ph1_lr0:
    'Learning rate inicial de la fase 1.',
  ph1_lrf:
    'Factor de decaimiento del learning rate al final de la fase 1 (lr_final = lr0 × lrf).',
  ph1_mosaic:
    'Probabilidad del augmentation mosaico: combina 4 imágenes en una. 0.0 desactiva, 1.0 siempre activo.',
  ph1_close_mosaic:
    'Desactiva el mosaico en las últimas N épocas para estabilizar el entrenamiento antes de finalizar.',
  ph1_degrees:
    'Rango de rotación aleatoria en grados (±degrees).',
  ph1_translate:
    'Fracción de traslación aleatoria respecto al tamaño de la imagen (±translate).',
  ph1_aug_scale:
    'Rango de escala aleatoria: la imagen se redimensiona entre (1−scale) y (1+scale).',
  ph1_fliplr:
    'Probabilidad de volteo horizontal aleatorio.',
  ph1_copy_paste:
    'Probabilidad de copy-paste augmentation: copia instancias de segmentación entre imágenes.',
  ph1_cls:
    'Peso de la pérdida de clasificación respecto a box loss y dfl loss.',
  ph1_erasing:
    'Probabilidad de borrar aleatoriamente una región rectangular de la imagen (random erasing).',
  ph1_class_weights_auto:
    'Balanceo automático de clases por frecuencia inversa (0=desactivado, 1=activado). Útil para datasets muy desbalanceados.',
  ph1_class_weights_power:
    'Exponente para el cálculo de pesos de clase. 0.5 equivale a raíz cuadrada de la frecuencia inversa.',
  ph1_per_class_metrics:
    'Calcular y loguear métricas (precisión, recall, mAP) por clase individual (0=no, 1=sí).',
  ph1_save_period:
    'Guardar un checkpoint cada N épocas. 0 desactiva los checkpoints intermedios.',

  // Phase 2
  ph2_epochs:
    'Cantidad de épocas en la fase 2 (fine-tuning con todas las capas descongeladas).',
  ph2_patience:
    'Early stopping: épocas sin mejora en val/mAP50 antes de detener la fase 2.',
  ph2_imgsz:
    'Tamaño de imagen en la fase 2. Puede ser igual o mayor que en la fase 1 para mayor precisión.',
  ph2_batch:
    'Tamaño del batch en la fase 2. -1 activa auto-batch.',
  ph2_workers:
    'Workers para carga de datos en la fase 2.',
  ph2_freeze:
    'Capas a congelar en la fase 2. 0 desbloquea toda la red para fine-tuning completo.',
  ph2_lr0:
    'Learning rate inicial de la fase 2. Generalmente mucho más bajo que en fase 1 para fine-tuning suave.',
  ph2_lrf:
    'Factor de decaimiento del learning rate al final de la fase 2.',
  ph2_mosaic:
    'Probabilidad de augmentation mosaico en la fase 2.',
  ph2_close_mosaic:
    'Desactiva el mosaico en las últimas N épocas de la fase 2.',
  ph2_degrees:
    'Rango de rotación aleatoria en la fase 2 (±degrees).',
  ph2_translate:
    'Fracción de traslación aleatoria en la fase 2.',
  ph2_aug_scale:
    'Rango de escala aleatoria en la fase 2.',
  ph2_fliplr:
    'Probabilidad de volteo horizontal en la fase 2.',
  ph2_copy_paste:
    'Probabilidad de copy-paste augmentation en la fase 2.',
  ph2_cls:
    'Peso de la pérdida de clasificación en la fase 2.',
  ph2_erasing:
    'Probabilidad de random erasing en la fase 2.',
  ph2_class_weights_auto:
    'Balanceo automático de clases en la fase 2 (0=no, 1=sí).',
  ph2_class_weights_power:
    'Exponente para pesos de clase en la fase 2.',
  ph2_per_class_metrics:
    'Métricas por clase en la fase 2 (0=no, 1=sí).',
  ph2_save_period:
    'Guardar checkpoint cada N épocas en la fase 2.',
  ph2_dropout:
    'Tasa de dropout para regularización. Ayuda a prevenir overfitting en la fase de fine-tuning (0.0 = desactivado).',
  ph2_cos_lr:
    'Scheduler de learning rate con curva coseno (1=sí, 0=lineal). El coseno converge más suavemente al final.',
  ph2_focal_loss:
    'Usar focal loss en lugar de BCE para clasificación (1=sí, 0=no). Penaliza más los ejemplos difíciles, útil con clases desbalanceadas.',
  ph2_focal_gamma:
    'Parámetro gamma de focal loss. Valores más altos concentran el entrenamiento en ejemplos difíciles (mal clasificados).',
}
