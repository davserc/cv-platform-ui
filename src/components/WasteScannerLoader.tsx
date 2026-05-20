import { useEffect, useState } from 'react'

// ── Spritesheet: 1536×1024px — 7 cols (frames) × 10 rows (items) ─────────────
// Frames: 0=INICIO · 1-4=ESCANEANDO · 5=COMPLETADO · 6=TRANSICIÓN
const FRAME_W = 168
const FRAME_H = 124
const START_X = 236
const START_Y = 118
const GAP_X   = 19
const GAP_Y   = 11
const COLS    = 7
const SCALE   = 2   // render at 2× native for crisp pixel art

// ms per frame: INICIO · SCAN×4 · COMPLETADO · TRANSICIÓN
const DURATIONS = [300, 90, 90, 90, 120, 450, 120]

const ITEMS = [
  { name: 'Botella de Plástico', cat: 'plástico'    },
  { name: 'Lata de Aluminio',    cat: 'metal'       },
  { name: 'Envoltorio',          cat: 'papel/cartón'},
  { name: 'Vaso Descartable',   cat: 'plástico'    },
  { name: 'Cartón',              cat: 'cartón'      },
  { name: 'Bolsa Plástica',      cat: 'plástico'    },
  { name: 'Botella de Vidrio',  cat: 'vidrio'      },
  { name: 'Lata de Metal',       cat: 'metal'       },
  { name: 'Papel',               cat: 'papel'       },
  { name: 'Tetra Pak',           cat: 'tetra pak'   },
]

const SPRITE_SRC = '/sprites/waste-scanner.png'

// ── Debug slider ──────────────────────────────────────────────────────────────
function Slider({ label, value, min, max, onChange }: {
  label: string; value: number; min: number; max: number; onChange: (v: number) => void
}) {
  return (
    <label className="flex items-center gap-2 text-[10px] font-mono text-gray-400">
      <span className="w-14 text-right">{label}</span>
      <input type="range" min={min} max={max} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-28 accent-cyan-500" />
      <span className="w-8 text-cyan-400">{value}</span>
    </label>
  )
}

interface Props { jobId: string; debug?: boolean }

