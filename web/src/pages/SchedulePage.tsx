import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { request, type Load, type Schemas } from '../api'
import { ScheduleGrid, ScheduleList } from '../components/Schedule'
import { formatDate } from '../format'
import { useMediaQuery, WAP_QUERY } from '../useMediaQuery'

export function SchedulePage() {
  const isWap = useMediaQuery(WAP_QUERY)
  const [params, setParams] = useSearchParams()
  const date = params.get('date')
  // Each result remembers which date it was for, so a date change reads as loading.
  const [result, setResult] = useState<{ date: string | null; load: Load<Schemas['ScheduleDay']> }>()
  const state: Load<Schemas['ScheduleDay']> =
    result && result.date === date ? result.load : { status: 'loading' }

  useEffect(() => {
    let current = true
    request<Schemas['ScheduleDay']>('GET', date ? `/schedule?date=${date}` : '/schedule').then((r) => {
      if (current) setResult({ date, load: r.ok ? { status: 'ready', data: r.data } : { status: 'error', error: r.error } })
    })
    return () => {
      current = false
    }
  }, [date])

  const day = state.status === 'ready' ? state.data : null
  const shownDate = day?.date ?? date
  const go = (d: string) => setParams({ date: d })

  return (
    <section data-testid="schedule.screen" className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <button
          data-testid="schedule.date.prev"
          disabled={!day}
          onClick={() => day && go(day.previous_date)}
          className="rounded px-2 py-1 text-sm text-indigo-700 disabled:opacity-40"
        >
          ‹ Previous day
        </button>
        <h1 data-testid="schedule.date.text" className="text-lg font-semibold">
          {shownDate ? formatDate(shownDate) : ''}
        </h1>
        <button
          data-testid="schedule.date.next"
          disabled={!day}
          onClick={() => day && go(day.next_date)}
          className="rounded px-2 py-1 text-sm text-indigo-700 disabled:opacity-40"
        >
          Next day ›
        </button>
      </div>

      {state.status === 'loading' && <p data-testid="schedule.loading" className="text-slate-500">Loading classes…</p>}
      {state.status === 'error' && <p data-testid="schedule.error" className="text-red-600">{state.error.message}</p>}
      {day && day.classes.length === 0 && (
        <p data-testid="schedule.empty" className="text-slate-500">No classes on this day.</p>
      )}
      {day && day.classes.length > 0 &&
        (isWap ? <ScheduleList classes={day.classes} /> : <ScheduleGrid classes={day.classes} />)}
    </section>
  )
}
