export interface TrainingLosses {
  box: number
  seg: number
  cls: number
  dfl: number
}

export interface ValidationMetrics {
  precision: number
  recall: number
  map50: number
  map5095: number
}

export interface TrainingParsed {
  // Phase context
  phase: 1 | 2 | null        // current phase running
  phaseEpochCurrent: number  // epoch within current phase (1-based)
  phaseEpochTotal: number    // total epochs for this phase
  phaseTotalEpochs: [number, number]  // [ph1Total, ph2Total]

  // Batch progress (within current epoch)
  gpuMem: string
  batchCurrent: number
  batchTotal: number
  batchPercent: number
  speed: string   // "2.5 it/s" or "1.2 s/it"
  eta: string     // "<1:48"

  // Running losses (latest batch)
  losses: TrainingLosses | null

  // Last completed epoch validation
  lastVal: ValidationMetrics | null

  // Overall completion
  completedPhases: number  // 0, 1, or 2
  done: boolean
}

// Strip ANSI/VT100 escape sequences that YOLO writes for in-place line updates.
// The log file contains literal ESC bytes (\x1b) followed by [K (erase-to-EOL)
// or other CSI sequences. Remove all of them so regexes can match cleanly.
function clean(line: string): string {
  return line
    .replace(/\x1b\[[0-9;]*[A-Za-z]/g, '')  // CSI sequences: ESC [ ... letter
    .replace(/\x1b[()][AB012]/g, '')          // charset sequences
    .replace(/\x1b./g, '')                    // any remaining ESC + char
    .replace(/\[K/g, '')                      // stray [K without ESC
    .replace(/\r/g, '')
}

// Batch progress line pattern:
// "        1/3       8.2G      1.238      2.749      10.5       1.42    0    29   896: 8% ━── 10/120 2.5it/s 11.4s<44.6s"
const BATCH_RE = /^\s*(\d+)\/(\d+)\s+([\d.]+G)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+).*?(\d+)%.*?(\d+)\/(\d+)\s+([\d.]+\s*(?:it\/s|s\/it)).*?<([\S]+)/

// Validation line pattern:
// "                   all    765   1540   0.15   0.169   0.0789   0.0484   0.216   0.159   0.0714   0.0394"
const VAL_RE = /^\s+all\s+\d+\s+\d+\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/

// Phase header pattern: "=== FASE 1: backbone frozen, 3 epochs ==="
const PHASE_RE = /=== FASE (\d+):.*?(\d+) epochs/

export function parseTrainingLog(raw: string): TrainingParsed {
  const result: TrainingParsed = {
    phase: null,
    phaseEpochCurrent: 0,
    phaseEpochTotal: 0,
    phaseTotalEpochs: [0, 0],
    gpuMem: '',
    batchCurrent: 0,
    batchTotal: 0,
    batchPercent: 0,
    speed: '',
    eta: '',
    losses: null,
    lastVal: null,
    completedPhases: 0,
    done: false,
  }

  if (!raw.trim()) return result

  const lines = raw.split('\n').map(clean)

  // Pass 1: detect phase headers and find which phase is currently running
  let lastPhase = 0
  for (const line of lines) {
    const m = line.match(PHASE_RE)
    if (m) {
      const ph = parseInt(m[1])
      const epochs = parseInt(m[2])
      if (ph === 1) result.phaseTotalEpochs[0] = epochs
      if (ph === 2) result.phaseTotalEpochs[1] = epochs
      lastPhase = ph
    }
  }
  result.phase = lastPhase > 0 ? (lastPhase as 1 | 2) : null

  // Pass 2: find the LAST batch line and LAST validation line
  // Also track completed phases (phase 1 is done when we see phase 2 header)
  let lastBatch: RegExpMatchArray | null = null
  let lastVal: RegExpMatchArray | null = null
  let seenPhases = new Set<number>()

  for (const line of lines) {
    const pm = line.match(PHASE_RE)
    if (pm) seenPhases.add(parseInt(pm[1]))

    const bm = line.match(BATCH_RE)
    if (bm) lastBatch = bm

    const vm = line.match(VAL_RE)
    if (vm) lastVal = vm
  }

  // Phase 1 is complete once we've seen phase 2 header
  result.completedPhases = seenPhases.has(2) ? 1 : 0

  // Check if training is done (both phases ran validation)
  // Heuristic: if last phase's epochs match completed + done marker
  if (lastBatch) {
    const epochCurrent = parseInt(lastBatch[1])
    const epochTotal = parseInt(lastBatch[2])
    if (lastPhase === 2 && epochCurrent === epochTotal && epochTotal > 0) {
      // Check if we see a final validation after epoch total
      // Approximate: if last batch is 100% and epoch = total
      const pct = parseInt(lastBatch[8])
      if (pct >= 99) result.done = true
    }
  }

  // Extract batch progress
  if (lastBatch) {
    result.phaseEpochCurrent = parseInt(lastBatch[1])
    result.phaseEpochTotal   = parseInt(lastBatch[2])
    result.gpuMem            = lastBatch[3]
    result.losses = {
      box: parseFloat(lastBatch[4]),
      seg: parseFloat(lastBatch[5]),
      cls: parseFloat(lastBatch[6]),
      dfl: parseFloat(lastBatch[7]),
    }
    result.batchPercent  = parseInt(lastBatch[8])
    result.batchCurrent  = parseInt(lastBatch[9])
    result.batchTotal    = parseInt(lastBatch[10])
    result.speed         = lastBatch[11].trim()
    result.eta           = lastBatch[12].trim()
  } else {
    // Use phase header epochs if no batch line yet
    result.phaseEpochTotal = result.phase
      ? result.phaseTotalEpochs[(result.phase as number) - 1]
      : 0
  }

  // Extract validation metrics
  if (lastVal) {
    result.lastVal = {
      precision: parseFloat(lastVal[1]),
      recall:    parseFloat(lastVal[2]),
      map50:     parseFloat(lastVal[3]),
      map5095:   parseFloat(lastVal[4]),
    }
  }

  return result
}
