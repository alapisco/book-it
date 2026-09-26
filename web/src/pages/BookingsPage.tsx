import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { request, type Load, type Schemas } from '../api'
import { BookingsList, BookingsTable } from '../components/Bookings'
import { CancelConfirm } from '../components/CancelConfirm'
import { WaitlistList, WaitlistTable } from '../components/Waitlist'
import { flagsFor } from '../flags'
import { BottomSheet } from '../ui/BottomSheet'
import { Modal } from '../ui/Modal'
import { useMediaQuery, WAP_QUERY } from '../useMediaQuery'

type Booking = Schemas['Booking']
type Data = { bookings: Booking[]; waitlist: Schemas['WaitlistEntry'][] }

export function BookingsPage() {
  const isWap = useMediaQuery(WAP_QUERY)
  const waitlistOn = flagsFor(isWap).waitlist
  const [state, setState] = useState<Load<Data>>({ status: 'loading' })
  const [cancelling, setCancelling] = useState<Booking | null>(null)
  const [version, setVersion] = useState(0) // bump to reload

  // Bookings and waitlist load together and share one loading/error state.
  useEffect(() => {
    let current = true
    Promise.all([
      request<Booking[]>('GET', '/me/bookings'),
      waitlistOn ? request<Data['waitlist']>('GET', '/me/waitlist') : Promise.resolve({ ok: true as const, data: [] }),
    ]).then(([b, w]) => {
      if (!current) return
      if (!b.ok) setState({ status: 'error', error: b.error })
      else if (!w.ok) setState({ status: 'error', error: w.error })
      else setState({ status: 'ready', data: { bookings: b.data, waitlist: w.data } })
    })
    return () => {
      current = false
    }
  }, [version, waitlistOn])

  const bookings = state.status === 'ready' ? state.data.bookings : null
  const waitlist = state.status === 'ready' ? state.data.waitlist : []
  const reload = () => setVersion((v) => v + 1)
  const dismiss = () => setCancelling(null)
  const cancelled = () => {
    setCancelling(null)
    reload()
  }
  const confirm = cancelling && <CancelConfirm booking={cancelling} onCancelled={cancelled} onDismiss={dismiss} />

  return (
    <section data-testid="bookings.screen" className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">My bookings</h1>

      {state.status === 'loading' && <p data-testid="bookings.loading" className="text-slate-500">Loading bookings…</p>}
      {state.status === 'error' && <p data-testid="bookings.error" className="text-red-600">{state.error.message}</p>}
      {bookings && bookings.length === 0 && (
        <div className="flex flex-col items-start gap-2">
          <p data-testid="bookings.empty" className="text-slate-600">You have no upcoming bookings.</p>
          <Link data-testid="bookings.empty.browse" to="/schedule" className="text-indigo-700 underline">Browse schedule</Link>
        </div>
      )}
      {bookings && bookings.length > 0 && (isWap
        ? <BookingsList bookings={bookings} onCancel={setCancelling} />
        : <BookingsTable bookings={bookings} onCancel={setCancelling} />)}

      {waitlistOn && waitlist.length > 0 && (isWap
        ? <WaitlistList entries={waitlist} onChanged={reload} />
        : <WaitlistTable entries={waitlist} onChanged={reload} />)}

      {confirm && (isWap ? (
        <BottomSheet onClose={dismiss}>
          <div data-testid="booking.cancel.sheet">{confirm}</div>
        </BottomSheet>
      ) : (
        <Modal onClose={dismiss}>
          <div data-testid="booking.cancel.modal">{confirm}</div>
        </Modal>
      ))}
    </section>
  )
}
