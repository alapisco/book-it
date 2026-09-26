import { CalendarDays, Dumbbell, ScrollText, Ticket } from 'lucide-react'
import { NavLink } from 'react-router'

const link = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-1.5 ${isActive ? 'font-semibold text-indigo-700' : 'text-slate-600 hover:text-slate-900'}`

// Desktop web: the outlier (ADR 0008). No Week link: the week view is not on web.
export function WebNav() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <nav data-testid="nav.bar" className="mx-auto flex max-w-6xl items-center gap-8 px-6 py-4">
        <span className="flex items-center gap-2 text-lg font-bold text-indigo-700">
          <Dumbbell size={22} aria-hidden />BookIt
        </span>
        <div className="ml-auto flex gap-6">
          <NavLink data-testid="nav.schedule.link" to="/schedule" className={link}>
            <CalendarDays size={18} aria-hidden />Schedule
          </NavLink>
          <NavLink data-testid="nav.bookings.link" to="/bookings" className={link}>
            <Ticket size={18} aria-hidden />My bookings
          </NavLink>
          <NavLink data-testid="nav.policies.link" to="/policies" className={link}>
            <ScrollText size={18} aria-hidden />Policies
          </NavLink>
        </div>
      </nav>
    </header>
  )
}
