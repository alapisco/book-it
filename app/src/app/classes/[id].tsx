import { router, useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { request, type Load, type Schemas } from '../../api'
import { formatDate, formatTime, timeRange } from '../../format'
import { Sheet } from '../../Sheet'
import { colors, ui } from '../../theme'

type StudioClass = Schemas['StudioClass']

// Leaving pops back to the tabs underneath rather than pushing them again:
// duplicate hidden screens confuse Appium on iOS.
export default function ClassScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
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
    <SafeAreaView style={ui.screen}>
      <ScrollView testID="class.screen" contentContainerStyle={ui.content}>
        <Pressable
          testID="class.back.link"
          onPress={() => {
            // Pop back to the schedule we came from (it shows this class's date). After a
            // cold-start deep link there is nothing to pop, so replace instead.
            if (router.canDismiss()) router.dismiss()
            else router.replace(c ? `/schedule?date=${c.start_at.slice(0, 10)}` : '/schedule')
          }}
        >
          <Text style={ui.link}>← Schedule</Text>
        </Pressable>

        {state.status === 'loading' && <Text testID="class.loading" style={ui.muted}>Loading class…</Text>}
        {state.status === 'error' && <Text testID="class.error" style={ui.error}>{state.error.message}</Text>}
        {c && (
          <View style={ui.card}>
            <Text testID="class.name.text" style={ui.title}>{c.name}</Text>
            <Text testID="class.studio.text" style={ui.body}>{c.studio_name}</Text>
            <Text testID="class.instructor.text" style={ui.body}>with {c.instructor}</Text>
            <Text testID="class.time.text" style={ui.body}>{formatDate(c.start_at)} · {timeRange(c)}</Text>
            <Text testID="class.spots.text" style={[ui.body, styles.spots]}>
              {c.is_full ? 'Full' : `${c.spots_left} of ${c.capacity} spots left`}
            </Text>
            <View style={styles.action}>
              <ClassAction studioClass={c} onBook={() => setConfirming(true)} />
            </View>
          </View>
        )}
      </ScrollView>

      {confirming && c && (
        <Sheet onClose={close}>
          <View testID="booking.confirm.sheet">
            <BookingConfirm studioClass={c} onDone={close} />
          </View>
        </Sheet>
      )}
    </SafeAreaView>
  )
}

// Exactly one action, first match wins (docs/design/browse-and-book.md).
function ClassAction({ studioClass: c, onBook }: { studioClass: StudioClass; onBook: () => void }) {
  if (c.my_booking_id) {
    return (
      <View style={styles.bookedRow}>
        <Text testID="class.booked.badge" style={ui.badge}>You're booked</Text>
        <Pressable testID="class.bookings.link" onPress={() => router.dismissTo('/bookings')}>
          <Text style={ui.link}>View my bookings</Text>
        </Pressable>
      </View>
    )
  }
  if (c.has_started) return <Text testID="class.started.badge" style={ui.muted}>Class has started</Text>
  if (c.is_full) return <Text testID="class.full.badge" style={ui.muted}>Class full</Text>
  return (
    <Pressable testID="class.book.button" onPress={onBook} style={[ui.button, styles.bookButton]}>
      <Text style={ui.buttonText}>Book</Text>
    </Pressable>
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
        {c.name} · {formatDate(c.start_at)} · {formatTime(c.start_at)} UTC · {c.studio_name}
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
  spots: { fontWeight: '600' },
  action: { marginTop: 16 },
  bookedRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  bookButton: { alignSelf: 'flex-start' },
  sheetBody: { gap: 14 },
  sheetTitle: { fontSize: 18, fontWeight: '600', color: colors.text },
  sheetButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
})
