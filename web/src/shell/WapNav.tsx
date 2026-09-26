import { useState } from 'react'
import { NavLink } from 'react-router'

const link = ({ isActive }: { isActive: boolean }) =>
  `rounded px-3 py-3 text-base ${isActive ? 'bg-indigo-50 font-semibold text-indigo-700' : 'text-slate-700'}`

export function WapNav() {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
  return (
    <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3">
      <button data-testid="nav.menu.toggle" onClick={() => setOpen(true)} className="text-slate-700">
        ☰ Menu
      </button>
      <span className="font-bold text-indigo-700">BookIt</span>
      {open && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={close} />
          <nav data-testid="nav.menu.drawer" className="absolute inset-y-0 left-0 flex w-64 flex-col gap-1 bg-white p-4 shadow-xl">
            <button data-testid="nav.menu.close" onClick={close} className="mb-4 self-end text-slate-500">
              ✕ Close
            </button>
            <NavLink data-testid="nav.schedule.link" to="/schedule" onClick={close} className={link}>Schedule</NavLink>
            <NavLink data-testid="nav.bookings.link" to="/bookings" onClick={close} className={link}>My bookings</NavLink>
            <NavLink data-testid="nav.policies.link" to="/policies" onClick={close} className={link}>Policies</NavLink>
          </nav>
        </div>
      )}
    </header>
  )
}
