import { useEffect, useState } from 'react'

// ── Spritesheet config ────────────────────────────────────────────────────────
// Ajustar con debug=true hasta que el recorte quede perfecto,
// luego copiar los valores aquí.
const FRAME_W = 250
const FRAME_H = 320
const START_X = 40
const START_Y = 145
const GAP_X   = 30
const GAP_Y   = 85

const OBJECTS = [
  { row: 0, col: 0, name: 'Botella de Plástico', cat: 'plástico'    },
  { row: 0, col: 1, name: 'Lata de Aluminio',    cat: 'metal'       },
  { row: 0, col: 2, name: 'Envoltorio',           cat: 'papel/cartón'},
  { row: 0, col: 3, name: 'Vaso Descartable',    cat: 'plástico'    },
  { row: 0, col: 4, name: 'Cartón',               cat: 'cartón'      },
  { row: 1, col: 0, name: 'Bolsa Plástica',       cat: 'plástico'    },
  { row: 1, col: 1, name: 'Botella de Vidrio',   cat: 'vidrio'      },
  { row: 1, col: 2, name: 'Lata de Metal',        cat: 'metal'       },
  { row: 1, col: 3, name: 'Papel',                cat: 'papel'       },
  { row: 1, col: 4, name: 'Tetra Pak',            cat: 'tetra pak'   },
] as const

type Phase = 'idle' | 'scanning' | 'complete' | 'transition'
const PHASE_MS: Record<Phase, number> = { idle: 300, scanning: 900, complete: 600, transition: 180 }
const SPRITE_SRC = '/sprites/waste-scanner.png'

// ── Debug control ─────────────────────────────────────────────────────────────
function Slider({ label, value, min, max, step = 1, onChange }: {
  label: string; value: number; min: number; max: number; step?: number
  onChange: (v: number) => void
}) {
  return (
    <label className="flex items-center gap-2 text-[10px] font-mono text-gray-400">
      <span className="w-14 text-right">{label}</span>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-28 accent-cyan-500"
      />
      <span className="w-8 text-cyan-400">{value}</span>
    </label>
  )
}

interface Props { jobId: string; debug?: boolean }

