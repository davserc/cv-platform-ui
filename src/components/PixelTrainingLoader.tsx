import { useEffect, useState } from 'react'

const COLS = 20
const ROWS = 7

const PALETTE = [
  '#1e3a5f', '#3b82f6', '#60a5fa', // azul — plástico
  '#374151', '#6b7280', '#9ca3af', // gris — metal
  '#78350f', '#d97706', '#f59e0b', // ámbar — cartón
  '#164e63', '#0891b2', '#06b6d4', // cyan — vidrio
]
const EMPTY = '#0d1117'

const MSGS = [
  'Iniciando instancia GPU',
  'Estableciendo conexión SSH',
  'Verificando YOLO 11',
  'Descargando dataset',
  'Preparando configuración',
  'Calculando class weights',
  'Esperando primer epoch',
]

function rndColor() {
  return PALETTE[Math.floor(Math.random() * PALETTE.length)]
}

function initGrid() {
  return Array.from({ length: ROWS * COLS }, () =>
    Math.random() > 0.55 ? rndColor() : EMPTY
  )
}

interface Props { jobId: string }

export default function PixelTrainingLoader({ jobId }: Props) {
  const [cells, setCells] = useState<string[]>(initGrid)
  const [msgIdx, setMsgIdx] = useState(0)
  const [typed, setTyped] = useState('')
  const [cursorOn, setCursorOn] = useState(true)

  // Pixel noise animation
  useEffect(() => {
    const id = setInterval(() => {
      setCells(prev => {
        const next = [...prev]
        const flips = 2 + Math.floor(Math.random() * 4)
        for (let i = 0; i < flips; i++) {
          const idx = Math.floor(Math.random() * next.length)
          next[idx] = Math.random() > 0.45 ? rndColor() : EMPTY
        }
        return next
      })
    }, 90)
    return () => clearInterval(id)
  }, [])

  // Typewriter
  useEffect(() => {
    const msg = MSGS[msgIdx]
    if (typed.length < msg.length) {
      const id = setTimeout(() => setTyped(msg.slice(0, typed.length + 1)), 42)
      return () => clearTimeout(id)
    }
    const id = setTimeout(() => {
      setMsgIdx(i => (i + 1) % MSGS.length)
      setTyped('')
    }, 1600)
    return () => clearTimeout(id)
  }, [typed, msgIdx])

  // Cursor blink
  useEffect(() => {
    const id = setInterval(() => setCursorOn(v => !v), 520)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex flex-col items-center gap-4 py-5 select-none">

      {/* Pixel grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${COLS}, 13px)`,
          gap: 2,
          padding: 6,
          background: '#0d1117',
          borderRadius: 6,
          border: '1px solid #1f2937',
        }}
      >
        {cells.map((color, i) => (
          <div
            key={i}
            style={{ width: 13, height: 13, background: color, transition: 'background 0.12s' }}
          />
        ))}
      </div>

      {/* Terminal typewriter */}
      <div
        className="font-mono text-xs w-full rounded px-4 py-2.5"
        style={{ background: '#0d1117', border: '1px solid #1f2937' }}
      >
        <span style={{ color: '#4ade80', opacity: 0.5 }}>{'› '}</span>
        <span style={{ color: '#4ade80' }}>{typed}</span>
        <span style={{ color: '#4ade80', visibility: cursorOn ? 'visible' : 'hidden' }}>█</span>
      </div>

      {/* Job ID pill */}
      <p className="text-[10px] font-mono text-gray-700">
        job <span className="text-gray-600">{jobId.slice(0, 8)}…</span>
      </p>
    </div>
  )
}
