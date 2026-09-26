import { Dumbbell } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { request, setToken, type Schemas } from '../api'
import { Spinner } from '../ui/Spinner'
import { useMediaQuery, WAP_QUERY } from '../useMediaQuery'

const EXPIRED = 'Your session has expired. Please log in again.'

export function LoginPage() {
  const isWap = useMediaQuery(WAP_QUERY)
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(params.get('reason') === 'expired' ? EXPIRED : null)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const r = await request<Schemas['LoginResponse']>('POST', '/auth/login', { email, password })
    setSubmitting(false)
    if (!r.ok) return setError(r.error.message)
    setToken(r.data.token)
    navigate('/schedule', { replace: true })
  }

  return (
    <div data-platform={isWap ? 'wap' : 'web'} className="flex min-h-screen flex-col items-center bg-slate-50">
      {/* Brand block (docs/design/login.md v2). */}
      <div className={`flex w-full flex-col items-center gap-2 bg-indigo-700 text-white ${isWap ? 'pb-16 pt-14' : 'pb-20 pt-16'}`}>
        <span className="flex items-center gap-2 text-3xl font-bold tracking-tight">
          <Dumbbell size={30} aria-hidden />BookIt
        </span>
        <span className="text-sm text-indigo-100">Log in to book your classes</span>
      </div>
      <form
        data-testid="login.screen"
        onSubmit={submit}
        className="-mt-10 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-4 rounded-xl bg-white p-6 shadow-md ring-1 ring-slate-200"
      >
        <h1 className="text-xl font-semibold">Log in</h1>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Email
          <input
            data-testid="login.email.input"
            type="email"
            autoCapitalize="none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded border border-slate-300 px-3 py-2 font-normal"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Password
          <input
            data-testid="login.password.input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded border border-slate-300 px-3 py-2 font-normal"
          />
        </label>
        <button
          data-testid="login.submit"
          type="submit"
          disabled={!email || !password || submitting}
          className="rounded-lg bg-indigo-700 px-4 py-2.5 font-semibold text-white disabled:opacity-50"
        >
          {submitting ? <span data-testid="login.submit.loading"><Spinner /></span> : 'Log in'}
        </button>
        {error && <p data-testid="login.error.message" className="text-sm text-red-600">{error}</p>}
      </form>
    </div>
  )
}
