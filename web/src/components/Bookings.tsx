import type { Schemas } from '../api'
import { formatDate, formatTime } from '../format'

type Props = { bookings: Schemas['Booking'][]; onCancel: (b: Schemas['Booking']) => void }

const when = (b: Schemas['Booking']) =>
  `${formatDate(b.studio_class.start_at)} · ${formatTime(b.studio_class.start_at)} UTC`

function CancelAction({ booking, onCancel }: { booking: Schemas['Booking']; onCancel: Props['onCancel'] }) {
  return booking.can_cancel ? (
    <button data-testid="bookings.item.cancel" onClick={() => onCancel(booking)} className="rounded px-3 py-1 text-sm font-medium text-red-700 ring-1 ring-red-200">
      Cancel
    </button>
  ) : (
    <span data-testid="bookings.item.cancel-closed" className="text-sm text-slate-500">Cancellation closed</span>
  )
}

// web: table.
export function BookingsTable({ bookings, onCancel }: Props) {
  return (
    <table data-testid="bookings.table" className="w-full overflow-hidden rounded-xl bg-white text-left ring-1 ring-slate-200">
      <thead className="bg-slate-100 text-sm text-slate-600">
        <tr>
          <th className="px-4 py-2 font-medium">Class</th>
          <th className="px-4 py-2 font-medium">Studio</th>
          <th className="px-4 py-2 font-medium">When</th>
          <th className="px-4 py-2" />
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-200">
        {bookings.map((b) => (
          <tr key={b.id} data-testid="bookings.item">
            <td data-testid="bookings.item.name" className="px-4 py-3 font-medium">{b.studio_class.name}</td>
            <td data-testid="bookings.item.studio" className="px-4 py-3 text-slate-700">{b.studio_class.studio_name}</td>
            <td data-testid="bookings.item.time" className="px-4 py-3 text-slate-700">{when(b)}</td>
            <td className="px-4 py-3 text-right"><CancelAction booking={b} onCancel={onCancel} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// wap: stacked cards.
export function BookingsList({ bookings, onCancel }: Props) {
  return (
    <ul data-testid="bookings.list" className="flex flex-col gap-3">
      {bookings.map((b) => (
        <li key={b.id} data-testid="bookings.item" className="flex flex-col gap-1 rounded-xl bg-white p-4 ring-1 ring-slate-200">
          <span data-testid="bookings.item.name" className="font-medium">{b.studio_class.name}</span>
          <span data-testid="bookings.item.studio" className="text-sm text-slate-600">{b.studio_class.studio_name}</span>
          <span data-testid="bookings.item.time" className="text-sm text-slate-600">{when(b)}</span>
          <div className="mt-2"><CancelAction booking={b} onCancel={onCancel} /></div>
        </li>
      ))}
    </ul>
  )
}
