import { useEffect, useState } from 'react'
import { request, type Load, type Schemas } from '../api'
import { useMediaQuery, WAP_QUERY } from '../useMediaQuery'

type Studio = Schemas['StudioPolicies']

export function PoliciesPage() {
  const isWap = useMediaQuery(WAP_QUERY)
  const [state, setState] = useState<Load<Studio[]>>({ status: 'loading' })

  useEffect(() => {
    let current = true
    request<Studio[]>('GET', '/policies').then((r) => {
      if (current) setState(r.ok ? { status: 'ready', data: r.data } : { status: 'error', error: r.error })
    })
    return () => {
      current = false
    }
  }, [])

  const studios = state.status === 'ready' ? state.data : null
  return (
    <section data-testid="policies.screen" className="flex flex-col gap-4">
      {!isWap && <h1 className="text-2xl font-semibold">Studio policies</h1>}
      {state.status === 'loading' && <p data-testid="policies.loading" className="text-slate-500">Loading policies…</p>}
      {state.status === 'error' && <p data-testid="policies.error" className="text-red-600">{state.error.message}</p>}
      {studios && studios.length === 0 && <p data-testid="policies.empty" className="text-slate-500">No policies published.</p>}
      {studios && studios.length > 0 && (isWap ? <StudioAccordion studios={studios} /> : <StudioTabs studios={studios} />)}
    </section>
  )
}

// web: tabs, first studio selected.
function StudioTabs({ studios }: { studios: Studio[] }) {
  const [selected, setSelected] = useState(0)
  return (
    <div className="flex flex-col gap-4">
      <div data-testid="policies.tabs" role="tablist" className="flex gap-2 border-b border-slate-200">
        {studios.map((s, i) => (
          <button
            key={s.studio_id}
            data-testid="policies.studio.tab"
            role="tab"
            aria-selected={i === selected}
            onClick={() => setSelected(i)}
            className={`-mb-px border-b-2 px-4 py-2 ${i === selected ? 'border-indigo-600 font-semibold text-indigo-700' : 'border-transparent text-slate-600'}`}
          >
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.accent }} aria-hidden />
              {s.studio_name}
            </span>
          </button>
        ))}
      </div>
      <PolicyPanel studio={studios[selected]} showName />
    </div>
  )
}

// wap: accordion, all collapsed, at most one expanded.
function StudioAccordion({ studios }: { studios: Studio[] }) {
  const [expanded, setExpanded] = useState<string | null>(null)
  return (
    <div data-testid="policies.accordion" className="flex flex-col divide-y divide-slate-200 rounded-xl bg-white ring-1 ring-slate-200">
      {studios.map((s) => (
        <div key={s.studio_id}>
          <button
            data-testid="policies.studio.toggle"
            aria-expanded={expanded === s.studio_id}
            onClick={() => setExpanded(expanded === s.studio_id ? null : s.studio_id)}
            className="flex w-full items-center justify-between px-4 py-3 text-left font-medium"
          >
            <span className="flex items-center gap-2.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.accent }} aria-hidden />
              <span className="flex flex-col">
                {s.studio_name}
                <span className="text-xs font-normal text-slate-500">{s.neighborhood}</span>
              </span>
            </span>
            <span className="text-slate-400">{expanded === s.studio_id ? '−' : '+'}</span>
          </button>
          {expanded === s.studio_id && <div className="px-4 pb-4"><PolicyPanel studio={s} /></div>}
        </div>
      ))}
    </div>
  )
}

// The studio name heading is web-only: on wap the expanded toggle already names
// the studio right above the rules (docs/design/studio-policies.md v2).
function PolicyPanel({ studio, showName = false }: { studio: Studio; showName?: boolean }) {
  return (
    <div data-testid="policies.panel" className="flex flex-col gap-3">
      {showName && (
        <h2 className="text-lg font-semibold">
          <span data-testid="policies.studio.name">{studio.studio_name}</span>{' '}
          <span className="font-normal text-slate-500">· {studio.neighborhood}</span>
        </h2>
      )}
      <ul className="flex flex-col gap-3">
        {studio.rules.map((r) => (
          <li key={r.id} data-testid="policies.rule.item">
            <p data-testid="policies.rule.title" className="font-medium">{r.title}</p>
            <p data-testid="policies.rule.text" className="text-slate-700">{r.text}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
