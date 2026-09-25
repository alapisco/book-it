import { Link } from 'react-router'
import type { Schemas } from '../api'
import { spotsLabel, timeRange } from '../format'

type Classes = Schemas['StudioClass'][]

const spotsTone = (c: Schemas['StudioClass']) =>
  c.has_started || c.is_full ? 'text-slate-500' : c.spots_left <= 3 ? 'text-amber-700' : 'text-emerald-700'

// web: 3-column grid of tiles.
export function ScheduleGrid({ classes }: { classes: Classes }) {
  return (
    <div data-testid="schedule.grid" role="list" className="grid grid-cols-3 gap-4">
      {classes.map((c) => (
        <Link
          key={c.id}
          data-testid="schedule.class.card"
          role="listitem"
          to={`/classes/${c.id}`}
          className="flex flex-col gap-1 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 hover:ring-indigo-400"
        >
          <span data-testid="schedule.class.name" className="font-semibold">{c.name}</span>
          <span data-testid="schedule.class.studio" className="text-sm text-slate-600">{c.studio_name}</span>
          <span data-testid="schedule.class.time" className="text-sm text-slate-600">{timeRange(c)}</span>
          <div className="mt-2 flex items-center justify-between">
            {c.my_booking_id ? (
              <span data-testid="schedule.class.booked" className="rounded bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">Booked</span>
            ) : <span />}
            <span data-testid="schedule.class.spots" className={`text-sm font-medium ${spotsTone(c)}`}>{spotsLabel(c)}</span>
          </div>
        </Link>
      ))}
    </div>
  )
}

// wap: stacked full-width rows.
export function ScheduleList({ classes }: { classes: Classes }) {
  return (
    <ul data-testid="schedule.list" className="divide-y divide-slate-200 rounded-xl bg-white ring-1 ring-slate-200">
      {classes.map((c) => (
        <li key={c.id}>
          <Link data-testid="schedule.class.card" to={`/classes/${c.id}`} className="flex items-center gap-3 px-4 py-3">
            <span data-testid="schedule.class.time" className="w-24 shrink-0 text-xs text-slate-600">{timeRange(c)}</span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span data-testid="schedule.class.name" className="truncate font-medium">{c.name}</span>
              <span data-testid="schedule.class.studio" className="truncate text-xs text-slate-600">{c.studio_name}</span>
            </span>
            <span className="flex shrink-0 flex-col items-end gap-1">
              <span data-testid="schedule.class.spots" className={`text-xs font-medium ${spotsTone(c)}`}>{spotsLabel(c)}</span>
              {c.my_booking_id && (
                <span data-testid="schedule.class.booked" className="rounded bg-indigo-100 px-1.5 text-xs text-indigo-700">Booked</span>
              )}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
