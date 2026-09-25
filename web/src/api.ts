// The only place the web app talks to the API. Shapes come from the
// generated contract (src/api-schema.ts, `npm run gen:api`), never declared here.
import type { components } from './api-schema'

export type Schemas = components['schemas']
export type ApiError = { status: number; code: string; message: string }
export type Result<T> = { ok: true; data: T } | { ok: false; error: ApiError }

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'
const SESSION_KEY = 'bookit.testSession'

// ?testSession=<id> on any URL pins this browser to a test session (ADR 0006).
const sessionFromUrl = new URLSearchParams(window.location.search).get('testSession')
if (sessionFromUrl) localStorage.setItem(SESSION_KEY, sessionFromUrl)

export async function request<T>(method: string, path: string, body?: unknown): Promise<Result<T>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const session = localStorage.getItem(SESSION_KEY)
  if (session) headers['X-Test-Session'] = session

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
  return {
    ok: false,
    error: {
      status: res.status,
      code: json?.error?.code ?? 'UNKNOWN',
      message: json?.error?.message ?? `HTTP ${res.status}`,
    },
  }
}
