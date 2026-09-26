import { ChevronLeft, Clock, ListOrdered, MapPin, User, Users } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { request, type Load, type Schemas } from '../api'
import { availabilityTone, toneClass } from '../availability'
import { BookingConfirm } from '../components/BookingConfirm'
import { flagsFor } from '../flags'
import { formatDate, timeRange } from '../format'
import { AppBar, BackIcon } from '../shell/AppBar'
import { BottomSheet } from '../ui/BottomSheet'
import { Modal } from '../ui/Modal'
import { Spinner } from '../ui/Spinner'
import { useMediaQuery, WAP_QUERY } from '../useMediaQuery'

type StudioClass = Schemas['StudioClass']

export function ClassPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
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
  // Back returns to where the class was opened: My bookings (my-bookings-and-cancel v3),
  // the week containing the class (week-calendar AC-7), otherwise the schedule on its date.
  const from = searchParams.get('from')
  const fromBookings = from === 'bookings'
  const date = c?.start_local.slice(0, 10)
  const backTo = fromBookings ? '/bookings'
    : from === 'week' ? (date ? `/week?week=${date}` : '/week')
    : date ? `/schedule?date=${date}` : '/schedule'
  const action = c && (
    <ClassAction
      studioClass={c}
      waitlist={flagsFor(isWap).waitlist}
      onBook={() => setConfirming(true)}
      onChanged={() => setVersion((v) => v + 1)}
    />
  )

  return (
    <section data-testid="class.screen" className={`flex flex-col gap-4 ${isWap ? 'pb-28' : ''}`}>
      {isWap ? (
        // wap: pushed app bar with the back control (ADR 0008).
        <div className="-mx-4">
          <AppBar
            title="Class"
            back={
              <Link data-testid="class.back.link" to={backTo} aria-label={fromBookings ? 'Back to my bookings' : from === 'week' ? 'Back to week' : 'Back to schedule'} className="-ml-1 flex items-center">
                <BackIcon />
              </Link>
            }
          />
        </div>
      ) : (
        <Link data-testid="class.back.link" to={backTo} className="flex items-center gap-0.5 text-sm font-medium text-indigo-700">
          <ChevronLeft size={16} aria-hidden />{fromBookings ? 'My bookings' : 'Schedule'}
        </Link>
      )}

      {state.status === 'loading' && <p data-testid="class.loading" className="text-slate-500">Loading class…</p>}
      {state.status === 'error' && <p data-testid="class.error" className="text-red-600">{state.error.message}</p>}
      {c && (
        <div
          style={{ borderTopColor: c.studio_accent }}
          className="flex flex-col gap-3 rounded-xl border-t-4 bg-white p-6 shadow-sm ring-1 ring-slate-200"
        >
          <h1 data-testid="class.name.text" className="text-2xl font-semibold">{c.name}</h1>
          <InfoRow icon={<MapPin size={18} />}>
            <span data-testid="class.studio.text">{c.studio_name} · {c.studio_neighborhood}</span>
          </InfoRow>
          <InfoRow icon={<User size={18} />}>
            <span data-testid="class.instructor.text">with {c.instructor}</span>
          </InfoRow>
          <InfoRow icon={<Clock size={18} />}>
            <span data-testid="class.time.text">{formatDate(c.start_local)} · {timeRange(c)}</span>
          </InfoRow>
          <InfoRow icon={<Users size={18} />}>
            <span data-testid="class.spots.text" className={`font-medium ${toneClass[availabilityTone(c)]}`}>
              {c.is_full ? 'Full' : `${c.spots_left} of ${c.capacity} spots left`}
            </span>
          </InfoRow>
          {!isWap && <div className="mt-3">{action}</div>}
        </div>
      )}

      {/* wap: the action area is pinned to the bottom of the screen. */}
      {c && isWap && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {action}
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

function InfoRow({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <p className="flex items-center gap-2.5 text-slate-700">
      <span className="text-slate-400" aria-hidden>{icon}</span>
      {children}
    </p>
  )
}

// Exactly one action, first match wins (docs/design/browse-and-book.md).
function ClassAction({ studioClass: c, waitlist, onBook, onChanged }: {
  studioClass: StudioClass
  waitlist: boolean
  onBook: () => void
  onChanged: () => void
}) {
  if (c.my_booking_id) {
    return (
      <div className="flex items-center justify-between gap-4">
        <span data-testid="class.booked.badge" className="rounded bg-indigo-100 px-3 py-1 font-medium text-indigo-700">You're booked</span>
        <Link data-testid="class.bookings.link" to="/bookings" className="font-medium text-indigo-700 underline">View my bookings</Link>
      </div>
    )
  }
  if (c.has_started) {
    return <span data-testid="class.started.badge" className="rounded bg-slate-100 px-3 py-1 text-slate-600">Class has started</span>
  }
  if (c.is_full) {
    return (
      <div className="flex flex-col items-stretch gap-3 sm:items-start">
        <span data-testid="class.full.badge" className="self-start rounded bg-slate-100 px-3 py-1 text-slate-600">Class full</span>
        {waitlist && <WaitlistAction studioClass={c} onChanged={onChanged} />}
      </div>
    )
  }
  return (
    <button data-testid="class.book.button" onClick={onBook} className="w-full rounded-lg bg-indigo-700 px-5 py-2.5 font-semibold text-white sm:w-auto">
      Book
    </button>
  )
}

// Only rendered where the waitlist flag is on (docs/design/waitlist.md).
function WaitlistAction({ studioClass: c, onChanged }: { studioClass: StudioClass; onChanged: () => void }) {
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (c.my_waitlist_position) {
    return (
      <span className="flex items-center gap-2 font-medium text-indigo-700">
        <ListOrdered size={18} aria-hidden />
        <span data-testid="class.waitlist.position">You're #{c.my_waitlist_position} on the waitlist</span>
      </span>
    )
  }

  async function join() {
    setJoining(true)
    setError(null)
    const r = await request<Schemas['WaitlistEntry']>('POST', `/classes/${c.id}/waitlist`)
    setJoining(false)
    if (r.ok) onChanged()
    else setError(r.error.message)
  }

  return (
    <div className="flex flex-col items-stretch gap-2 sm:items-start">
      <button
        data-testid="class.waitlist.join"
        disabled={joining}
        onClick={join}
        className="flex items-center justify-center gap-2 rounded-lg bg-indigo-700 px-5 py-2.5 font-semibold text-white disabled:opacity-50"
      >
        {joining ? <span data-testid="class.waitlist.loading"><Spinner /></span> : <><ListOrdered size={18} aria-hidden />Join waitlist</>}
      </button>
      {error && <p data-testid="class.waitlist.error" className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
