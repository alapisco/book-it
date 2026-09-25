import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { request, type Load, type Schemas } from '../api'
import { BookingsList, BookingsTable } from '../components/Bookings'
import { CancelConfirm } from '../components/CancelConfirm'
import { BottomSheet } from '../ui/BottomSheet'
import { Modal } from '../ui/Modal'
import { useMediaQuery, WAP_QUERY } from '../useMediaQuery'

type Booking = Schemas['Booking']

export function BookingsPage() {
  const isWap = useMediaQuery(WAP_QUERY)
  const [state, setState] = useState<Load<Booking[]>>({ status: 'loading' })
  const [cancelling, setCancelling] = useState<Booking | null>(null)
  const [version, setVersion] = useState(0) // bump to reload

  useEffect(() => {
    let current = true
    request<Booking[]>('GET', '/me/bookings').then((r) => {
      if (current) setState(r.ok ? { status: 'ready', data: r.data } : { status: 'error', error: r.error })
    })
    return () => {
      current = false
    }
  }, [version])

  const bookings = state.status === 'ready' ? state.data : null
  const dismiss = () => setCancelling(null)
  const cancelled = () => {
    setCancelling(null)
    setVersion((v) => v + 1)
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
