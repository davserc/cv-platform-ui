import { useEffect, useState } from 'react'

// ── Spritesheet layout ────────────────────────────────────────────────────────
// public/sprites/waste-scanner.png — 1536×1024px — 7 cols × 10 rows
// Each source frame: 1536/7 ≈ 219px wide × 1024/10 = 102px tall (landscape 2.15:1)
// Frames: 0=INICIO · 1-4=SCAN · 5=COMPLETADO · 6=TRANSICIÓN
const COLS      = 7
const ROWS      = 10
const DISPLAY_W = 300                       // rendered width per frame
const DISPLAY_H = Math.round(DISPLAY_W * (1024 / 10) / (1536 / 7))  // ≈ 140px

// State-machine timings — NOT linear. Gives "real software" feel.
//  INICIO  SCAN×4         COMPLETADO  TRANSICIÓN
const DURATIONS = [300, 90, 90, 90, 120, 450, 120]

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

const CATEGORY_LABELS = [
  'plástico', 'metal', 'papel/cartón', 'plástico',
  'cartón', 'plástico', 'vidrio', 'metal', 'papel', 'tetra pak',
]

// Subtle rotation per scan frame — brain reads it as 3D volume
const SCAN_ROT = [-3, 2, -2, 3]

const SPRITE_SRC = '/sprites/waste-scanner.png'

interface Props { jobId: string }

export default function WasteScannerLoader({ jobId }: Props) {
  const [ready, setReady] = useState(false)
  const [item,  setItem]  = useState(0)
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    const img = new Image()
    img.onload  = () => setReady(true)
    img.onerror = () => setReady(false)
    img.src = SPRITE_SRC
  }, [])

  // State machine — advance frames, loop items
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

  const isScanning   = frame >= 1 && frame <= 4
  const isCompleted  = frame === 5
  const isTransition = frame === 6

  // Sprite position — X and Y scaled independently to preserve exact frame crop
  const bgX = -(frame * DISPLAY_W)
  const bgY = -(item  * DISPLAY_H)
  const bgW =  DISPLAY_W * COLS
  const bgH =  DISPLAY_H * ROWS

  // Per-frame transform: rotation during scan + glitch scale during transition
  const rotation = isScanning ? (SCAN_ROT[frame - 1] ?? 0) : 0
  const spriteTransform = isTransition
    ? `scale(1.02) rotate(${rotation}deg)`
    : `scale(1) rotate(${rotation}deg)`
  const spriteFilter    = isTransition ? 'brightness(1.4) saturate(1.2)' : 'none'
  const spriteOpacity   = isTransition ? 0.82 : 1

  if (!ready) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 select-none">
        <div
          className="w-10 h-10 rounded-full border-2 border-cyan-700 animate-spin"
          style={{ borderTopColor: 'transparent' }}
        />
        <p className="text-[10px] font-mono text-gray-700">Cargando escáner…</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-3 py-5 select-none">

      {/* ── Scanner viewport ─────────────────────────────────────── */}
      <div
        className="relative overflow-hidden"
        style={{ width: DISPLAY_W, height: DISPLAY_H }}
      >
        {/* Float wrapper — hologram platform feel */}
        <div style={{ width: DISPLAY_W, height: DISPLAY_H, animation: 'float-obj 2s ease-in-out infinite' }}>
          <div
            style={{
              width: DISPLAY_W,
              height: DISPLAY_H,
              backgroundImage: `url(${SPRITE_SRC})`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: `${bgX}px ${bgY}px`,
              backgroundSize: `${bgW}px ${bgH}px`,
              imageRendering: 'pixelated',
              transform: spriteTransform,
              filter: spriteFilter,
              opacity: spriteOpacity,
              transition: 'transform 0.07s ease-out, filter 0.05s, opacity 0.06s',
            }}
          />
        </div>

        {/* CSS laser line — moves top→bottom while scanning */}
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
        {isCompleted && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(74,222,128,0.14) 0%, transparent 68%)',
              animation: 'pulse-scale 0.9s ease-in-out infinite',
            }}
          />
        )}

        {/* Transition flash — cyan glitch */}
        {isTransition && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'rgba(0,246,255,0.09)', mixBlendMode: 'screen' }}
          />
        )}
      </div>

      {/* ── Labels ───────────────────────────────────────────────── */}
      <p
        className="text-xs font-mono tracking-widest uppercase transition-colors duration-200"
        style={{ color: isCompleted ? '#4ade80' : '#06b6d4' }}
      >
        {isCompleted ? '✓ ' : ''}{ITEMS[item]}
      </p>

      {isCompleted && (
        <p className="text-[10px] font-mono tracking-wide" style={{ color: '#4ade8099' }}>
          {CATEGORY_LABELS[item]} detectado
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
