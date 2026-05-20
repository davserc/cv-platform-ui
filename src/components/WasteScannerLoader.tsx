import { useEffect, useState } from 'react'

// ── Spritesheet layout ─────────────────────────────────────────────────────────
const FRAME_W = 122
const FRAME_H = 92
const START_X = 252
const START_Y = 106
const GAP_X   = 46
const GAP_Y   = 40
const SCALE   = 1.45

// Crop: show only the useful zone inside each cell (trims padding/labels/pedestal)
const CROP_X = 28   // px from cell left edge
const CROP_Y = 18   // px from cell top edge
const CROP_W = 92   // visible width at 1×
const CROP_H = 82   // visible height at 1×

// ── Frame sequence — sprite column index + duration (ms) ─────────────────────
// Scan loop runs twice to give "el sistema está analizando" feel
const FRAME_SEQ = [
  { frame: 0, duration: 220 },  // INICIO
  { frame: 1, duration: 55  },  // SCAN_1
  { frame: 2, duration: 55  },  // SCAN_2
  { frame: 3, duration: 55  },  // SCAN_3
  { frame: 4, duration: 65  },  // SCAN_4
  { frame: 1, duration: 55  },  // SCAN_1 (segundo loop)
  { frame: 2, duration: 55  },  // SCAN_2
  { frame: 3, duration: 55  },  // SCAN_3
  { frame: 4, duration: 65  },  // SCAN_4
  { frame: 5, duration: 340 },  // COMPLETADO
  { frame: 6, duration: 80  },  // TRANSICIÓN
]
const OBJECT_HOLD = 120   // ms entre transición y siguiente objeto

const ITEMS = [
  { name: 'Botella de Plástico', cat: 'plástico'    },
  { name: 'Lata de Aluminio',    cat: 'metal'       },
  { name: 'Envoltorio',          cat: 'papel/cartón'},
  { name: 'Vaso Descartable',    cat: 'plástico'    },
  { name: 'Cartón',              cat: 'cartón'      },
  { name: 'Bolsa Plástica',      cat: 'plástico'    },
  { name: 'Botella de Vidrio',   cat: 'vidrio'      },
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
  const [step,   setStep]   = useState(0)   // índice en FRAME_SEQ
  const [frozen, setFrozen] = useState(false)

  // Debug overrides
  const [dfw, setDfw] = useState(FRAME_W)
  const [dfh, setDfh] = useState(FRAME_H)
  const [dsx, setDsx] = useState(START_X)
  const [dsy, setDsy] = useState(START_Y)
  const [dgx, setDgx] = useState(GAP_X)
  const [dgy, setDgy] = useState(GAP_Y)
  const [dcx, setDcx] = useState(CROP_X)
  const [dcy, setDcy] = useState(CROP_Y)
  const [dcw, setDcw] = useState(CROP_W)
  const [dch, setDch] = useState(CROP_H)

  const fw    = debug ? dfw : FRAME_W
  const fh    = debug ? dfh : FRAME_H
  const sx    = debug ? dsx : START_X
  const sy    = debug ? dsy : START_Y
  const gx    = debug ? dgx : GAP_X
  const gy    = debug ? dgy : GAP_Y
  const cropX = debug ? dcx : CROP_X
  const cropY = debug ? dcy : CROP_Y
  const cropW = debug ? dcw : CROP_W
  const cropH = debug ? dch : CROP_H

  const dw = Math.round(cropW * SCALE)
  const dh = Math.round(cropH * SCALE)

  useEffect(() => {
    const img = new Image()
    img.onload  = () => setReady(true)
    img.onerror = () => setReady(false)
    img.src = SPRITE_SRC
  }, [])

  // State machine con per-step duration + hold entre objetos
  useEffect(() => {
    if (!ready || frozen) return
    const isLast = step === FRAME_SEQ.length - 1
    const dur = FRAME_SEQ[step].duration + (isLast ? OBJECT_HOLD : 0)
    const id = setTimeout(() => {
      if (!isLast) {
        setStep(s => s + 1)
      } else {
        setItem(i => (i + 1) % ITEMS.length)
        setStep(0)
      }
    }, dur)
    return () => clearTimeout(id)
  }, [step, item, ready, frozen])

  const spriteFrame = FRAME_SEQ[step].frame
  const bgX = sx + spriteFrame * (fw + gx) + cropX
  const bgY = sy + item * (fh + gy) + cropY

  const isScanning   = spriteFrame >= 1 && spriteFrame <= 4
  const isComplete   = spriteFrame === 5
  const isTransition = spriteFrame === 6

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
        {/* Sprite — crop window + scale via transformOrigin top-left */}
        <div
          style={{
            position: 'absolute',
            width: cropW,
            height: cropH,
            backgroundImage: `url(${SPRITE_SRC})`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: `-${bgX}px -${bgY}px`,
            imageRendering: 'pixelated',
            transformOrigin: 'top left',
            animation: frozen ? undefined
              : isScanning
                ? 'scan-wobble 400ms ease-in-out infinite alternate'
                : 'float-sprite 2.8s ease-in-out infinite',
            filter: isTransition ? 'brightness(1.3) saturate(1.15)' : 'none',
            opacity: isTransition ? 0.85 : 1,
            transition: 'filter 0.06s, opacity 0.06s',
          }}
        />

        {/* Scan line — solo durante frames ESCANEANDO */}
        {isScanning && (
          <div
            style={{
              position: 'absolute',
              left: 10,
              right: 10,
              height: 2,
              background: '#00f6ff',
              filter: 'blur(0.5px)',
              boxShadow: '0 0 4px #00f6ff, 0 0 10px #00f6ff, 0 0 20px rgba(0,246,255,0.4)',
              animation: 'scan-move 600ms linear infinite',
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
          <Slider label="START_X" value={dsx} min={0}   max={600} onChange={setDsx} />
          <Slider label="START_Y" value={dsy} min={0}   max={600} onChange={setDsy} />
          <Slider label="GAP_X"   value={dgx} min={0}   max={150} onChange={setDgx} />
          <Slider label="GAP_Y"   value={dgy} min={0}   max={200} onChange={setDgy} />
          <Slider label="CROP_X"  value={dcx} min={0}   max={150} onChange={setDcx} />
          <Slider label="CROP_Y"  value={dcy} min={0}   max={150} onChange={setDcy} />
          <Slider label="CROP_W"  value={dcw} min={20}  max={300} onChange={setDcw} />
          <Slider label="CROP_H"  value={dch} min={20}  max={300} onChange={setDch} />
          <div className="pt-1 text-[9px] font-mono text-gray-600">
            step={step} frame={spriteFrame} item={item} · bgX={bgX} bgY={bgY}
          </div>
          <pre className="text-[9px] font-mono text-cyan-700 select-all leading-relaxed">{
`FRAME_W=${dfw}\nFRAME_H=${dfh}\nSTART_X=${dsx}\nSTART_Y=${dsy}\nGAP_X=${dgx}\nGAP_Y=${dgy}\nCROP_X=${dcx}\nCROP_Y=${dcy}\nCROP_W=${dcw}\nCROP_H=${dch}`
          }</pre>
        </div>
      )}
    </div>
  )
}
