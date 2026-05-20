import { useEffect, useState } from 'react'

// ── Spritesheet layout (fixed, matches the design) ───────────────────────────
// Place the spritesheet at: public/sprites/waste-scanner.png
// The component auto-detects frame size from the actual PNG dimensions.
const COLS  = 7   // frames per item: INICIO · ESC 1-4 · COMPLETADO · TRANSICIÓN
const ROWS  = 10  // items
const DISPLAY = 200  // rendered sprite size (px)

// ms each frame is held — INICIO · ESC×4 · COMPLETADO · TRANSICIÓN
const DURATIONS = [500, 200, 200, 200, 200, 900, 350]

const ITEMS = [
  'Botella de Plástico',
  'Lata de Aluminio',
  'Envoltorio',
  'Vaso Descartable',
  'Cartón',
  'Bolsa Plástica',
  'Botella de Vidrio',
  'Lata de Metal',
  'Papel',
  'Tetra Pak',
]

const FRAME_LABELS = [
  'Iniciando escáner',
  'Escaneando',
  'Analizando',
  'Procesando',
  'Clasificando',
  'Completado',
  '',
]

const SPRITE_SRC = '/sprites/waste-scanner.png'

interface Props { jobId: string }

export default function WasteScannerLoader({ jobId }: Props) {
  const [ready, setReady] = useState(false)
  const [item,  setItem]  = useState(0)
  const [frame, setFrame] = useState(0)

  // Verify the PNG exists before starting the animation
  useEffect(() => {
    const img = new Image()
    img.onload  = () => setReady(true)
    img.onerror = () => setReady(false)
    img.src = SPRITE_SRC
  }, [])

  // Animate frame by frame
  useEffect(() => {
    if (!ready) return
    const id = setTimeout(() => {
      if (frame < COLS - 1) {
        setFrame(f => f + 1)
      } else {
        setItem(i => (i + 1) % ITEMS.length)
        setFrame(0)
      }
    }, DURATIONS[frame] ?? 120)
    return () => clearTimeout(id)
  }, [frame, item, ready])

  const isScanning  = frame >= 1 && frame <= 4
  const isCompleted = frame === 5
  const label       = FRAME_LABELS[frame] ?? ''

  if (!ready) {
    // Fallback while PNG loads (or if missing)
    return (
      <div className="flex flex-col items-center gap-3 py-8 select-none">
        <div
          className="w-12 h-12 rounded-full border-2 border-cyan-600 border-t-transparent animate-spin"
          style={{ borderTopColor: 'transparent' }}
        />
        <p className="text-xs font-mono text-gray-600">Cargando escáner…</p>
        <p className="text-[9px] font-mono text-gray-800">{jobId.slice(0, 8)}</p>
      </div>
    )
  }

  // Scale X and Y independently so each frame fills DISPLAY×DISPLAY exactly,
  // regardless of whether the source frames are square or not.
  const bgX = -(frame * DISPLAY)
  const bgY = -(item  * DISPLAY)
  const bgW =  DISPLAY * COLS
  const bgH =  DISPLAY * ROWS

  return (
    <div className="flex flex-col items-center gap-3 py-5 select-none">

      {/* overflow:hidden clips the background to exactly one frame */}
      <div className="relative overflow-hidden" style={{ width: DISPLAY, height: DISPLAY }}>
        <div
          style={{
            width: DISPLAY,
            height: DISPLAY,
            backgroundImage: `url(${SPRITE_SRC})`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: `${bgX}px ${bgY}px`,
            backgroundSize: `${bgW}px ${bgH}px`,
            imageRendering: 'pixelated',
          }}
        />

        {/* Scan-line overlay during ESCANEANDO frames */}
        {isScanning && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(6,182,212,0.07) 3px,rgba(6,182,212,0.07) 4px)',
              animation: 'scan-line 1.2s linear infinite',
            }}
          />
        )}
      </div>

      {/* Item name */}
      <p
        className="text-xs font-mono tracking-widest uppercase transition-colors duration-300"
        style={{ color: isCompleted ? '#4ade80' : '#06b6d4' }}
      >
        {isCompleted ? '✓ ' : ''}{ITEMS[item]}
      </p>

      {/* Frame status */}
      {label && (
        <p className="text-[10px] font-mono text-gray-600 tracking-wide">
          {label}{isScanning && <span className="animate-pulse">…</span>}
        </p>
      )}

      {/* Job ID */}
      <p className="text-[9px] font-mono text-gray-800">{jobId.slice(0, 8)}</p>
    </div>
  )
}
