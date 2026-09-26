import { ChevronLeft } from 'lucide-react'
import type { ReactNode } from 'react'

// wap app bar (ADR 0008). Tab roots: "BookIt · <title>". Pushed screens pass
// their own back control (which carries that screen's identifier) as `back`.
export function AppBar({ title, back }: { title: string; back?: ReactNode }) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 bg-indigo-700 px-4 text-white shadow">
      {back ?? (
        <span className="text-lg font-bold tracking-tight">
          BookIt <span className="font-normal text-indigo-200">·</span>
        </span>
      )}
      <span className="text-lg font-semibold">{title}</span>
    </header>
  )
}

export function BackIcon() {
  return <ChevronLeft size={22} strokeWidth={2} aria-hidden />
}
