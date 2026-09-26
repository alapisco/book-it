import { useState } from 'react'
import { request, type Schemas } from '../api'
import { formatDateTime } from '../format'
import { Spinner } from '../ui/Spinner'

type Entry = Schemas['WaitlistEntry']
type Props = { entries: Entry[]; onChanged: () => void }

const when = (e: Entry) => formatDateTime(e.studio_class.start_local)

// Leaving is immediate (no confirmation); errors surface at the top of the section.
function useLeave(onChanged: () => void) {
  const [leaving, setLeaving] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  async function leave(e: Entry) {
    setLeaving(e.id)
    setError(null)
    const r = await request<void>('DELETE', `/classes/${e.class_id}/waitlist`)
    setLeaving(null)
    if (r.ok) onChanged()
    else setError(r.error.message)
  }
  return { leaving, error, leave }
}

function LeaveButton({ entry, leaving, onLeave }: { entry: Entry; leaving: string | null; onLeave: (e: Entry) => void }) {
  return (
    <button
      data-testid="waitlist.item.leave"
      disabled={leaving === entry.id}
      onClick={() => onLeave(entry)}
      className="rounded px-3 py-1 text-sm font-medium text-slate-700 ring-1 ring-slate-300 disabled:opacity-50"
    >
      {leaving === entry.id ? <span data-testid="waitlist.leave.loading"><Spinner /></span> : 'Leave waitlist'}
    </button>
  )
}

// web: table.
export function WaitlistTable({ entries, onChanged }: Props) {
  const { leaving, error, leave } = useLeave(onChanged)
  return (
    <section data-testid="waitlist.section" className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">Waitlist</h2>
      {error && <p data-testid="waitlist.leave.error" className="text-sm text-red-600">{error}</p>}
      <table data-testid="waitlist.table" className="w-full overflow-hidden rounded-xl bg-white text-left ring-1 ring-slate-200">
        <thead className="bg-slate-100 text-sm text-slate-600">
          <tr>
            <th className="px-4 py-2 font-medium">Class</th>
            <th className="px-4 py-2 font-medium">When</th>
            <th className="px-4 py-2 font-medium">Position</th>
            <th className="px-4 py-2" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {entries.map((e) => (
            <tr key={e.id} data-testid="waitlist.item">
              <td data-testid="waitlist.item.name" className="px-4 py-3 font-medium">{e.studio_class.name}</td>
              <td data-testid="waitlist.item.time" className="px-4 py-3 text-slate-700">{when(e)}</td>
              <td data-testid="waitlist.item.position" className="px-4 py-3 text-slate-700">#{e.position} on the waitlist</td>
              <td className="px-4 py-3 text-right"><LeaveButton entry={e} leaving={leaving} onLeave={leave} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

// wap: stacked cards.
export function WaitlistList({ entries, onChanged }: Props) {
  const { leaving, error, leave } = useLeave(onChanged)
  return (
    <section data-testid="waitlist.section" className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">Waitlist</h2>
      {error && <p data-testid="waitlist.leave.error" className="text-sm text-red-600">{error}</p>}
      <ul data-testid="waitlist.list" className="flex flex-col gap-3">
        {entries.map((e) => (
          <li key={e.id} data-testid="waitlist.item" className="flex flex-col gap-1 rounded-xl bg-white p-4 ring-1 ring-slate-200">
            <span data-testid="waitlist.item.name" className="font-medium">{e.studio_class.name}</span>
            <span data-testid="waitlist.item.time" className="text-sm text-slate-600">{when(e)}</span>
            <span data-testid="waitlist.item.position" className="text-sm text-slate-600">#{e.position} on the waitlist</span>
            <div className="mt-2"><LeaveButton entry={e} leaving={leaving} onLeave={leave} /></div>
          </li>
        ))}
      </ul>
    </section>
  )
}
