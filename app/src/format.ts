// Every date and time is shown in UTC, from UTC fields (ADR 0005).
import type { Schemas } from './api'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const pad = (n: number) => String(n).padStart(2, '0')
const parse = (iso: string) => new Date(iso.length === 10 ? `${iso}T00:00:00Z` : iso)

/** "Sat 26 Sep 2026" from a datetime or a YYYY-MM-DD date. */
export function formatDate(iso: string): string {
  const d = parse(iso)
  return `${DAYS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

/** "07:00" */
export function formatTime(iso: string): string {
  const d = parse(iso)
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`
}

/** "07:00–08:00 UTC" */
export function timeRange(c: Schemas['StudioClass']): string {
  return `${formatTime(c.start_at)}–${formatTime(c.end_at)} UTC`
}

/** Seat label on schedule cards. */
export function spotsLabel(c: Schemas['StudioClass']): string {
  if (c.has_started) return 'Started'
  if (c.is_full) return 'Full'
  return c.spots_left === 1 ? '1 spot left' : `${c.spots_left} spots left`
}
