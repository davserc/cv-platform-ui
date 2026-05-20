import { useEffect, useState } from 'react'

// ── Spritesheet config (1536×1024px, NO uniform grid) ────────────────────────
// Layout: 5 objects per row × 2 rows = 10 objects total
// Each sprite cell has internal padding + gutters between cells.
// backgroundSize: auto (render at native resolution, no scaling)
const FRAME_W = 250
const FRAME_H = 320
const START_X = 40
const START_Y = 145
const GAP_X   = 30
const GAP_Y   = 85

// ── Object catalog ────────────────────────────────────────────────────────────
// Ordered by row/col position in the spritesheet
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

// ── Phase state machine ───────────────────────────────────────────────────────
type Phase = 'idle' | 'scanning' | 'complete' | 'transition'

const PHASE_MS: Record<Phase, number> = {
  idle:       300,
  scanning:   900,
  complete:   600,
  transition: 180,
}

const SPRITE_SRC = '/sprites/waste-scanner.png'

interface Props { jobId: string }

export default function WasteScannerLoader({ jobId }: Props) {
  const [ready, setReady]   = useState(false)
  const [idx,   setIdx]     = useState(0)
  const [phase, setPhase]   = useState<Phase>('idle')

  // Verify PNG is available
  useEffect(() => {
    const img = new Image()
    img.onload  = () => setReady(true)
    img.onerror = () => setReady(false)
    img.src = SPRITE_SRC
  }, [])

  // Phase state machine
  useEffect(() => {
    if (!ready) return
    const id = setTimeout(() => {
      if (phase === 'idle')       setPhase('scanning')
      else if (phase === 'scanning') setPhase('complete')
      else if (phase === 'complete') setPhase('transition')
      else {
        setIdx(i => (i + 1) % OBJECTS.length)
        setPhase('idle')
      }
    }, PHASE_MS[phase])
    return () => clearTimeout(id)
  }, [phase, idx, ready])

  const obj  = OBJECTS[idx]
  const bgX  = START_X + obj.col * (FRAME_W + GAP_X)
  const bgY  = START_Y + obj.row * (FRAME_H + GAP_Y)

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

      {/* ── Scanner viewport ─────────────────────────────────────── */}
      <div
        className="relative overflow-hidden"
        style={{ width: FRAME_W, height: FRAME_H }}
      >
        {/* Float wrapper */}
        <div style={{ width: FRAME_W, height: FRAME_H, animation: 'float-obj 2s ease-in-out infinite' }}>
          <div
            style={{
              width: FRAME_W,
              height: FRAME_H,
              backgroundImage: `url(${SPRITE_SRC})`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: `-${bgX}px -${bgY}px`,
              imageRendering: 'pixelated',
              transform: isTransition ? 'scale(1.02)' : 'scale(1)',
              filter: isTransition
                ? 'brightness(1.4) saturate(1.2)'
                : isScanning
                  ? 'brightness(1.05)'
                  : 'none',
              opacity: isTransition ? 0.82 : 1,
              transition: 'transform 0.07s ease-out, filter 0.06s, opacity 0.06s',
            }}
          />
        </div>

        {/* CSS laser scan line */}
        {isScanning && (
          <div
            className="absolute left-0 right-0 pointer-events-none"
            style={{
              height: 4,
              background: 'linear-gradient(90deg, transparent 0%, #00f6ff 40%, #00f6ff 60%, transparent 100%)',
              filter: 'blur(1.5px)',
              boxShadow: '0 0 10px rgba(0,246,255,0.9), 0 0 22px rgba(0,246,255,0.4)',
              animation: 'scan-move 0.65s linear infinite',
            }}
          />
        )}

        {/* Completed green glow */}
        {isComplete && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(74,222,128,0.15) 0%, transparent 68%)',
              animation: 'pulse-scale 0.9s ease-in-out infinite',
            }}
          />
        )}

        {/* Transition cyan flash */}
        {isTransition && (
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'rgba(0,246,255,0.09)', mixBlendMode: 'screen' }}
          />
        )}
      </div>

      {/* ── Labels ───────────────────────────────────────────────── */}
      <p
        className="text-xs font-mono tracking-widest uppercase transition-colors duration-200"
        style={{ color: isComplete ? '#4ade80' : '#06b6d4' }}
      >
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
    </div>
  )
}
