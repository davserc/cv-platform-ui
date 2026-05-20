import { useEffect, useState } from 'react'

// ── Spritesheet — exact pixel offsets, no arithmetic formula ──────────────────
const FRAME_X = [220, 442, 664, 886, 1108, 1328, 1450]   // 7 columnas
const FRAME_Y = [84, 198, 310, 422, 534, 646, 758, 870, 982, 1094]  // 10 filas

const FRAME_W = 118   // ancho del viewport a 1×
const FRAME_H = 96    // alto  del viewport a 1×
const SCALE   = 1.6   // display: ~190 × 154 px

// ── Secuencia: scan loop ×2 para sensación "IA analizando" ───────────────────
const FRAME_SEQ = [
  { frame: 0, duration: 220 },
  { frame: 1, duration: 55  },
  { frame: 2, duration: 55  },
  { frame: 3, duration: 55  },
  { frame: 4, duration: 65  },
  { frame: 1, duration: 55  },
  { frame: 2, duration: 55  },
  { frame: 3, duration: 55  },
  { frame: 4, duration: 65  },
  { frame: 5, duration: 320 },
  { frame: 6, duration: 80  },
]
const OBJECT_HOLD = 120

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

  // Debug: solo ancho/alto del viewport (los offsets son exactos, no editables)
  const [dfw, setDfw] = useState(FRAME_W)
  const [dfh, setDfh] = useState(FRAME_H)

  const fw = debug ? dfw : FRAME_W
  const fh = debug ? dfh : FRAME_H
  const dw = Math.round(fw * SCALE)
  const dh = Math.round(fh * SCALE)

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
  const bgX = FRAME_X[spriteFrame]
  const bgY = FRAME_Y[item]

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
        {/* Sprite: lookup directo sin fórmula */}
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
            willChange: 'background-position',
            animation: frozen ? undefined
              : isScanning
                ? 'scan-wobble 400ms ease-in-out infinite alternate'
                : 'float-sprite 2.8s ease-in-out infinite',
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
            <span className="w-14 text-right">FRAME_W</span>
            <input type="range" min={50} max={250} value={dfw}
              onChange={e => setDfw(Number(e.target.value))}
              className="w-28 accent-cyan-500" />
            <span className="w-8 text-cyan-400">{dfw}</span>
          </label>
          <label className="flex items-center gap-2 text-[10px] font-mono text-gray-400">
            <span className="w-14 text-right">FRAME_H</span>
            <input type="range" min={30} max={200} value={dfh}
              onChange={e => setDfh(Number(e.target.value))}
              className="w-28 accent-cyan-500" />
            <span className="w-8 text-cyan-400">{dfh}</span>
          </label>
          <div className="pt-1 text-[9px] font-mono text-gray-600">
            step={step} frame={spriteFrame} item={item} · bgX={bgX} bgY={bgY}
          </div>
          <pre className="text-[9px] font-mono text-cyan-700 select-all leading-relaxed">{
`FRAME_W=${dfw}\nFRAME_H=${dfh}\nSCALE=1.6`
          }</pre>
        </div>
      )}
    </div>
  )
}
