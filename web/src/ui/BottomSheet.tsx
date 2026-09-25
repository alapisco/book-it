import type { ReactNode } from 'react'

// Layout primitive: carries no identifier; the caller's content does (ADR 0002).
export function BottomSheet({ onClose, children }: { onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div role="dialog" aria-modal="true" className="relative w-full rounded-t-2xl bg-white px-5 pb-8 pt-3 shadow-xl">
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-slate-300" />
        {children}
      </div>
    </div>
  )
}
