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
const FRAME_X = [224, 446, 668, 890, 1153, 1334]
//               ini  sc1  sc2  sc3  comp  trans
const COMPLETE_Y_FIX = 3  // offset Y del sprite COMPLETADO vs INICIO (gdy calibrado)

// ── Row Y — medido exactamente con debug calibrator ──────────────────────────
// El spacing no es uniforme: gaps van de 81 a 100px según el objeto.
// Valores = FRAME_Y[base] + gdy(medido) → posición final exacta por fila.
const FRAME_Y = [
  111,  // 01 bottle    (96+15)
  211,  // 02 can       (188+23)
  303,  // 03 wrapper   (280+23)
  401,  // 04 cup       (372+29)
  489,  // 05 cardboard (464+25)
  581,  // 06 bag       (556+25)
  667,  // 07 glass     (648+19)
  754,  // 08 metal     (740+14)
  835,  // 09 paper     (832+3)
  920,  // 10 tetra     (924-4)
]

// ── Safe crop size ────────────────────────────────────────────────────────────
// FRAME_H=84: el row más corto del atlas es ~81px (paper).
// Con 84px el crop queda dentro de cada row sin bleeding ni divisor visible.
const FRAME_W = 160
const FRAME_H = 93
const SCALE   = 1.05  // viewport: 168×88px

const VIEWPORT_W = Math.round(FRAME_W * SCALE)  // 168
const VIEWPORT_H = Math.round(FRAME_H * SCALE)  // 88

// Per-item X corrections (medido con debug calibrator)
// Tetra pak: ROW_X_FIX previo era -4, usuario midió gdx=+8 → net = +4
const ITEM_X_FIX = [0, 0, -1, -1, -2, -2, -3, -3, -4, 4]

