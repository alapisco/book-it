import { router, useLocalSearchParams } from 'expo-router'
// Per-icon imports: Metro does not tree-shake, so the barrel would bundle every icon.
import Clock from 'lucide-react-native/icons/clock'
import ListOrdered from 'lucide-react-native/icons/list-ordered'
import MapPin from 'lucide-react-native/icons/map-pin'
import QrCode from 'lucide-react-native/icons/qr-code'
import User from 'lucide-react-native/icons/user'
import Users from 'lucide-react-native/icons/users'
import { useEffect, useState, type ReactNode } from 'react'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { request, type Load, type Schemas } from '../../api'
import { AppBar, BackIcon, backStyle } from '../../AppBar'
import { availabilityTone, toneColor } from '../../availability'
import { flags } from '../../flags'
import { formatDate, formatTime, timeRange } from '../../format'
import { Sheet } from '../../Sheet'
import { colors, ui } from '../../theme'

type StudioClass = Schemas['StudioClass']

// Leaving pops back to the tabs underneath rather than pushing them again:
// duplicate hidden screens confuse Appium on iOS.
export default function ClassScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const insets = useSafeAreaInsets()
  const [state, setState] = useState<Load<StudioClass>>({ status: 'loading' })
  const [confirming, setConfirming] = useState(false)
  const [version, setVersion] = useState(0) // bump to reload

  useEffect(() => {
    let current = true
    request<StudioClass>('GET', `/classes/${id}`).then((r) => {
      if (current) setState(r.ok ? { status: 'ready', data: r.data } : { status: 'error', error: r.error })
    })
    return () => {
      current = false
    }
  }, [id, version])

  const c = state.status === 'ready' ? state.data : null
  const close = () => {
    setConfirming(false)
    setVersion((v) => v + 1)
  }

  return (
    <View style={ui.screen}>
      <AppBar
        title="Class"
        back={
          <Pressable
            testID="class.back.link"
            accessibilityRole="button"
            accessibilityLabel="Back"
            hitSlop={12}
            style={backStyle}
            onPress={() => {
              // Pop back to the screen we came from (schedule or week on this class's date, or bookings).
              // After a cold-start deep link there is nothing to pop, so replace instead.
              if (router.canDismiss()) router.dismiss()
              else router.replace(c ? `/schedule?date=${c.start_local.slice(0, 10)}` : '/schedule')
            }}
          >
            <BackIcon />
          </Pressable>
        }
      />
      <ScrollView testID="class.screen" contentContainerStyle={ui.content}>
        {state.status === 'loading' && <Text testID="class.loading" style={ui.muted}>Loading class…</Text>}
        {state.status === 'error' && <Text testID="class.error" style={ui.error}>{state.error.message}</Text>}
        {c && (
          <View style={[ui.card, styles.details, { borderTopColor: c.studio_accent }]}>
            <Text testID="class.name.text" style={ui.title}>{c.name}</Text>
            <InfoRow icon={<MapPin color={colors.subtle} size={18} />}>
              <Text testID="class.studio.text" style={ui.body}>{c.studio_name} · {c.studio_neighborhood}</Text>
            </InfoRow>
            <InfoRow icon={<User color={colors.subtle} size={18} />}>
              <Text testID="class.instructor.text" style={ui.body}>with {c.instructor}</Text>
            </InfoRow>
            <InfoRow icon={<Clock color={colors.subtle} size={18} />}>
              <Text testID="class.time.text" style={ui.body}>{formatDate(c.start_local)} · {timeRange(c)}</Text>
            </InfoRow>
            <InfoRow icon={<Users color={colors.subtle} size={18} />}>
              <Text testID="class.spots.text" style={[ui.body, styles.spots, { color: toneColor[availabilityTone(c)] }]}>
                {c.is_full ? 'Full' : `${c.spots_left} of ${c.capacity} spots left`}
              </Text>
            </InfoRow>
          </View>
        )}
      </ScrollView>

      {/* The action area is pinned to the bottom above the safe area (browse-and-book design v2). */}
      {c && (
        <View style={[styles.actionBar, { paddingBottom: Math.max(12, insets.bottom) }]}>
          <ClassAction studioClass={c} onBook={() => setConfirming(true)} onChanged={() => setVersion((v) => v + 1)} />
        </View>
      )}

      {confirming && c && (
        <Sheet onClose={close}>
          <View testID="booking.confirm.sheet">
            <BookingConfirm studioClass={c} onDone={close} />
          </View>
        </Sheet>
      )}
    </View>
  )
}

function InfoRow({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <View style={styles.infoRow}>
      {icon}
      <View style={styles.infoText}>{children}</View>
    </View>
  )
}

