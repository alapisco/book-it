// Availability scale (docs/design/visual-language.md). The text label always
// carries the meaning; colour only reinforces it.
import type { Schemas } from './api'

export type Tone = 'muted' | 'amber' | 'green'

export function availabilityTone(c: Schemas['StudioClass']): Tone {
  if (c.has_started || c.is_full) return 'muted'
  return c.spots_left <= 3 ? 'amber' : 'green'
}

export const toneClass: Record<Tone, string> = {
  muted: 'text-slate-500',
  amber: 'text-amber-700',
  green: 'text-emerald-700',
}