// ── Frame sequence ────────────────────────────────────────────────────────────
// El objeto siempre muestra frame 0 durante el escaneo — la ilusión de scan
// la genera SOLO el CSS scan line. Sin ciclar frames → sin efecto carrusel.
const FRAME_SEQ = [
  { frame: 0, duration: 250  },  // 0: INICIO    — objeto aparece
  { frame: 0, duration: 2200 },  // 1: SCANNING  — frame fijo, CSS scan activo
  { frame: 4, duration: 750  },  // 2: COMPLETADO — FRAME_X[4]=1112
  { frame: 5, duration: 560  },  // 3: TRANSICIÓN — FRAME_X[5]=1334
]
const OBJECT_HOLD = 0

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
  const bgX = FRAME_X[spriteFrame] + ITEM_X_FIX[item] + (debug ? ddx : 0)
  const bgY = FRAME_Y[item]                            + (debug ? ddy : 0)

  // Detectar estado por índice de step (no por spriteFrame — durante scan siempre es 0)
  const isScanning   = step === 1
  const isComplete   = step === 2
  const isTransition = step === 3

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
        {/* ── Sprite INICIO / SCANNING (frame 0) ─────────────────── */}
        <div
          key={item}
          style={{
            position: 'absolute',
            width: FRAME_W,
            height: FRAME_H,
            backgroundImage: `url(${SPRITE_SRC})`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: `-${FRAME_X[0] + ITEM_X_FIX[item]}px -${bgY}px`,
            imageRendering: 'pixelated',
            transformOrigin: 'top left',
            opacity: (isComplete || isTransition) ? 0 : 1,
            animation: frozen ? undefined
              : step === 0
                ? 'item-appear 200ms ease-out, idle-float 3.5s ease-in-out 200ms infinite'
                : 'idle-float 3.5s ease-in-out infinite',
            filter: GLOW,
          }}
        />

        {/* ── Sprite COMPLETADO — sin animación de fade, visible directo ── */}
        {isComplete && (
          <div
            style={{
              position: 'absolute',
              width: FRAME_W,
              height: FRAME_H,
              backgroundImage: `url(${SPRITE_SRC})`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: `-${bgX}px -${bgY + COMPLETE_Y_FIX}px`,
              imageRendering: 'pixelated',
              transformOrigin: 'top left',
              opacity: 1,
              transform: 'scale(1.05)',
              filter: GLOW,
              outline: debug ? '2px solid #4ade80' : undefined,
            }}
          />
        )}

        {/* Scan line */}
        {isScanning && (
          <div
            style={{
              position: 'absolute',
              left: 6,
              right: 6,
              height: 2,
              background: 'linear-gradient(90deg, transparent, #00f6ff 20%, #00f6ff 80%, transparent)',
              filter: 'blur(0.8px)',
              boxShadow: '0 0 6px #00f6ff, 0 0 14px #00f6ff, 0 0 28px rgba(0,246,255,0.4)',
              animation: 'scan-move 1100ms linear infinite',
            }}
          />
        )}

        {/* Completed glow */}
        {isComplete && (
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'radial-gradient(ellipse at center, rgba(74,222,128,0.18) 0%, transparent 68%)',
            animation: 'pulse-scale 0.9s ease-in-out infinite',
          }} />
        )}

        {/* ── Transición: fondo oscuro inmediato + barra cyan barre ── */}
        {isTransition && (
          <>
            {/* Fondo oscuro inmediato — cubre el recorte del COMPLETADO */}
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'rgba(0,5,10,0.96)' }} />
            {/* Barra cyan que barre de arriba a abajo */}
            <div className="absolute inset-x-0 pointer-events-none" style={{
              height: 3,
              background: 'linear-gradient(90deg, transparent 0%, #00f6ff 25%, #fff 50%, #00f6ff 75%, transparent 100%)',
              boxShadow: '0 0 8px #00f6ff, 0 0 24px rgba(0,246,255,0.7)',
              filter: 'blur(0.5px)',
              animation: 'system-wipe 460ms ease-in-out forwards',
              opacity: 0,
            }} />
            {/* Trail */}
            <div className="absolute inset-x-0 pointer-events-none" style={{
              height: 32,
              background: 'linear-gradient(180deg, rgba(0,246,255,0.08) 0%, transparent 100%)',
              animation: 'system-wipe-trail 460ms ease-in-out forwards',
              opacity: 0,
            }} />
          </>
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

          {/* Selector de STEP — para forzar COMPLETADO (step 2) y calibrar X */}
          <div className="flex gap-1 items-center">
            <span className="text-[8px] font-mono text-gray-600 w-10">step:</span>
            {['INICIO','SCAN','COMP','TRANS'].map((label, s) => (
              <button key={s}
                onClick={() => { setStep(s); setFrozen(true) }}
                className={`text-[8px] font-mono px-1.5 py-0.5 rounded border ${
                  step === s
                    ? s === 2 ? 'border-green-500 text-green-300 bg-green-950'
                              : 'border-cyan-500 text-cyan-300 bg-cyan-950'
                    : 'border-gray-700 text-gray-600 hover:text-gray-400'
                }`}>
                {label}
              </button>
            ))}
          </div>

          {/* Selector de ítem */}
          <div className="flex gap-1 flex-wrap">
            {ITEMS.map((_, i) => (
              <button key={i}
                onClick={() => { setItem(i); setStep(0); setFrozen(true) }}
                className={`text-[8px] font-mono px-1.5 py-0.5 rounded border transition-colors ${
                  item === i
                    ? 'border-cyan-500 text-cyan-300 bg-cyan-950'
                    : 'border-gray-700 text-gray-600 hover:text-gray-400'
                }`}>
                {i + 1}
              </button>
            ))}
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
            <div>step={step} frame={spriteFrame} item={item} — {ITEMS[item].name}</div>
            <div>bgX={bgX}  bgY={bgY}</div>
            {isComplete && <div className="text-green-500">COMPLETADO bgX={bgX} (FRAME_X[5]={FRAME_X[5]}+{ddx})</div>}
          </div>
          <pre className="text-[9px] font-mono text-cyan-700 select-all">{
`FRAME_X[5]=${FRAME_X[5]}\nFRAME_Y[${item}]=${FRAME_Y[item]}\ngdx=${ddx} gdy=${ddy}`
          }</pre>
        </div>
      )}
    </div>
  )
}
