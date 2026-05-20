import { useEffect, useState } from 'react'

// ── Spritesheet — exact pixel offsets per cell ────────────────────────────────
const FRAME_X = [246, 468, 690, 912, 1134, 1355, 1456]   // 7 columnas
// Y medidos exactamente — el atlas no tiene spacing constante
const FRAME_Y = [
   96,  // 01 bottle
  205,  // 02 can
  316,  // 03 wrapper
  427,  // 04 cup
  541,  // 05 cardboard
  652,  // 06 bag
  764,  // 07 glass
  875,  // 08 metal
  986,  // 09 paper
 1098,  // 10 tetra
]

// Compensación horizontal por fila — las filas bajas tienen drift acumulativo
const ROW_X_FIX = [0, 0, -1, -1, -2, -2, -3, -3, -4, -4]

const FRAME_W = 102   // safe crop width  a 1×
const FRAME_H = 84    // safe crop height a 1×
const SCALE   = 1.55  // viewport: ~158 × 130 px

const VIEWPORT_W = Math.round(FRAME_W * SCALE)
const VIEWPORT_H = Math.round(FRAME_H * SCALE)

// Correcciones por frame — el atlas no es perfectamente uniforme
const FRAME_OFFSET_FIX = [
  { x:  0, y: 0 },  // inicio
  { x: -2, y: 0 },  // scan1
  { x: -1, y: 0 },  // scan2
  { x: -1, y: 0 },  // scan3
  { x: -2, y: 0 },  // scan4
  { x: -4, y: 0 },  // completed
  { x: -8, y: 0 },  // transition
]

// ── Secuencia: scan loop ×2 ───────────────────────────────────────────────────
const FRAME_SEQ = [
  { frame: 0, duration: 320 },
  { frame: 1, duration: 90  },
  { frame: 2, duration: 90  },
  { frame: 3, duration: 90  },
  { frame: 4, duration: 110 },
  { frame: 1, duration: 90  },
  { frame: 2, duration: 90  },
  { frame: 3, duration: 90  },
  { frame: 4, duration: 110 },
  { frame: 5, duration: 420 },
  { frame: 6, duration: 100 },
]
const OBJECT_HOLD = 180

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

interface Props { jobId: string; debug?: boolean }

export default function WasteScannerLoader({ jobId, debug = false }: Props) {
  const [ready,  setReady]  = useState(false)
  const [item,   setItem]   = useState(0)
  const [step,   setStep]   = useState(0)
  const [frozen, setFrozen] = useState(false)

  // Debug: ajuste global de offset sobre los valores exactos
  const [ddx, setDdx] = useState(0)
  const [ddy, setDdy] = useState(0)

  useEffect(() => {
    const img = new Image()
    img.onload  = () => setReady(true)
    img.onerror = () => setReady(false)
    img.src = SPRITE_SRC
  }, [])

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
  const fix = FRAME_OFFSET_FIX[spriteFrame]
  const bgX = FRAME_X[spriteFrame] + fix.x + ROW_X_FIX[item] + (debug ? ddx : 0)
  const bgY = FRAME_Y[item]                                    + (debug ? ddy : 0)

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
          width: VIEWPORT_W,
          height: VIEWPORT_H,
          overflow: 'hidden',
          imageRendering: 'pixelated',
        }}
      >
        {/* Sprite: safe crop + scale interno */}
        <div
          style={{
            position: 'absolute',
            width: FRAME_W,
            height: FRAME_H,
            backgroundImage: `url(${SPRITE_SRC})`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: `-${bgX}px -${bgY}px`,
            imageRendering: 'pixelated',
            transformOrigin: 'top left',
            willChange: 'background-position, transform',
            animation: frozen ? undefined
              : isScanning
                ? 'scan-wobble 700ms ease-in-out infinite alternate'
                : 'idle-float 3.5s ease-in-out infinite',
            filter: isTransition ? 'brightness(1.3) saturate(1.15)' : 'none',
            opacity: isTransition ? 0.85 : 1,
            transition: 'filter 0.06s, opacity 0.06s',
          }}
        />

        {/* Scan line */}
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
              animation: 'scan-move 900ms linear infinite',
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
          <label className="flex items-center gap-2 text-[10px] font-mono text-gray-400">
            <span className="w-14 text-right">offset X</span>
            <input type="range" min={-30} max={30} value={ddx}
              onChange={e => setDdx(Number(e.target.value))}
              className="w-28 accent-cyan-500" />
            <span className="w-8 text-cyan-400">{ddx > 0 ? `+${ddx}` : ddx}</span>
          </label>
          <label className="flex items-center gap-2 text-[10px] font-mono text-gray-400">
            <span className="w-14 text-right">offset Y</span>
            <input type="range" min={-30} max={30} value={ddy}
              onChange={e => setDdy(Number(e.target.value))}
              className="w-28 accent-cyan-500" />
            <span className="w-8 text-cyan-400">{ddy > 0 ? `+${ddy}` : ddy}</span>
          </label>
          <div className="pt-1 text-[9px] font-mono text-gray-600">
            step={step} frame={spriteFrame} item={item}
            · fix=({fix.x},{fix.y}) · bg=({bgX},{bgY})
          </div>
          <pre className="text-[9px] font-mono text-cyan-700 select-all leading-relaxed">{
`FRAME_X[${spriteFrame}]=${FRAME_X[spriteFrame]}\nFRAME_Y[${item}]=${FRAME_Y[item]}\ndx=${ddx} dy=${ddy}`
          }</pre>
        </div>
      )}
    </div>
  )
}
