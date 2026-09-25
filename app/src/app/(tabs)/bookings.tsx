import { router, useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { request, type Load, type Schemas } from '../../api'
import { formatDate, formatTime } from '../../format'
import { Sheet } from '../../Sheet'
import { colors, ui } from '../../theme'

type Booking = Schemas['Booking']

const when = (b: Booking) => `${formatDate(b.studio_class.start_at)} · ${formatTime(b.studio_class.start_at)} UTC`

export default function BookingsScreen() {
  const [state, setState] = useState<Load<Booking[]>>({ status: 'loading' })
  const [cancelling, setCancelling] = useState<Booking | null>(null)
  const [version, setVersion] = useState(0) // bump to reload

  // Reload whenever the tab gains focus, e.g. after booking from class detail.
  useFocusEffect(
    useCallback(() => {
      let current = true
      request<Booking[]>('GET', '/me/bookings').then((r) => {
        if (current) setState(r.ok ? { status: 'ready', data: r.data } : { status: 'error', error: r.error })
      })
      return () => {
        current = false
      }
    }, [version]),
  )

  const bookings = state.status === 'ready' ? state.data : null
  const cancelled = () => {
    setCancelling(null)
    setVersion((v) => v + 1)
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
