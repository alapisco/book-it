// Availability scale (docs/design/visual-language.md). The text label always
// carries the meaning; colour only reinforces it. Same rules as web/src/availability.ts.
import type { Schemas } from './api'
import { colors } from './theme'

export type Tone = 'muted' | 'amber' | 'green'

export function availabilityTone(c: Schemas['StudioClass']): Tone {
  if (c.has_started || c.is_full) return 'muted'
  return c.spots_left <= 3 ? 'amber' : 'green'
}

export const toneColor: Record<Tone, string> = {
  muted: colors.muted,
  amber: colors.amber,
  green: colors.green,
}
