import { useEffect, useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router'
import { request, type Load, type Schemas } from '../api'
import { flagsFor } from '../flags'
import { formatDayHeader, formatTime, formatWeek } from '../format'
import { useMediaQuery, WAP_QUERY } from '../useMediaQuery'

type Week = Schemas['ScheduleWeek']

export function CalendarPage() {
  const isWap = useMediaQuery(WAP_QUERY)
  if (!flagsFor(isWap).week_calendar) return <Navigate to="/schedule" replace />
  return <WeekCalendar />
}

function WeekCalendar() {
  const [params, setParams] = useSearchParams()
  const week = params.get('week')
  // Each result remembers which week it was for, so a week change reads as loading.
  const [result, setResult] = useState<{ week: string | null; load: Load<Week> }>()
  const state: Load<Week> = result && result.week === week ? result.load : { status: 'loading' }

  useEffect(() => {
    let current = true
    request<Week>('GET', week ? `/schedule/week?date=${week}` : '/schedule/week').then((r) => {
      if (current) setResult({ week, load: r.ok ? { status: 'ready', data: r.data } : { status: 'error', error: r.error } })
    })
    return () => {
      current = false
    }
  }, [week])

  const data = state.status === 'ready' ? state.data : null
  const today = data?.now.slice(0, 10)
  const empty = data !== null && data.days.every((d) => d.classes.length === 0)

  return (
    <section data-testid="calendar.screen" className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <button
          data-testid="calendar.week.prev"
          disabled={!data}
          onClick={() => data && setParams({ week: data.previous_week })}
          className="rounded px-2 py-1 text-sm text-indigo-700 disabled:opacity-40"
        >
          ‹ Previous week
        </button>
        <h1 data-testid="calendar.week.text" className="text-lg font-semibold">
          {data ? formatWeek(data.week_start, data.week_end) : ''}
        </h1>
        <button
          data-testid="calendar.week.next"
          disabled={!data}
          onClick={() => data && setParams({ week: data.next_week })}
          className="rounded px-2 py-1 text-sm text-indigo-700 disabled:opacity-40"
        >
          Next week ›
        </button>
      </div>

      {state.status === 'loading' && <p data-testid="calendar.loading" className="text-slate-500">Loading week…</p>}
      {state.status === 'error' && <p data-testid="calendar.error" className="text-red-600">{state.error.message}</p>}
      {empty && <p data-testid="calendar.empty" className="text-slate-500">No classes this week.</p>}
      {data && !empty && (
        <div data-testid="calendar.grid" className="grid grid-cols-7 gap-2">
          {data.days.map((d) => (
            <div
              key={d.date}
              data-testid="calendar.day.column"
              aria-current={d.date === today ? 'date' : undefined}
              className={`flex flex-col gap-1.5 rounded-lg p-2 ${d.date === today ? 'bg-indigo-50 ring-1 ring-indigo-200' : 'bg-white ring-1 ring-slate-200'}`}
            >
              <p data-testid="calendar.day.header" className="mb-1 text-center text-sm font-semibold">{formatDayHeader(d.date)}</p>
              {d.classes.map((c) => (
                <Link
                  key={c.id}
                  data-testid="calendar.class.block"
                  to={`/classes/${c.id}`}
                  className={`flex flex-col rounded px-2 py-1 text-xs ${c.is_full || c.has_started ? 'bg-slate-100 text-slate-500' : 'bg-indigo-100 text-indigo-900 hover:bg-indigo-200'}`}
                >
                  <span data-testid="calendar.class.time" className="font-medium">{formatTime(c.start_at)}</span>
                  <span data-testid="calendar.class.name" className="truncate">{c.name}</span>
                  {c.my_booking_id && <span data-testid="calendar.class.booked" className="font-semibold text-indigo-700">Booked</span>}
                </Link>
              ))}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