export default function WasteScannerLoader({ jobId, debug = false }: Props) {
  const [ready,  setReady]  = useState(false)
  const [item,   setItem]   = useState(0)       // 0..9
  const [frame,  setFrame]  = useState(0)       // 0..6
  const [frozen, setFrozen] = useState(false)

  // Debug overrides (initialised from constants)
  const [dfw, setDfw] = useState(FRAME_W)
  const [dfh, setDfh] = useState(FRAME_H)
  const [dsx, setDsx] = useState(START_X)
  const [dsy, setDsy] = useState(START_Y)
  const [dgx, setDgx] = useState(GAP_X)
  const [dgy, setDgy] = useState(GAP_Y)

  const fw = debug ? dfw : FRAME_W
  const fh = debug ? dfh : FRAME_H
  const sx = debug ? dsx : START_X
  const sy = debug ? dsy : START_Y
  const gx = debug ? dgx : GAP_X
  const gy = debug ? dgy : GAP_Y
  const dw = fw * SCALE
  const dh = fh * SCALE

  useEffect(() => {
    const img = new Image()
    img.onload  = () => setReady(true)
    img.onerror = () => setReady(false)
    img.src = SPRITE_SRC
  }, [])

  // Frame state machine
  useEffect(() => {
    if (!ready || frozen) return
    const id = setTimeout(() => {
      if (frame < COLS - 1) {
        setFrame(f => f + 1)
      } else {
        setItem(i => (i + 1) % ITEMS.length)
        setFrame(0)
      }
    }, DURATIONS[frame] ?? 120)
    return () => clearTimeout(id)
  }, [frame, item, ready, frozen])

  const isScanning   = frame >= 1 && frame <= 4
  const isComplete   = frame === 5
  const isTransition = frame === 6

  // Frame 6 (TRANSICIÓN) has wider horizontal glow — give it extra width
  const effectiveFw = isTransition ? fw + 12 : fw
  const bgX = sx + frame * (fw + gx)
  const bgY = sy + item  * (fh + gy)

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

      {/* ── Viewport — clips the 2× scaled sprite ────────────────── */}
      <div className="relative overflow-hidden"
        style={{ width: dw, height: dh }}>

        {/* Float wrapper */}
        <div style={{ width: dw, height: dh, animation: frozen ? undefined : 'float-obj 2s ease-in-out infinite' }}>
          {/* Sprite at native size, scaled 2× from top-left */}
          <div
            style={{
              width:  effectiveFw,
              height: fh,
              backgroundImage: `url(${SPRITE_SRC})`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: `-${bgX}px -${bgY}px`,
              imageRendering: 'pixelated',
              transform: `scale(${SCALE})`,
              transformOrigin: 'top left',
              filter: isTransition ? 'brightness(1.35) saturate(1.2)' : 'none',
              opacity: isTransition ? 0.84 : 1,
              transition: 'filter 0.06s, opacity 0.06s',
            }}
          />
        </div>

        {/* Completed green glow */}
        {isComplete && (
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'radial-gradient(ellipse at center, rgba(74,222,128,0.16) 0%, transparent 68%)',
            animation: 'pulse-scale 0.9s ease-in-out infinite',
          }} />
        )}

        {/* Transition flash */}
        {isTransition && (
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'rgba(0,246,255,0.08)', mixBlendMode: 'screen' }} />
        )}

        {/* Debug crop border */}
        {debug && (
          <div className="absolute inset-0 pointer-events-none"
            style={{ border: '1px dashed rgba(255,50,50,0.7)' }} />
        )}
      </div>

      {/* ── Labels ───────────────────────────────────────────────── */}
      <p className="text-xs font-mono tracking-widest uppercase transition-colors duration-200"
        style={{ color: isComplete ? '#4ade80' : '#06b6d4' }}>
        {isComplete ? '✓ ' : ''}{ITEMS[item].name}
      </p>
      {isComplete && (
        <p className="text-[10px] font-mono tracking-wide" style={{ color: '#4ade8099' }}>
          {ITEMS[item].cat} detectado
        </p>
      )}
      {isScanning && (
        <p className="text-[10px] font-mono text-gray-600 tracking-wide">
          escaneando<span className="animate-pulse">…</span>
        </p>
      )}
      <p className="text-[9px] font-mono text-gray-800">{jobId.slice(0, 8)}</p>

      {/* ── Debug panel ──────────────────────────────────────────── */}
      {debug && (
        <div className="mt-2 p-3 bg-gray-900 border border-gray-700 rounded space-y-1.5 w-60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-yellow-400">🔧 calibrador</span>
            <button onClick={() => setFrozen(f => !f)}
              className="text-[9px] font-mono border border-gray-700 rounded px-1.5 py-0.5 text-gray-400 hover:text-white">
              {frozen ? '▶ reanudar' : '⏸ pausar'}
            </button>
          </div>
          <Slider label="FRAME_W" value={dfw} min={50}  max={400} onChange={setDfw} />
          <Slider label="FRAME_H" value={dfh} min={30}  max={400} onChange={setDfh} />
          <Slider label="START_X" value={dsx} min={0}   max={500} onChange={setDsx} />
          <Slider label="START_Y" value={dsy} min={0}   max={500} onChange={setDsy} />
          <Slider label="GAP_X"   value={dgx} min={0}   max={150} onChange={setDgx} />
          <Slider label="GAP_Y"   value={dgy} min={0}   max={200} onChange={setDgy} />
          <div className="pt-1 text-[9px] font-mono text-gray-600">
            frame={frame} item={item} · bgX={sx + frame*(fw+gx)} bgY={sy + item*(fh+gy)}
          </div>
          <pre className="text-[9px] font-mono text-cyan-700 select-all leading-relaxed">{
`FRAME_W=${dfw}\nFRAME_H=${dfh}\nSTART_X=${dsx}\nSTART_Y=${dsy}\nGAP_X=${dgx}\nGAP_Y=${dgy}`
          }</pre>
        </div>
      )}
    </div>
  )
}
