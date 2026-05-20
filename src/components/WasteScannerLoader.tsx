import { useEffect, useState } from 'react'

// ── Spritesheet config ────────────────────────────────────────────────────────
// Place the spritesheet at: public/sprites/waste-scanner.png
// Layout: 7 columns (frames) × 10 rows (items)
const FRAME_W = 128   // px width of each frame in the PNG
const FRAME_H = 128   // px height of each frame in the PNG
const DISPLAY  = 200  // rendered size in the browser (px)

const COLS = 7
const scale = DISPLAY / FRAME_W

// ms each frame is shown
const DURATIONS = [350, 110, 110, 110, 110, 580, 220]

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

interface Props { jobId: string }

export default function WasteScannerLoader({ jobId }: Props) {
  const [item, setItem] = useState(0)
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    const id = setTimeout(() => {
      if (frame < COLS - 1) {
        setFrame(f => f + 1)
      } else {
        setItem(i => (i + 1) % ITEMS.length)
        setFrame(0)
      }
    }, DURATIONS[frame] ?? 120)
    return () => clearTimeout(id)
  }, [frame, item])

  const bgX = -(frame * FRAME_W * scale)
  const bgY  = -(item  * FRAME_H * scale)
  const bgW  = FRAME_W * COLS        * scale
  const bgH  = FRAME_H * ITEMS.length * scale

  const isScanning   = frame >= 1 && frame <= 4
  const isCompleted  = frame === 5
  const label        = FRAME_LABELS[frame] ?? ''

  return (
    <div className="flex flex-col items-center gap-3 py-5 select-none">

      {/* Scanner frame */}
      <div className="relative" style={{ width: DISPLAY, height: DISPLAY }}>
        <div
          style={{
            width: DISPLAY,
            height: DISPLAY,
            backgroundImage: 'url(/sprites/waste-scanner.png)',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: `${bgX}px ${bgY}px`,
            backgroundSize: `${bgW}px ${bgH}px`,
            imageRendering: 'pixelated',
          }}
        />

        {/* Scan line overlay while scanning */}
        {isScanning && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(6,182,212,0.06) 3px, rgba(6,182,212,0.06) 4px)',
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

      {/* Status label */}
      {label && (
        <p className="text-[10px] font-mono text-gray-600 tracking-wide">
          {label}
          {isScanning && <span className="animate-pulse">…</span>}
        </p>
      )}

      {/* Job ID */}
      <p className="text-[9px] font-mono text-gray-800">
        {jobId.slice(0, 8)}
      </p>
    </div>
  )
}