// Exactly one action, first match wins (docs/design/browse-and-book.md).
function ClassAction({ studioClass: c, onBook, onChanged }: {
  studioClass: StudioClass
  onBook: () => void
  onChanged: () => void
}) {
  if (c.my_booking_id) {
    return (
      <View style={styles.bookedRow}>
        <Text testID="class.booked.badge" style={ui.badge}>You're booked</Text>
        <Pressable testID="class.bookings.link" onPress={() => router.dismissTo('/bookings')}>
          <Text style={ui.link}>View my bookings</Text>
        </Pressable>
        {flags.qr_check_in && (
          <Pressable testID="class.checkin.link" accessible={false} onPress={() => router.push(`/checkin/${c.my_booking_id}`)} style={styles.inlineIcon}>
            <QrCode color={colors.primary} size={18} />
            <Text style={ui.link}>Show check-in code</Text>
          </Pressable>
        )}
      </View>
    )
  }
  if (c.has_started) return <Text testID="class.started.badge" style={ui.muted}>Class has started</Text>
  if (c.is_full) {
    return (
      <View style={styles.fullColumn}>
        <Text testID="class.full.badge" style={ui.muted}>Class full</Text>
        {/* ios: flag is false, so no waitlist element exists at all (waitlist PRD AC-10). */}
        {flags.waitlist && <WaitlistAction studioClass={c} onChanged={onChanged} />}
      </View>
    )
  }
  return (
    <Pressable testID="class.book.button" onPress={onBook} style={ui.button}>
      <Text style={ui.buttonText}>Book</Text>
    </Pressable>
  )
}

function WaitlistAction({ studioClass: c, onChanged }: { studioClass: StudioClass; onChanged: () => void }) {
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (c.my_waitlist_position) {
    return (
      <View style={styles.inlineIcon}>
        <ListOrdered color={colors.primary} size={18} />
        <Text testID="class.waitlist.position" style={styles.position}>You're #{c.my_waitlist_position} on the waitlist</Text>
      </View>
    )
  }

  async function join() {
    setJoining(true)
    setError(null)
    const r = await request<Schemas['WaitlistEntry']>('POST', `/classes/${c.id}/waitlist`)
    setJoining(false)
    if (r.ok) onChanged()
    else setError(r.error.message)
  }

  return (
    <View style={styles.fullColumn}>
      {/* accessible={false}: otherwise iOS merges the nested loading testID into the button. */}
      <Pressable
        testID="class.waitlist.join"
        accessible={false}
        disabled={joining}
        onPress={join}
        style={[ui.button, joining && ui.buttonDisabled]}
      >
        {joining ? (
          <ActivityIndicator testID="class.waitlist.loading" color={colors.primaryText} />
        ) : (
          <>
            <ListOrdered color={colors.primaryText} size={18} />
            <Text style={ui.buttonText}>Join waitlist</Text>
          </>
        )}
      </Pressable>
      {error && <Text testID="class.waitlist.error" style={ui.error}>{error}</Text>}
    </View>
  )
}

function BookingConfirm({ studioClass: c, onDone }: { studioClass: StudioClass; onDone: () => void }) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    setSubmitting(true)
    setError(null)
    const r = await request<Schemas['Booking']>('POST', '/bookings', { class_id: c.id })
    setSubmitting(false)
    if (r.ok) onDone()
    else setError(r.error.message)
  }

  return (
    <View style={styles.sheetBody}>
      <Text style={styles.sheetTitle}>Confirm booking</Text>
      <Text testID="booking.confirm.summary" style={ui.body}>
        {c.name} · {formatDate(c.start_local)} · {formatTime(c.start_local)} · {c.studio_name}
      </Text>
      {error && <Text testID="booking.confirm.error" style={ui.error}>{error}</Text>}
      <View style={styles.sheetButtons}>
        <Pressable testID="booking.confirm.dismiss" onPress={onDone} style={ui.ghostButton}>
          <Text style={ui.ghostText}>Not now</Text>
        </Pressable>
        {/* accessible={false}: otherwise iOS merges the nested loading testID into the button. */}
        <Pressable
          testID="booking.confirm.submit"
          accessible={false}
          disabled={submitting}
          onPress={submit}
          style={[ui.button, submitting && ui.buttonDisabled]}
        >
          {submitting ? (
            <ActivityIndicator testID="booking.confirm.loading" color={colors.primaryText} />
          ) : (
            <Text style={ui.buttonText}>Confirm booking</Text>
          )}
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  details: { borderTopWidth: 4, gap: 12, padding: 20 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoText: { flex: 1 },
  spots: { fontWeight: '600' },
  actionBar: { backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, paddingHorizontal: 16, paddingTop: 12 },
  bookedRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 16 },
  inlineIcon: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  fullColumn: { gap: 10 },
  position: { fontSize: 15, fontWeight: '600', color: colors.primary },
  sheetBody: { gap: 14 },
  sheetTitle: { fontSize: 18, fontWeight: '600', color: colors.text },
  sheetButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
})
