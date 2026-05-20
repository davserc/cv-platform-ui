import { useEffect, useState } from 'react'

// ── Spritesheet structure (1536×1024) ─────────────────────────────────────────
//
//  Left labels area: ~175px
//  7 columns × ~222px wide (TRANSICIÓN col is narrower, ~118px)
//  Top header:        ~85px
//  10 rows  × ~88px tall
//  *** VISUAL DIVIDER between row 4 (cardboard) and row 5 (bag): +32px ***
//
//  This divider is the root cause of vertical drift in all previous iterations.
//  Rows 0-4 and rows 5-9 are two independent sections; uniform spacing fails.
//
// ── Column X — left edge of safe crop zone per frame ─────────────────────────
const FRAME_X = [224, 446, 668, 890, 1112, 1334, 1452]
//               ini  sc1  sc2  sc3  sc4   comp  trans
//               |←—— 222px ——→|×5         |118px|

// ── Row Y — top edge of safe crop zone per item ──────────────────────────────
// Section A (rows 0-4): base=96, step=88
// Section B (rows 5-9): base=96 + 4×88 + 32(divider) + 88 = 568, step=88
const FRAME_Y = [
   96,  // 01 bottle
  184,  // 02 can       (+88)
  272,  // 03 wrapper   (+88)
  360,  // 04 cup       (+88)
  448,  // 05 cardboard (+88)
  568,  // 06 bag       (+88 +32 DIVIDER)
  656,  // 07 glass     (+88)
  744,  // 08 metal     (+88)
  832,  // 09 paper     (+88)
  920,  // 10 tetra     (+88)
]

// ── Safe crop size ────────────────────────────────────────────────────────────
// Each cell is ~222×88px. Safe crop trims borders/pedestal/label bleed.
const FRAME_W = 160   // 222 - 2×31px margin = 160
const FRAME_H = 86    // más alto para capturar objetos como botella vidrio y papel
const SCALE   = 1.05  // viewport: 168×90px

const VIEWPORT_W = Math.round(FRAME_W * SCALE)  // 168
const VIEWPORT_H = Math.round(FRAME_H * SCALE)  // 90

// Per-row horizontal drift fix (lower rows shift slightly left in the PNG)
const ROW_X_FIX = [0, 0, -1, -1, -2, -2, -3, -3, -4, -4]

// ── Frame sequence ────────────────────────────────────────────────────────────
const FRAME_SEQ = [
  { frame: 0, duration: 220 },
  { frame: 1, duration: 75  },
  { frame: 2, duration: 75  },
  { frame: 3, duration: 75  },
  { frame: 4, duration: 90  },
  { frame: 1, duration: 75  },
  { frame: 2, duration: 75  },
  { frame: 3, duration: 75  },
  { frame: 4, duration: 90  },
  { frame: 5, duration: 280 },
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
const GLOW = 'drop-shadow(0 0 4px rgba(0,246,255,.15)) drop-shadow(0 0 10px rgba(0,246,255,.12))'

interface Props { jobId: string; debug?: boolean }

export default function WasteScannerLoader({ jobId, debug = false }: Props) {
  const [ready,  setReady]  = useState(false)
  const [item,   setItem]   = useState(0)
  const [step,   setStep]   = useState(0)
  const [frozen, setFrozen] = useState(false)

  // Debug: ajuste global de offset (no modifica W/H — eso rompería el crop)
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
  const bgX = FRAME_X[spriteFrame] + ROW_X_FIX[item] + (debug ? ddx : 0)
  const bgY = FRAME_Y[item]                           + (debug ? ddy : 0)

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
          opacity: 0.92,
        }}
      >
        {/* Sprite: key={item} fuerza remount en cada cambio → item-appear se dispara */}
        <div
          key={item}
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
            // Durante transición: invisible → el flash del overlay oculta el swap
            opacity: isTransition ? 0 : 1,
            animation: frozen || isTransition ? undefined
              : isScanning
                ? 'scan-wobble 700ms ease-in-out infinite alternate'
                : step === 0
                  ? 'item-appear 220ms ease-out, idle-float 3.5s ease-in-out 220ms infinite'
                  : 'idle-float 3.5s ease-in-out infinite',
            filter: GLOW,
            transition: 'opacity 0.04s',
          }}
        />

        {/* Scan line */}
        {isScanning && (
          <div
            style={{
              position: 'absolute',
              left: 8,
              right: 8,
              height: 2,
              background: '#00f6ff',
              filter: 'blur(0.5px)',
              boxShadow: '0 0 4px #00f6ff, 0 0 10px #00f6ff, 0 0 18px rgba(0,246,255,0.35)',
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

        {/* Transition: flash oscuro que oculta completamente el swap de objeto */}
        {isTransition && (
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'rgba(0,8,12,0.96)' }} />
        )}

        {/* Brief cyan flare al inicio de transición */}
        {isTransition && (
          <div className="absolute inset-0 pointer-events-none"
            style={{
              background: 'rgba(0,246,255,0.12)',
              mixBlendMode: 'screen',
              animation: 'transition-flare 100ms ease-out forwards',
            }}
          />
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
        <div className="mt-2 p-3 bg-gray-900 border border-gray-700 rounded space-y-2 w-64">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-yellow-400">🔧 calibrador</span>
            <button onClick={() => setFrozen(f => !f)}
              className="text-[9px] font-mono border border-gray-700 rounded px-1.5 py-0.5 text-gray-400 hover:text-white">
              {frozen ? '▶ reanudar' : '⏸ pausar'}
            </button>
          </div>
          <label className="flex items-center gap-2 text-[10px] font-mono text-gray-400">
            <span className="w-16 text-right">global X</span>
            <input type="range" min={-40} max={40} value={ddx}
              onChange={e => setDdx(Number(e.target.value))}
              className="w-28 accent-cyan-500" />
            <span className="w-8 text-cyan-400">{ddx > 0 ? `+${ddx}` : ddx}</span>
          </label>
          <label className="flex items-center gap-2 text-[10px] font-mono text-gray-400">
            <span className="w-16 text-right">global Y</span>
            <input type="range" min={-40} max={40} value={ddy}
              onChange={e => setDdy(Number(e.target.value))}
              className="w-28 accent-cyan-500" />
            <span className="w-8 text-cyan-400">{ddy > 0 ? `+${ddy}` : ddy}</span>
          </label>
          <div className="pt-1 border-t border-gray-800 text-[9px] font-mono text-gray-600 space-y-0.5">
            <div>frame={spriteFrame} step={step} item={item}/{ITEMS[item].name}</div>
            <div>bgX={bgX} ({FRAME_X[spriteFrame]}+{ROW_X_FIX[item]}+{ddx})</div>
            <div>bgY={bgY} ({FRAME_Y[item]}+{ddy})</div>
            <div className="text-amber-600">
              {item < 5 ? '▲ sección A (sin divisor)' : '▼ sección B (post-divisor +32px)'}
            </div>
          </div>
          <pre className="text-[9px] font-mono text-cyan-700 select-all">{
`FRAME_X[${spriteFrame}]=${FRAME_X[spriteFrame]}\nFRAME_Y[${item}]=${FRAME_Y[item]}\ngdx=${ddx} gdy=${ddy}`
          }</pre>
        </div>
      )}
    </div>
  )
}
