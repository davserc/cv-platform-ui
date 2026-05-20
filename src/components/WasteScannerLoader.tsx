import { useEffect, useState } from 'react'

// ── Spritesheet: 1536×1024 — 7 cols (frames) × 10 rows (items) ───────────────
const FRAME_W   = 150
const FRAME_H   = 112
const START_X   = 225
const START_Y   = 84
const GAP_X     = 18
const GAP_Y     = 20
const SCALE     = 2

// Per-frame durations (ms) — not a fixed interval
const FRAME_SEQ = [
  { duration: 280 },  // 0 INICIO
  { duration: 90  },  // 1 SCAN_1
  { duration: 90  },  // 2 SCAN_2
  { duration: 90  },  // 3 SCAN_3
  { duration: 110 },  // 4 SCAN_4
  { duration: 420 },  // 5 COMPLETADO
  { duration: 120 },  // 6 TRANSICIÓN
]
const OBJECT_HOLD = 150   // ms between transition and next object

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
  const [item,   setItem]   = useState(0)
  const [frame,  setFrame]  = useState(0)
  const [frozen, setFrozen] = useState(false)

  // Debug overrides
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

  // Frame state machine with per-frame duration + object hold
  useEffect(() => {
    if (!ready || frozen) return
    const dur = (FRAME_SEQ[frame]?.duration ?? 120) + (frame === FRAME_SEQ.length - 1 ? OBJECT_HOLD : 0)
    const id = setTimeout(() => {
      if (frame < FRAME_SEQ.length - 1) {
        setFrame(f => f + 1)
      } else {
        setItem(i => (i + 1) % ITEMS.length)
        setFrame(0)
      }
    }, dur)
    return () => clearTimeout(id)
  }, [frame, item, ready, frozen])

  const bgX = sx + frame * (fw + gx)
  const bgY = sy + item  * (fh + gy)

  const isScanning   = frame >= 1 && frame <= 4
  const isComplete   = frame === 5
  const isTransition = frame === 6

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

      {/* ── Viewport ─────────────────────────────────────────────── */}
      <div
        style={{
          position: 'relative',
          width: dw,
          height: dh,
          overflow: 'hidden',
          imageRendering: 'pixelated',
        }}
      >
        {/* Sprite — scale(2) + float in one transform via animation */}
        <div
          style={{
            position: 'absolute',
            width: fw,
            height: fh,
            backgroundImage: `url(${SPRITE_SRC})`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: `-${bgX}px -${bgY}px`,
            imageRendering: 'pixelated',
            transformOrigin: 'top left',
            animation: frozen ? undefined : 'float-sprite 2.8s ease-in-out infinite',
            filter: isTransition ? 'brightness(1.3) saturate(1.15)' : 'none',
            opacity: isTransition ? 0.85 : 1,
            transition: 'filter 0.06s, opacity 0.06s',
          }}
        />

        {/* CSS scan line — only during ESCANEANDO frames */}
        {isScanning && (
          <div
            style={{
              position: 'absolute',
              left: 18,
              right: 18,
              height: 3,
              background: '#00f6ff',
              filter: 'blur(1px)',
              opacity: 0.9,
              boxShadow: '0 0 6px #00f6ff, 0 0 14px #00f6ff, 0 0 28px rgba(0,246,255,0.5)',
              animation: 'scan-move 720ms linear infinite, scan-pulse 180ms ease-in-out infinite alternate',
            }}
          />
        )}

        {/* Completed glow */}
        {isComplete && (
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'radial-gradient(ellipse at center, rgba(74,222,128,0.16) 0%, transparent 68%)',
            animation: 'pulse-scale 0.9s ease-in-out infinite',
          }} />
        )}

        {/* Transition flash */}
        {isTransition && (
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'rgba(0,246,255,0.07)', mixBlendMode: 'screen' }} />
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
