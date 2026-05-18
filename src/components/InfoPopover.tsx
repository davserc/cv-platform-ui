import { useState, useEffect, useRef } from 'react'

interface Props {
  description: string
}

export default function InfoPopover({ description }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <span ref={ref} className="relative inline-flex items-center">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-label="Ver descripción del campo"
        className={`shrink-0 w-3.5 h-3.5 rounded-full text-[9px] font-bold flex items-center justify-center transition-colors leading-none ${
          open
            ? 'bg-yellow-400 text-gray-900'
            : 'bg-gray-700 text-gray-500 hover:bg-yellow-300 hover:text-gray-900'
        }`}
      >
        i
      </button>

      {open && (
        <span className="absolute left-0 top-5 z-50 w-64 rounded-lg bg-yellow-50 border border-yellow-200 shadow-xl pointer-events-none">
          {/* Arrow */}
          <span className="absolute -top-1.5 left-1 w-3 h-3 bg-yellow-50 border-l border-t border-yellow-200 rotate-45 rounded-tl-sm" />
          <span className="relative block px-3 py-2.5">
            <p className="text-xs text-gray-800 leading-relaxed">{description}</p>
          </span>
        </span>
      )}
    </span>
  )
}
