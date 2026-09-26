// The only place the web app talks to the API. Shapes come from the
// generated contract (src/api-schema.ts, `npm run gen:api`), never declared here.
import type { components } from './api-schema'
import { WAP_QUERY } from './useMediaQuery'

export type Schemas = components['schemas']
export type ApiError = { status: number; code: string; message: string }
export type Result<T> = { ok: true; data: T } | { ok: false; error: ApiError }
// State of a data-bound component; the empty state is `ready` with no items.
export type Load<T> = { status: 'loading' } | { status: 'error'; error: ApiError } | { status: 'ready'; data: T }

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'
const SESSION_KEY = 'bookit.testSession'
const TOKEN_KEY = 'bookit.token'

// ?testSession=<id> on any URL pins this browser to a test session (ADR 0006).
const sessionFromUrl = new URLSearchParams(window.location.search).get('testSession')
if (sessionFromUrl) localStorage.setItem(SESSION_KEY, sessionFromUrl)

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token)

export async function request<T>(method: string, path: string, body?: unknown): Promise<Result<T>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const session = localStorage.getItem(SESSION_KEY)
  if (session) headers['X-Test-Session'] = session
  // The platform matches the tree being rendered right now (feature-flags v2).
  headers['X-Platform'] = window.matchMedia(WAP_QUERY).matches ? 'wap' : 'web'
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  let res: Response
  try {
    res = await fetch(API_URL + path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    return { ok: false, error: { status: 0, code: 'NETWORK_ERROR', message: 'Could not reach the server.' } }
  }
  if (res.status === 204) return { ok: true, data: undefined as T }
  const json = await res.json().catch(() => null)
  if (res.ok) return { ok: true, data: json as T }
  const error = {
    status: res.status,
    code: json?.error?.code ?? 'UNKNOWN',
    message: json?.error?.message ?? `HTTP ${res.status}`,
  }
  // Any 401 outside login ends the session (docs/tech/login.md).
  if (res.status === 401 && path !== '/auth/login') {
    localStorage.removeItem(TOKEN_KEY)
    window.location.assign(error.code === 'TOKEN_EXPIRED' ? '/login?reason=expired' : '/login')
  }
  return { ok: false, error }
}
