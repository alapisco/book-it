import { useState } from 'react'
import { request, type Schemas } from '../api'
import { formatDate, formatTime } from '../format'
import { Spinner } from '../ui/Spinner'

// Body of the cancel confirmation; the caller wraps it in a modal (web) or sheet (wap).
export function CancelConfirm({ booking, onCancelled, onDismiss }: {
  booking: Schemas['Booking']
  onCancelled: () => void
  onDismiss: () => void
}) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const c = booking.studio_class

  async function submit() {
    setSubmitting(true)
    setError(null)
    const r = await request<void>('DELETE', `/bookings/${booking.id}`)
    setSubmitting(false)
    if (r.ok) onCancelled()
    else setError(r.error.message)
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Cancel booking?</h2>
      <p data-testid="booking.cancel.summary" className="text-slate-700">
        {c.name} · {formatDate(c.start_at)} · {formatTime(c.start_at)} UTC
      </p>
      {error && <p data-testid="booking.cancel.error" className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end gap-3">
        <button data-testid="booking.cancel.dismiss" onClick={onDismiss} className="rounded px-4 py-2 text-slate-700">
          Keep booking
        </button>
        <button
          data-testid="booking.cancel.confirm"
          disabled={submitting}
          onClick={submit}
          className="rounded bg-red-600 px-4 py-2 font-medium text-white disabled:opacity-50"
        >
          {submitting ? <span data-testid="booking.cancel.loading"><Spinner /></span> : 'Cancel booking'}
        </button>
      </div>
    </div>
  )
}
