import { useEffect, useState } from 'react'

// ── Stage geometry (ORBIT_R must match the value in @keyframes orbit-item) ──
const STAGE   = 230
const CENTER  = STAGE / 2   // 115
const ORBIT_R = 78
const ITEM_PX = 44   // circle diameter
const HALF_H  = 31   // (44px circle + 4px gap + 14px label) / 2

// Delay maps each item to its starting position on the orbit.
// orbit-item starts at East (right). Delays in seconds:
//   East  →  0s     |  South → -3.5s
//   West  → -7s     |  North → -10.5s
const ITEMS = [
  { bg: '#3b82f6', glow: '#3b82f640', emoji: '🧴', label: 'Plástico', delay: -10.5 },
  { bg: '#9ca3af', glow: '#9ca3af40', emoji: '🥫', label: 'Metal',    delay:   0   },
  { bg: '#f59e0b', glow: '#f59e0b40', emoji: '📦', label: 'Cartón',   delay:  -3.5 },
  { bg: '#06b6d4', glow: '#06b6d440', emoji: '🍾', label: 'Vidrio',   delay:  -7   },
]

function CategoryBadge({ bg, glow, emoji, label }: typeof ITEMS[0]) {
  return (
    <div className="flex flex-col items-center gap-1 select-none">
      <div
        className="flex items-center justify-center rounded-full text-2xl"
        style={{
          width:  ITEM_PX,
          height: ITEM_PX,
          background: bg,
          boxShadow: `0 0 18px ${glow}, 0 2px 8px rgba(0,0,0,0.4)`,
        }}
      >
        {emoji}
      </div>
      <span className="text-[9px] font-bold tracking-wide" style={{ color: bg }}>
        {label}
      </span>
    </div>
  )
}

function AnimatedDots() {
  const [n, setN] = useState(1)
  useEffect(() => {
    const id = setInterval(() => setN(c => (c % 3) + 1), 500)
    return () => clearInterval(id)
  }, [])
  return <span className="font-light text-gray-500">{'·'.repeat(n)}</span>
}

interface Props { jobId?: string }

export default function TrainingSpinner({ jobId }: Props) {
  return (
    <div
      role="status"
      aria-label="Entrenando modelo de clasificación de residuos"
      className="flex flex-col items-center gap-7 py-12"
    >
      <div className="relative" style={{ width: STAGE, height: STAGE }}>

        {/* Outer faint ring */}
        <div className="absolute inset-0 rounded-full border border-gray-800/50" />

        {/* Orbit-path guide ring */}
        <div
          className="absolute rounded-full border border-gray-800/30"
          style={{ inset: CENTER - ORBIT_R }}
        />

        {/* Sweeping arc — fast */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            border: '2.5px solid transparent',
            borderTopColor:   '#3b82f6',
            borderRightColor: '#9ca3af60',
            animation: 'orbit-cw 1.6s linear infinite',
          }}
        />

        {/* Counter-arc — slow */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            border: '1.5px solid transparent',
            borderBottomColor: '#f59e0b50',
            borderLeftColor:   '#06b6d450',
            animation: 'orbit-ccw 2.8s linear infinite',
          }}
        />

        {/* Each item orbits independently — no shared container to sync */}
        {ITEMS.map(item => (
          <div
            key={item.label}
            className="absolute"
            style={{
              left:      CENTER - ITEM_PX / 2,
              top:       CENTER - HALF_H,
              animation: `orbit-item 14s linear ${item.delay}s infinite`,
            }}
          >
            <CategoryBadge {...item} />
          </div>
        ))}

        {/* Pulsing center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-14 h-14 rounded-full bg-gray-950 border border-gray-700 flex items-center justify-center text-2xl"
            style={{ animation: 'pulse-scale 2.4s ease-in-out infinite' }}
          >
            ♻️
          </div>
        </div>
      </div>

      <div className="text-center space-y-1.5">
        <p className="text-base font-semibold text-white tracking-tight">
          Entrenando modelo<AnimatedDots />
        </p>
        <p className="text-sm text-gray-400">
          Detectando y clasificando residuos con YOLO
        </p>
        <p className="text-xs text-gray-600">
          Este proceso puede demorar varios minutos
        </p>
        {jobId && (
          <p className="mt-2 inline-block text-xs font-mono text-blue-400 bg-blue-950/40 border border-blue-900/40 rounded px-2.5 py-0.5">
            {jobId}
          </p>
        )}
      </div>
    </div>
  )
}
