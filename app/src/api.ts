// The only place the native app talks to the API. Shapes come from the
// generated contract (src/api-schema.ts, `npm run gen:api`), never declared here.
import { Platform } from 'react-native'
import type { components } from './api-schema'

export type Schemas = components['schemas']
export type ApiError = { status: number; code: string; message: string }
export type Result<T> = { ok: true; data: T } | { ok: false; error: ApiError }

// The Android emulator reaches the host machine at 10.0.2.2.
const API_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  (Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000')

// Set from EXPO_PUBLIC_TEST_SESSION or a deep link's ?testSession= (ADR 0006).
let testSession: string | null = process.env.EXPO_PUBLIC_TEST_SESSION ?? null

export function setTestSession(id: string) {
  testSession = id
}

export async function request<T>(method: string, path: string, body?: unknown): Promise<Result<T>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (testSession) headers['X-Test-Session'] = testSession

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
