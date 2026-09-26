import { useState } from 'react'
import { request, type Schemas } from '../api'
import { formatDate, formatTime } from '../format'
import { Spinner } from '../ui/Spinner'

// Body of the booking confirmation; the caller wraps it in a modal (web) or sheet (wap).
export function BookingConfirm({ studioClass: c, onBooked, onDismiss }: {
  studioClass: Schemas['StudioClass']
  onBooked: () => void
  onDismiss: () => void
}) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    setSubmitting(true)
    setError(null)
    const r = await request<Schemas['Booking']>('POST', '/bookings', { class_id: c.id })
    setSubmitting(false)
    if (r.ok) onBooked()
    else setError(r.error.message)
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Confirm booking</h2>
      <p data-testid="booking.confirm.summary" className="text-slate-700">
        {c.name} · {formatDate(c.start_local)} · {formatTime(c.start_local)} · {c.studio_name}
      </p>
      {error && <p data-testid="booking.confirm.error" className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end gap-3">
        <button data-testid="booking.confirm.dismiss" onClick={onDismiss} className="rounded px-4 py-2 text-slate-700">
          Not now
        </button>
        <button
          data-testid="booking.confirm.submit"
          disabled={submitting}
          onClick={submit}
          className="rounded bg-indigo-600 px-4 py-2 font-medium text-white disabled:opacity-50"
        >
          {submitting ? <span data-testid="booking.confirm.loading"><Spinner /></span> : 'Confirm booking'}
        </button>
      </div>
    </div>
  )
}
