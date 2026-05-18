import { useState } from 'react'

interface Props {
  title: string
  badge?: string
  defaultOpen?: boolean
  children: React.ReactNode
}

export default function CollapsibleSection({ title, badge, defaultOpen = false, children }: Props) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section className="border border-gray-800 rounded-lg">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 w-full px-4 py-3 text-left bg-gray-900/60 hover:bg-gray-900"
      >
        <span className="text-sm font-medium text-gray-300">{title}</span>
        {badge && (
          <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">{badge}</span>
        )}
        <span className="ml-auto text-gray-500 text-xs">{open ? '▲' : '▼'}</span>
      </button>
      {open && children}
    </section>
  )
}
