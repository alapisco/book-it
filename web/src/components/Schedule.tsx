import { Link, useLocation } from 'react-router'
import type { Schemas } from '../api'
import { classPath } from '../back'
import { availabilityTone, toneClass } from '../availability'
import { spotsLabel, timeRange } from '../format'

type Classes = Schemas['StudioClass'][]

// web: 3-column grid of tiles.
export function ScheduleGrid({ classes }: { classes: Classes }) {
  const { pathname, search } = useLocation()
  return (
    <div data-testid="schedule.grid" role="list" className="grid grid-cols-3 gap-4">
      {classes.map((c) => (
        <Link
          key={c.id}
          data-testid="schedule.class.card"
          role="listitem"
          to={classPath(c.id, pathname + search)}
          style={{ borderLeftColor: c.studio_accent }}
          className="flex flex-col gap-1 rounded-xl border-l-4 bg-white p-4 shadow-sm ring-1 ring-slate-200 hover:ring-indigo-400"
        >
          <span data-testid="schedule.class.name" className="font-semibold">{c.name}</span>
          <span data-testid="schedule.class.studio" className="text-sm text-slate-600">{c.studio_name} · {c.studio_neighborhood}</span>
          <span data-testid="schedule.class.time" className="text-sm text-slate-600">{timeRange(c)}</span>
          <div className="mt-2 flex items-center justify-between">
            {c.my_booking_id ? (
              <span data-testid="schedule.class.booked" className="rounded bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">Booked</span>
            ) : <span />}
            <span data-testid="schedule.class.spots" className={`text-sm font-medium ${toneClass[availabilityTone(c)]}`}>{spotsLabel(c)}</span>
          </div>
        </Link>
      ))}
    </div>
  )
}

// wap: stacked, separated cards (same pattern as the native apps).
export function ScheduleList({ classes }: { classes: Classes }) {
  const { pathname, search } = useLocation()
  return (
    <ul data-testid="schedule.list" className="flex flex-col gap-3">
      {classes.map((c) => (
        <li key={c.id}>
          <Link
            data-testid="schedule.class.card"
            to={classPath(c.id, pathname + search)}
            style={{ borderLeftColor: c.studio_accent }}
            className="flex items-center gap-3 rounded-xl border-l-4 bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200"
          >
            <span data-testid="schedule.class.time" className="w-[5.5rem] shrink-0 text-sm font-medium text-slate-700">{timeRange(c)}</span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span data-testid="schedule.class.name" className="truncate font-semibold">{c.name}</span>
              <span data-testid="schedule.class.studio" className="truncate text-xs text-slate-600">{c.studio_name} · {c.studio_neighborhood}</span>
            </span>
            <span className="flex shrink-0 flex-col items-end gap-1">
              <span data-testid="schedule.class.spots" className={`text-xs font-medium ${toneClass[availabilityTone(c)]}`}>{spotsLabel(c)}</span>
              {c.my_booking_id && (
                <span data-testid="schedule.class.booked" className="rounded bg-indigo-100 px-1.5 text-xs font-medium text-indigo-700">Booked</span>
              )}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
