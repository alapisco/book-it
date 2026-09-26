import { router, useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { request, type Load, type Schemas } from '../../api'
import { flags } from '../../flags'
import { formatDate, formatTime } from '../../format'
import { Sheet } from '../../Sheet'
import { colors, ui } from '../../theme'

type Booking = Schemas['Booking']
type Entry = Schemas['WaitlistEntry']
type Data = { bookings: Booking[]; waitlist: Entry[] }

const when = (b: Booking | Entry) => `${formatDate(b.studio_class.start_at)} · ${formatTime(b.studio_class.start_at)} UTC`

export default function BookingsScreen() {
  const [state, setState] = useState<Load<Data>>({ status: 'loading' })
  const [cancelling, setCancelling] = useState<Booking | null>(null)
  const [version, setVersion] = useState(0) // bump to reload

  // Reload whenever the tab gains focus, e.g. after booking from class detail.
  useFocusEffect(
    useCallback(() => {
      let current = true
      // Bookings and waitlist load together and share one loading/error state.
      // ios never calls /me/waitlist (waitlist PRD AC-11).
      Promise.all([
        request<Booking[]>('GET', '/me/bookings'),
        flags.waitlist ? request<Entry[]>('GET', '/me/waitlist') : Promise.resolve({ ok: true as const, data: [] }),
      ]).then(([b, w]) => {
        if (!current) return
        if (!b.ok) setState({ status: 'error', error: b.error })
        else if (!w.ok) setState({ status: 'error', error: w.error })
        else setState({ status: 'ready', data: { bookings: b.data, waitlist: w.data } })
      })
      return () => {
        current = false
      }
    }, [version]),
  )

  const bookings = state.status === 'ready' ? state.data.bookings : null
  const waitlist = state.status === 'ready' ? state.data.waitlist : []
  const reload = () => setVersion((v) => v + 1)
  const cancelled = () => {
    setCancelling(null)
    reload()
  }

  return (
    <View style={ui.screen}>
      <ScrollView testID="bookings.screen" contentContainerStyle={ui.content}>
        {state.status === 'loading' && <Text testID="bookings.loading" style={ui.muted}>Loading bookings…</Text>}
        {state.status === 'error' && <Text testID="bookings.error" style={ui.error}>{state.error.message}</Text>}
        {bookings && bookings.length === 0 && (
          <View style={styles.empty}>
            <Text testID="bookings.empty" style={ui.body}>You have no upcoming bookings.</Text>
            <Pressable testID="bookings.empty.browse" onPress={() => router.navigate('/schedule')}>
              <Text style={ui.link}>Browse schedule</Text>
            </Pressable>
          </View>
        )}
        {bookings && bookings.length > 0 && (
          <View testID="bookings.list" style={styles.list}>
            {bookings.map((b) => (
              <View key={b.id} testID="bookings.item" style={ui.card}>
                <Text testID="bookings.item.name" style={styles.name}>{b.studio_class.name}</Text>
                <Text testID="bookings.item.studio" style={ui.muted}>{b.studio_class.studio_name}</Text>
                <Text testID="bookings.item.time" style={ui.muted}>{when(b)}</Text>
                <View style={styles.action}>
                  {b.can_cancel ? (
                    <Pressable testID="bookings.item.cancel" onPress={() => setCancelling(b)} style={styles.cancel}>
                      <Text style={styles.cancelText}>Cancel</Text>
                    </Pressable>
                  ) : (
                    <Text testID="bookings.item.cancel-closed" style={ui.muted}>Cancellation closed</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
        {flags.waitlist && waitlist.length > 0 && <WaitlistSection entries={waitlist} onChanged={reload} />}
      </ScrollView>

      {cancelling && (
        <Sheet onClose={() => setCancelling(null)}>
          <View testID="booking.cancel.sheet">
            <CancelConfirm booking={cancelling} onCancelled={cancelled} onDismiss={() => setCancelling(null)} />
          </View>
        </Sheet>
      )}
    </View>
  )
}

// Only rendered where the waitlist flag is on; leaving is immediate (docs/design/waitlist.md).
function WaitlistSection({ entries, onChanged }: { entries: Entry[]; onChanged: () => void }) {
  const [leaving, setLeaving] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function leave(e: Entry) {
    setLeaving(e.id)
    setError(null)
    const r = await request<void>('DELETE', `/classes/${e.class_id}/waitlist`)
    setLeaving(null)
    if (r.ok) onChanged()
    else setError(r.error.message)
  }

  return (
    <View testID="waitlist.section" style={styles.section}>
      <Text style={styles.sectionTitle}>Waitlist</Text>
      {error && <Text testID="waitlist.leave.error" style={ui.error}>{error}</Text>}
      <View testID="waitlist.list" style={styles.list}>
        {entries.map((e) => (
          <View key={e.id} testID="waitlist.item" style={ui.card}>
            <Text testID="waitlist.item.name" style={styles.name}>{e.studio_class.name}</Text>
            <Text testID="waitlist.item.time" style={ui.muted}>{when(e)}</Text>
            <Text testID="waitlist.item.position" style={ui.muted}>#{e.position} on the waitlist</Text>
            <View style={styles.action}>
              {/* accessible={false}: otherwise iOS merges the nested loading testID into the button. */}
              <Pressable
                testID="waitlist.item.leave"
                accessible={false}
                disabled={leaving === e.id}
                onPress={() => leave(e)}
                style={styles.leave}
              >
                {leaving === e.id ? (
                  <ActivityIndicator testID="waitlist.leave.loading" color={colors.muted} />
                ) : (
                  <Text style={ui.ghostText}>Leave waitlist</Text>
                )}
              </Pressable>
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}

function CancelConfirm({ booking, onCancelled, onDismiss }: {
  booking: Booking
  onCancelled: () => void
  onDismiss: () => void
}) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const c = booking.studio_class

  async function submit() {
    setSubmitting(true)
    setError(null)
    const r = await request<void>('DELETE', `/bookings/${booking.id}`)
    setSubmitting(false)
    if (r.ok) onCancelled()
    else setError(r.error.message)
  }

  return (
    <View style={styles.sheetBody}>
      <Text style={styles.sheetTitle}>Cancel booking?</Text>
      <Text testID="booking.cancel.summary" style={ui.body}>
        {c.name} · {formatDate(c.start_at)} · {formatTime(c.start_at)} UTC
      </Text>
      {error && <Text testID="booking.cancel.error" style={ui.error}>{error}</Text>}
      <View style={styles.sheetButtons}>
        <Pressable testID="booking.cancel.dismiss" onPress={onDismiss} style={ui.ghostButton}>
          <Text style={ui.ghostText}>Keep booking</Text>
        </Pressable>
        {/* accessible={false}: otherwise iOS merges the nested loading testID into the button. */}
        <Pressable
          testID="booking.cancel.confirm"
          accessible={false}
          disabled={submitting}
          onPress={submit}
          style={[ui.button, styles.danger, submitting && ui.buttonDisabled]}
        >
          {submitting ? (
            <ActivityIndicator testID="booking.cancel.loading" color={colors.primaryText} />
          ) : (
            <Text style={ui.buttonText}>Cancel booking</Text>
          )}
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  empty: { gap: 8 },
  section: { gap: 10, marginTop: 8 },
  sectionTitle: { fontSize: 17, fontWeight: '600', color: colors.text },
  leave: { borderWidth: 1, borderColor: colors.border, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 6 },
  list: { gap: 12 },
  name: { fontSize: 16, fontWeight: '600', color: colors.text },
  action: { marginTop: 8, alignItems: 'flex-start' },
  cancel: { borderWidth: 1, borderColor: '#fecaca', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 6 },
  cancelText: { color: '#b91c1c', fontWeight: '500' },
  sheetBody: { gap: 14 },
  sheetTitle: { fontSize: 18, fontWeight: '600', color: colors.text },
  sheetButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  danger: { backgroundColor: colors.danger },
})
