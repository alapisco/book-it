import { CalendarDays, CalendarRange, ScrollText, Ticket } from 'lucide-react'
import { NavLink } from 'react-router'
import { flagsFor } from '../flags'

const tab = ({ isActive }: { isActive: boolean }) =>
  `flex flex-1 flex-col items-center gap-0.5 py-2 text-xs ${isActive ? 'font-semibold text-indigo-700' : 'text-slate-500'}`

// wap bottom tabs, same order and identifiers as the native apps (ADR 0008).
export function TabBar() {
  return (
    <nav data-testid="nav.tabs" className="fixed inset-x-0 bottom-0 z-30 flex border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)]">
      <NavLink data-testid="nav.schedule.link" to="/schedule" className={tab}>
        <CalendarDays size={22} aria-hidden />
        Schedule
      </NavLink>
      {flagsFor(true).week_calendar && (
        <NavLink data-testid="nav.week.link" to="/week" className={tab}>
          <CalendarRange size={22} aria-hidden />
          Week
        </NavLink>
      )}
      <NavLink data-testid="nav.bookings.link" to="/bookings" className={tab}>
        <Ticket size={22} aria-hidden />
        Bookings
      </NavLink>
      <NavLink data-testid="nav.policies.link" to="/policies" className={tab}>
        <ScrollText size={22} aria-hidden />
        Policies
      </NavLink>
    </nav>
  )
}
