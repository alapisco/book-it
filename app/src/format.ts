// Dates and times shown to users are studio local time, read from the API's
// *_local fields (ADR 0007). Values are parsed as if UTC purely to read the
// wall-clock fields with getUTC*, so the device time zone never matters.
import type { Schemas } from './api'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAYS_LONG = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const pad = (n: number) => String(n).padStart(2, '0')
const parse = (local: string) => new Date(local.length === 10 ? `${local}T00:00:00Z` : `${local}Z`)

/** "Sat 26 Sep 2026" from a local date or date-time. */
export function formatDate(local: string): string {
  const d = parse(local)
  return `${DAYS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

/** "07:00" */
export function formatTime(local: string): string {
  const d = parse(local)
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`
}

/** "07:00–08:00" */
export function timeRange(c: Schemas['StudioClass']): string {
  return `${formatTime(c.start_local)}–${formatTime(c.end_local)}`
}

/** "Sat 26 Sep 2026 · 07:00" */
export function formatDateTime(local: string): string {
  return `${formatDate(local)} · ${formatTime(local)}`
}

/** Seat label on class cards. */
export function spotsLabel(c: Schemas['StudioClass']): string {
  if (c.has_started) return 'Started'
  if (c.is_full) return 'Full'
  return c.spots_left === 1 ? '1 spot left' : `${c.spots_left} spots left`
}

/** "21 – 27 Sep 2026", or "28 Sep – 4 Oct 2026" across months. */
export function formatWeekRange(start: string, end: string): string {
  const s = parse(start), e = parse(end)
  const tail = `${e.getUTCDate()} ${MONTHS[e.getUTCMonth()]} ${e.getUTCFullYear()}`
  return s.getUTCMonth() === e.getUTCMonth() ? `${s.getUTCDate()} – ${tail}` : `${s.getUTCDate()} ${MONTHS[s.getUTCMonth()]} – ${tail}`
}

/** "MONDAY 21 SEP · 14 classes" / "… · No classes" */
export function formatSectionHeader(date: string, count: number): string {
  const d = parse(date)
  const n = count === 0 ? 'No classes' : count === 1 ? '1 class' : `${count} classes`
  return `${DAYS_LONG[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()].toUpperCase()} · ${n}`
}

/** Day strip: "Mon" and "21". */
export const dayName = (date: string) => DAYS[parse(date).getUTCDay()]
export const dayNumber = (date: string) => String(parse(date).getUTCDate())