export default function WasteScannerLoader({ jobId, debug = false }: Props) {
  const [ready, setReady] = useState(false)
  const [idx,   setIdx]   = useState(0)
  const [phase, setPhase] = useState<Phase>('idle')
  const [frozen, setFrozen] = useState(false) // debug: pause cycling

  const [fw, setFw] = useState(FRAME_W)
  const [fh, setFh] = useState(FRAME_H)
  const [sx, setSx] = useState(START_X)
  const [sy, setSy] = useState(START_Y)
  const [gx, setGx] = useState(GAP_X)
  const [gy, setGy] = useState(GAP_Y)

  useEffect(() => {
    const img = new Image()
    img.onload  = () => setReady(true)
    img.onerror = () => setReady(false)
    img.src = SPRITE_SRC
  }, [])

  useEffect(() => {
    if (!ready || frozen) return
    const id = setTimeout(() => {
      if (phase === 'idle')          setPhase('scanning')
      else if (phase === 'scanning') setPhase('complete')
      else if (phase === 'complete') setPhase('transition')
      else { setIdx(i => (i + 1) % OBJECTS.length); setPhase('idle') }
    }, PHASE_MS[phase])
    return () => clearTimeout(id)
  }, [phase, idx, ready, frozen])

  const obj = OBJECTS[idx]
  const bgX = sx + obj.col * (fw + gx)
  const bgY = sy + obj.row * (fh + gy)

  const isScanning   = phase === 'scanning'
  const isComplete   = phase === 'complete'
  const isTransition = phase === 'transition'

  if (!ready) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 select-none">
        <div className="w-10 h-10 rounded-full border-2 border-cyan-700 animate-spin"
          style={{ borderTopColor: 'transparent' }} />
        <p className="text-[10px] font-mono text-gray-700">Cargando escáner…</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-3 py-5 select-none">

      {/* ── Scanner viewport ─────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ width: fw, height: fh }}>
        <div style={{ width: fw, height: fh, animation: frozen ? undefined : 'float-obj 2s ease-in-out infinite' }}>
          <div
            style={{
              width: fw,
              height: fh,
              backgroundImage: `url(${SPRITE_SRC})`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: `-${bgX}px -${bgY}px`,
              imageRendering: 'pixelated',
              transform: isTransition ? 'scale(1.02)' : 'scale(1)',
              filter: isTransition ? 'brightness(1.4) saturate(1.2)' : isScanning ? 'brightness(1.05)' : 'none',
              opacity: isTransition ? 0.82 : 1,
              transition: 'transform 0.07s ease-out, filter 0.06s, opacity 0.06s',
            }}
          />
        </div>

        {isScanning && (
          <div className="absolute left-0 right-0 pointer-events-none" style={{
            height: 4,
            background: 'linear-gradient(90deg, transparent 0%, #00f6ff 40%, #00f6ff 60%, transparent 100%)',
            filter: 'blur(1.5px)',
            boxShadow: '0 0 10px rgba(0,246,255,0.9), 0 0 22px rgba(0,246,255,0.4)',
            animation: 'scan-move 0.65s linear infinite',
          }} />
        )}
        {isComplete && (
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'radial-gradient(ellipse at center, rgba(74,222,128,0.15) 0%, transparent 68%)',
            animation: 'pulse-scale 0.9s ease-in-out infinite',
          }} />
        )}
        {isTransition && (
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'rgba(0,246,255,0.09)', mixBlendMode: 'screen' }} />
        )}

        {/* Debug grid overlay */}
        {debug && (
          <div className="absolute inset-0 pointer-events-none"
            style={{ border: '1px dashed rgba(255,0,0,0.6)' }} />
        )}
      </div>

      {/* ── Labels ───────────────────────────────────────────── */}
      <p className="text-xs font-mono tracking-widest uppercase transition-colors duration-200"
        style={{ color: isComplete ? '#4ade80' : '#06b6d4' }}>
        {isComplete ? '✓ ' : ''}{obj.name}
      </p>
      {isComplete && (
        <p className="text-[10px] font-mono tracking-wide" style={{ color: '#4ade8099' }}>
          {obj.cat} detectado
        </p>
      )}
      {isScanning && (
        <p className="text-[10px] font-mono text-gray-600 tracking-wide">
          escaneando<span className="animate-pulse">…</span>
        </p>
      )}
      <p className="text-[9px] font-mono text-gray-800">{jobId.slice(0, 8)}</p>

      {/* ── Debug panel ──────────────────────────────────────── */}
      {debug && (
        <div className="mt-2 p-3 bg-gray-900 border border-gray-700 rounded text-left space-y-1.5 w-56">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-yellow-400">🔧 calibrador</span>
            <button onClick={() => setFrozen(f => !f)}
              className="text-[9px] font-mono border border-gray-700 rounded px-1.5 py-0.5 text-gray-400 hover:text-white">
              {frozen ? '▶ reanudar' : '⏸ pausar'}
            </button>
          </div>
          <Slider label="FRAME_W" value={fw} min={50}  max={600} onChange={setFw} />
          <Slider label="FRAME_H" value={fh} min={50}  max={600} onChange={setFh} />
          <Slider label="START_X" value={sx} min={0}   max={400} onChange={setSx} />
          <Slider label="START_Y" value={sy} min={0}   max={400} onChange={setSy} />
          <Slider label="GAP_X"   value={gx} min={0}   max={200} onChange={setGx} />
          <Slider label="GAP_Y"   value={gy} min={0}   max={300} onChange={setGy} />
          <div className="mt-2 pt-2 border-t border-gray-800 text-[9px] font-mono text-gray-600 leading-relaxed">
            bgX = {bgX} · bgY = {bgY}<br/>
            obj: row={obj.row} col={obj.col}
          </div>
          <div className="text-[9px] font-mono text-gray-500 pt-1">
            copiar a WasteScannerLoader.tsx:
          </div>
          <pre className="text-[9px] font-mono text-cyan-700 leading-relaxed select-all">{
`FRAME_W=${fw}\nFRAME_H=${fh}\nSTART_X=${sx}\nSTART_Y=${sy}\nGAP_X=${gx}\nGAP_Y=${gy}`
          }</pre>
        </div>
      )}
    </div>
  )
}
