import { useState } from 'react'
import type { TrainingParsed } from '../parseTrainingLog'

interface Props {
  parsed: TrainingParsed
  rawLog: string
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[9px] font-mono text-gray-600 uppercase tracking-wider">{label}</span>
      <span className="text-xs font-mono text-cyan-300">{value}</span>
    </div>
  )
}

function fmt(n: number) { return n.toFixed(3) }

export default function TrainingProgress({ parsed, rawLog }: Props) {
  const [showRaw, setShowRaw] = useState(false)

  const {
    phase, phaseEpochCurrent, phaseEpochTotal, phaseTotalEpochs,
    gpuMem, batchCurrent, batchTotal, batchPercent, speed, eta,
    losses, lastVal, completedPhases, done,
  } = parsed

  const totalEpochs = phaseTotalEpochs[0] + phaseTotalEpochs[1]
  const globalEpochsDone = completedPhases === 1
    ? phaseTotalEpochs[0] + (phaseEpochCurrent - 1)
    : phaseEpochCurrent - 1
  const globalEpochTotal = totalEpochs

  return (
    <div className="font-mono text-xs space-y-px">

      {/* ── Header: fase + epoch + GPU ──────────────────────── */}
      <div className="flex items-center justify-between bg-gray-900 px-3 py-2 rounded-t border border-gray-800">
        <div className="flex items-center gap-3">
          {phase && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
              phase === 1 ? 'bg-blue-950 text-blue-300 border border-blue-800' : 'bg-purple-950 text-purple-300 border border-purple-800'
            }`}>
              FASE {phase}
            </span>
          )}
          {phaseEpochCurrent > 0 && (
            <span className="text-gray-300">
              Epoch <span className="text-white font-bold">{phaseEpochCurrent}</span>
              <span className="text-gray-600">/{phaseEpochTotal}</span>
            </span>
          )}
          {totalEpochs > 0 && (
            <span className="text-gray-700 text-[10px]">
              (global {Math.max(0, globalEpochsDone)}/{globalEpochTotal})
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {done && <span className="text-green-400 font-bold">✓ completo</span>}
          {gpuMem && <span className="text-gray-500">GPU <span className="text-amber-400">{gpuMem}</span></span>}
        </div>
      </div>

      {/* ── Batch progress bar ──────────────────────────────── */}
      {batchTotal > 0 && (
        <div className="bg-gray-900 px-3 py-2 border-x border-gray-800 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] text-gray-500">
            <span>batch {batchCurrent}/{batchTotal}</span>
            <span className="text-gray-400">{speed} · ETA {eta}</span>
          </div>
          <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-600 rounded-full transition-all duration-500"
              style={{ width: `${batchPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* ── Losses ─────────────────────────────────────────── */}
      {losses && (
        <div className="bg-gray-900 px-3 py-2 border-x border-gray-800">
          <div className="text-[9px] text-gray-600 uppercase tracking-wider mb-1.5">Losses (batch actual)</div>
          <div className="grid grid-cols-4 gap-3">
            <Metric label="box"  value={fmt(losses.box)} />
            <Metric label="seg"  value={fmt(losses.seg)} />
            <Metric label="cls"  value={fmt(losses.cls)} />
            <Metric label="dfl"  value={fmt(losses.dfl)} />
          </div>
        </div>
      )}

      {/* ── Validación ─────────────────────────────────────── */}
      {lastVal && (
        <div className="bg-gray-900 px-3 py-2 border-x border-gray-800 border-t border-t-gray-800">
          <div className="text-[9px] text-gray-600 uppercase tracking-wider mb-1.5">Última validación</div>
          <div className="grid grid-cols-4 gap-3">
            <Metric label="mAP50"     value={fmt(lastVal.map50)} />
            <Metric label="mAP50-95"  value={fmt(lastVal.map5095)} />
            <Metric label="Precision" value={fmt(lastVal.precision)} />
            <Metric label="Recall"    value={fmt(lastVal.recall)} />
          </div>
          {/* mAP50 visual bar */}
          <div className="mt-2 flex items-center gap-2">
            <span className="text-[9px] text-gray-700 w-12">mAP50</span>
            <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-600 rounded-full"
                style={{ width: `${Math.min(lastVal.map50 * 100, 100)}%` }}
              />
            </div>
            <span className="text-[9px] text-green-500 w-8">{(lastVal.map50 * 100).toFixed(1)}%</span>
          </div>
        </div>
      )}

      {/* ── Toggle log crudo ───────────────────────────────── */}
      <div className="border border-gray-800 rounded-b overflow-hidden">
        <button
          type="button"
          onClick={() => setShowRaw(r => !r)}
          className="w-full flex items-center justify-between px-3 py-1.5 bg-gray-900 text-[10px] text-gray-600 hover:text-gray-400 transition-colors"
        >
          <span>Log completo</span>
          <span>{showRaw ? '▲' : '▼'}</span>
        </button>
        {showRaw && (
          <pre className="text-[10px] font-mono text-gray-400 whitespace-pre-wrap leading-relaxed bg-gray-950 p-3 max-h-64 overflow-auto">
            {rawLog}
          </pre>
        )}
      </div>
    </div>
  )
}
