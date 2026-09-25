import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { request, type Load, type Schemas } from '../api'
import { BookingConfirm } from '../components/BookingConfirm'
import { formatDate, timeRange } from '../format'
import { BottomSheet } from '../ui/BottomSheet'
import { Modal } from '../ui/Modal'
import { useMediaQuery, WAP_QUERY } from '../useMediaQuery'

type StudioClass = Schemas['StudioClass']

export function ClassPage() {
  const { id } = useParams()
  const isWap = useMediaQuery(WAP_QUERY)
  const [state, setState] = useState<Load<StudioClass>>({ status: 'loading' })
  const [confirming, setConfirming] = useState(false)
  const [version, setVersion] = useState(0) // bump to reload

  useEffect(() => {
    let current = true
    request<StudioClass>('GET', `/classes/${id}`).then((r) => {
      if (current) setState(r.ok ? { status: 'ready', data: r.data } : { status: 'error', error: r.error })
    })
    return () => {
      current = false
    }
  }, [id, version])

  const c = state.status === 'ready' ? state.data : null
  const close = () => {
    setConfirming(false)
    setVersion((v) => v + 1)
  }
  const confirm = c && <BookingConfirm studioClass={c} onBooked={close} onDismiss={close} />

  return (
    <section data-testid="class.screen" className="flex flex-col gap-4">
      <Link
        data-testid="class.back.link"
        to={c ? `/schedule?date=${c.start_at.slice(0, 10)}` : '/schedule'}
        className="text-sm text-indigo-700"
      >
        ← Schedule
      </Link>

      {state.status === 'loading' && <p data-testid="class.loading" className="text-slate-500">Loading class…</p>}
      {state.status === 'error' && <p data-testid="class.error" className="text-red-600">{state.error.message}</p>}
      {c && (
        <div className="flex flex-col gap-2 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h1 data-testid="class.name.text" className="text-2xl font-semibold">{c.name}</h1>
          <p data-testid="class.studio.text" className="text-slate-700">{c.studio_name}</p>
          <p data-testid="class.instructor.text" className="text-slate-700">with {c.instructor}</p>
          <p data-testid="class.time.text" className="text-slate-700">{formatDate(c.start_at)} · {timeRange(c)}</p>
          <p data-testid="class.spots.text" className="font-medium">
            {c.is_full ? 'Full' : `${c.spots_left} of ${c.capacity} spots left`}
          </p>
          <div className="mt-4">
            <ClassAction studioClass={c} onBook={() => setConfirming(true)} />
          </div>
        </div>
      )}

      {confirming && confirm && (isWap ? (
        <BottomSheet onClose={close}>
          <div data-testid="booking.confirm.sheet">{confirm}</div>
        </BottomSheet>
      ) : (
        <Modal onClose={close}>
          <div data-testid="booking.confirm.modal">{confirm}</div>
        </Modal>
      ))}
    </section>
  )
}

// Exactly one action, first match wins (docs/design/browse-and-book.md).
function ClassAction({ studioClass: c, onBook }: { studioClass: StudioClass; onBook: () => void }) {
  if (c.my_booking_id) {
    return (
      <div className="flex items-center gap-4">
        <span data-testid="class.booked.badge" className="rounded bg-indigo-100 px-3 py-1 font-medium text-indigo-700">You're booked</span>
        <Link data-testid="class.bookings.link" to="/bookings" className="text-indigo-700 underline">View my bookings</Link>
      </div>
    )
  }
  if (c.has_started) {
    return <span data-testid="class.started.badge" className="rounded bg-slate-100 px-3 py-1 text-slate-600">Class has started</span>
  }
  if (c.is_full) {
    return <span data-testid="class.full.badge" className="rounded bg-slate-100 px-3 py-1 text-slate-600">Class full</span>
  }
  return (
    <button data-testid="class.book.button" onClick={onBook} className="rounded bg-indigo-600 px-5 py-2 font-medium text-white">
      Book
    </button>
  )
}
