import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router'
import { request, type Load, type Schemas } from '../api'
import { availabilityTone, toneClass } from '../availability'
import { flagsFor } from '../flags'
import { dayName, dayNumber, formatSectionHeader, formatWeekRange, spotsLabel, timeRange } from '../format'
import { useMediaQuery, WAP_QUERY } from '../useMediaQuery'

type Week = Schemas['ScheduleWeek']

// Week view: wap only in this build; web has no week view (week-calendar v2).
export function WeekPage() {
  const isWap = useMediaQuery(WAP_QUERY)
  if (!flagsFor(isWap).week_calendar) return <Navigate to="/schedule" replace />
  return <WeekView />
}

// Selected day per PRD AC-4: today in the current week, otherwise Monday.
const initialDay = (w: Week) => (w.today >= w.week_start && w.today <= w.week_end ? w.today : w.week_start)

function WeekView() {
  const [params, setParams] = useSearchParams()
  const week = params.get('week')
  // Each result remembers which week it was for, so a week change reads as loading.
  const [result, setResult] = useState<{ week: string | null; load: Load<Week> }>()
  const [selected, setSelected] = useState<string | null>(null)
  const state: Load<Week> = result && result.week === week ? result.load : { status: 'loading' }

  useEffect(() => {
    let current = true
    request<Week>('GET', week ? `/schedule/week?date=${week}` : '/schedule/week').then((r) => {
      if (!current) return
      setResult({ week, load: r.ok ? { status: 'ready', data: r.data } : { status: 'error', error: r.error } })
      setSelected(r.ok ? initialDay(r.data) : null)
    })
    return () => {
      current = false
    }
  }, [week])

  const data = state.status === 'ready' ? state.data : null
  const empty = data !== null && data.days.every((d) => d.classes.length === 0)

  // The list starts at the selected day's section (AC-4).
  useEffect(() => {
    if (data && selected) document.getElementById(`day-${selected}`)?.scrollIntoView({ block: 'start' })
    // Only when a new week arrives; taps scroll explicitly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  function jump(date: string) {
    setSelected(date)
    document.getElementById(`day-${date}`)?.scrollIntoView({ block: 'start', behavior: 'smooth' })
  }

  return (
    <section data-testid="week.screen" className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <button
          data-testid="week.range.prev"
          disabled={!data}
          onClick={() => data && setParams({ week: data.previous_week })}
          aria-label="Previous week"
          className="rounded p-1 text-indigo-700 disabled:opacity-40"
        >
          <ChevronLeft size={22} aria-hidden />
        </button>
        <h1 data-testid="week.range.text" className="text-base font-semibold">
          {data ? formatWeekRange(data.week_start, data.week_end) : ''}
        </h1>
        <button
          data-testid="week.range.next"
          disabled={!data}
          onClick={() => data && setParams({ week: data.next_week })}
          aria-label="Next week"
          className="rounded p-1 text-indigo-700 disabled:opacity-40"
        >
          <ChevronRight size={22} aria-hidden />
        </button>
      </div>

      {state.status === 'loading' && <p data-testid="week.loading" className="text-slate-500">Loading week…</p>}
      {state.status === 'error' && <p data-testid="week.error" className="text-red-600">{state.error.message}</p>}

      {data && (
        <div data-testid="week.strip" role="tablist" className="sticky top-14 z-20 -mx-4 grid grid-cols-7 gap-1.5 bg-slate-50 px-4 py-2">
          {data.days.map((d) => {
            const isSelected = d.date === selected
            const isToday = d.date === data.today
            return (
              <button
                key={d.date}
                data-testid="week.day.pill"
                role="tab"
                aria-selected={isSelected}
                aria-current={isToday ? 'date' : undefined}
                onClick={() => jump(d.date)}
                className={`flex flex-col items-center rounded-xl py-1.5 text-xs ${
                  isSelected ? 'bg-indigo-700 text-white' : 'bg-white text-slate-700 ring-1 ring-slate-200'
                } ${isToday && !isSelected ? 'ring-2 ring-indigo-700' : ''}`}
              >
                <span data-testid="week.day.name">{dayName(d.date)}</span>
                <span data-testid="week.day.number" className="text-base font-bold leading-tight">{dayNumber(d.date)}</span>
                <span data-testid="week.day.count" className={isSelected ? 'text-indigo-100' : 'text-slate-500'}>{d.classes.length}</span>
                {d.classes.some((c) => c.my_booking_id) ? (
                  <span data-testid="week.day.booked" className={`mt-0.5 h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-indigo-700'}`} />
                ) : (
                  <span className="mt-0.5 h-1.5 w-1.5" />
                )}
              </button>
            )
          })}
        </div>
      )}

      {empty && <p data-testid="week.empty" className="text-slate-500">No classes this week.</p>}
      {data && !empty && (
        <div data-testid="week.list" className="flex flex-col gap-5">
          {data.days.map((d) => (
            // scroll-margin keeps the heading below the sticky app bar + strip.
            <div key={d.date} id={`day-${d.date}`} data-testid="week.section" className="flex scroll-mt-40 flex-col gap-2">
              <h2 data-testid="week.section.header" className="text-xs font-semibold tracking-wide text-slate-500">
                {formatSectionHeader(d.date, d.classes.length)}
              </h2>
              {d.classes.map((c) => (
                <Link
                  key={c.id}
                  data-testid="week.class.card"
                  to={`/classes/${c.id}?from=week`}
                  style={{ borderLeftColor: c.studio_accent }}
                  className="flex items-center gap-3 rounded-xl border-l-4 bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200"
                >
                  <span data-testid="week.class.time" className="w-[5.5rem] shrink-0 text-sm font-medium text-slate-700">{timeRange(c)}</span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span data-testid="week.class.name" className="truncate font-semibold">{c.name}</span>
                    <span data-testid="week.class.studio" className="truncate text-xs text-slate-600">{c.studio_name} · {c.studio_neighborhood}</span>
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-1">
                    <span data-testid="week.class.spots" className={`text-xs font-medium ${toneClass[availabilityTone(c)]}`}>{spotsLabel(c)}</span>
                    {c.my_booking_id && (
                      <span data-testid="week.class.booked" className="rounded bg-indigo-100 px-1.5 text-xs font-medium text-indigo-700">Booked</span>
                    )}
                  </span>
                </Link>
              ))}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
