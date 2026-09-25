import { NavLink } from 'react-router'

const link = ({ isActive }: { isActive: boolean }) =>
  isActive ? 'font-semibold text-indigo-700' : 'text-slate-600 hover:text-slate-900'

export function WebNav() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <nav data-testid="nav.bar" className="mx-auto flex max-w-6xl items-center gap-8 px-6 py-4">
        <span className="text-lg font-bold text-indigo-700">BookIt</span>
        <div className="ml-auto flex gap-6">
          <NavLink data-testid="nav.schedule.link" to="/schedule" className={link}>Schedule</NavLink>
          <NavLink data-testid="nav.bookings.link" to="/bookings" className={link}>My bookings</NavLink>
        </div>
      </nav>
    </header>
  )
}
