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
    <div data-platform={isWap ? 'wap' : 'web'} className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <form
        data-testid="login.screen"
        onSubmit={submit}
        className="flex w-full max-w-sm flex-col gap-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
      >
        <h1 className="text-xl font-semibold">Log in to BookIt</h1>
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
          className="rounded bg-indigo-600 px-4 py-2 font-medium text-white disabled:opacity-50"
        >
          {submitting ? <span data-testid="login.submit.loading"><Spinner /></span> : 'Log in'}
        </button>
        {error && <p data-testid="login.error.message" className="text-sm text-red-600">{error}</p>}
      </form>
    </div>
  )
}
