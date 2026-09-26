// class.back.link returns to the screen the class was opened from, in its state
// (browse-and-book tech spec v5): links into class detail carry `back=<path+query>`.

export const classPath = (id: string, back: string) => `/classes/${id}?back=${encodeURIComponent(back)}`

const ORIGINS = { schedule: 'schedule', week: 'week', bookings: 'my bookings' } as const
type Origin = keyof typeof ORIGINS

// Only in-app origins are honoured (no open redirect); anything else is ignored.
export function parseBack(back: string | null): { to: string; origin: Origin } | null {
  const m = back?.match(/^\/(schedule|week|bookings)(\?.*)?$/)
  return m ? { to: back!, origin: m[1] as Origin } : null
}

export const backLabel = (origin: Origin) => ORIGINS[origin]
