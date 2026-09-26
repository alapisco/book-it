import { CalendarPlus } from 'lucide-react'
import type { MouseEvent } from 'react'
import { useNavigate } from 'react-router'
import type { Schemas } from '../api'
import { classPath } from '../back'
import { dayNumber, formatDateTime } from '../format'

type Booking = Schemas['Booking']
type Props = { bookings: Booking[]; onCancel: (b: Booking) => void }
type TableProps = Props & { exporting: string | null; onExport: (b: Booking) => void }

const when = (b: Booking) => formatDateTime(b.studio_class.start_local)
// The item opens its class (design v3); Back there returns to My bookings.
const open = (b: Booking) => classPath(b.studio_class.id, '/bookings')
// Buttons inside an item keep their own action and don't open the class.
const own = (action: () => void) => (e: MouseEvent) => {
  e.stopPropagation()
  action()
}
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

function CancelAction({ booking, onCancel }: { booking: Booking; onCancel: Props['onCancel'] }) {
  return booking.can_cancel ? (
    <button data-testid="bookings.item.cancel" onClick={own(() => onCancel(booking))} className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-700 ring-1 ring-red-200">
      Cancel
    </button>
  ) : (
    <span data-testid="bookings.item.cancel-closed" className="text-sm text-slate-500">Cancellation closed</span>
  )
}

// web: table (with .ics export, web only: docs/design/ics-export.md).
export function BookingsTable({ bookings, onCancel, exporting, onExport }: TableProps) {
  const navigate = useNavigate()
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
          <tr key={b.id} data-testid="bookings.item" onClick={() => navigate(open(b))} className="cursor-pointer hover:bg-slate-50">
            <td className="px-4 py-3">
              <span className="flex items-center gap-2 font-medium">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: b.studio_class.studio_accent }} aria-hidden />
                <span data-testid="bookings.item.name">{b.studio_class.name}</span>
              </span>
            </td>
            <td data-testid="bookings.item.studio" className="px-4 py-3 text-slate-700">{b.studio_class.studio_name} · {b.studio_class.studio_neighborhood}</td>
            <td data-testid="bookings.item.time" className="px-4 py-3 text-slate-700">{when(b)}</td>
            <td className="px-4 py-3 text-right">
              <div className="flex items-center justify-end gap-3">
                <button
                  data-testid="bookings.item.export"
                  disabled={exporting === b.id}
                  onClick={own(() => onExport(b))}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-slate-300 disabled:opacity-50"
                >
                  <CalendarPlus size={16} aria-hidden />{exporting === b.id ? 'Exporting…' : 'Export .ics'}
                </button>
                <CancelAction booking={b} onCancel={onCancel} />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// wap: cards with a date block and the studio accent (same as the native apps).
export function BookingsList({ bookings, onCancel }: Props) {
  const navigate = useNavigate()
  return (
    <ul data-testid="bookings.list" className="flex flex-col gap-3">
      {bookings.map((b) => {
        const c = b.studio_class
        return (
          <li
            key={b.id}
            data-testid="bookings.item"
            onClick={() => navigate(open(b))}
            style={{ borderLeftColor: c.studio_accent }}
            className="flex cursor-pointer gap-4 rounded-xl border-l-4 bg-white p-4 shadow-sm ring-1 ring-slate-200"
          >
            <div className="flex w-12 shrink-0 flex-col items-center rounded-lg bg-indigo-50 py-1.5 text-indigo-700" aria-hidden>
              <span className="text-xl font-bold leading-none">{dayNumber(c.start_local.slice(0, 10))}</span>
              <span className="text-[11px] font-semibold">{MONTHS[Number(c.start_local.slice(5, 7)) - 1]}</span>
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span data-testid="bookings.item.name" className="font-semibold">{c.name}</span>
              <span data-testid="bookings.item.studio" className="text-sm text-slate-600">{c.studio_name} · {c.studio_neighborhood}</span>
              <span data-testid="bookings.item.time" className="text-sm text-slate-600">{when(b)}</span>
              <div className="mt-2"><CancelAction booking={b} onCancel={onCancel} /></div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
