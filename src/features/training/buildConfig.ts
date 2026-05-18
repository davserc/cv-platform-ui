import type { TrainConfig } from '../../api/client'
import type { FormState } from './types'

function numOpt(v: string): number | undefined {
  return v !== '' ? Number(v) : undefined
}

const PHASE_KEYS: Array<keyof FormState & keyof TrainConfig> = [
  'ph1_epochs', 'ph1_patience', 'ph1_imgsz', 'ph1_batch', 'ph1_workers',
  'ph1_freeze', 'ph1_lr0', 'ph1_lrf', 'ph1_mosaic', 'ph1_close_mosaic',
  'ph1_degrees', 'ph1_translate', 'ph1_aug_scale', 'ph1_fliplr', 'ph1_copy_paste',
  'ph1_cls', 'ph1_erasing', 'ph1_class_weights_auto', 'ph1_class_weights_power',
  'ph1_per_class_metrics', 'ph1_save_period',
  'ph2_epochs', 'ph2_patience', 'ph2_imgsz', 'ph2_batch', 'ph2_workers',
  'ph2_freeze', 'ph2_lr0', 'ph2_lrf', 'ph2_mosaic', 'ph2_close_mosaic',
  'ph2_degrees', 'ph2_translate', 'ph2_aug_scale', 'ph2_fliplr', 'ph2_copy_paste',
  'ph2_cls', 'ph2_erasing', 'ph2_class_weights_auto', 'ph2_class_weights_power',
  'ph2_per_class_metrics', 'ph2_save_period',
  'ph2_dropout', 'ph2_cos_lr', 'ph2_focal_loss', 'ph2_focal_gamma',
]

export function buildConfig(f: FormState): TrainConfig {
  const cfg: TrainConfig = {
    model: f.model,
    name: f.name,
    project: f.project,
    ...(f.dataset_source === 'gs'
      ? { dataset_gs_uri: f.dataset_gs_uri }
      : { train_dataset_url: f.train_dataset_url }),
    install_gsutil: f.install_gsutil,
    save: f.save,
  }

  if (f.device) cfg.device = f.device

  for (const key of PHASE_KEYS) {
    const v = numOpt(f[key] as string)
    if (v !== undefined) cfg[key] = v
  }

  return cfg
}
