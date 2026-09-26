import { router, useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import QRCode from 'react-native-qrcode-svg'
import { request, type Load, type Schemas } from '../../api'
import { AppBar, BackIcon, backStyle } from '../../AppBar'
import { formatTime } from '../../format'
import { colors, ui } from '../../theme'

type Pass = Schemas['CheckinPass']
type Data = { pass: Pass; studioClass: Schemas['StudioClass'] }

const POLL_MS = 2000

function statusText(p: Pass): string {
  if (p.status === 'checked_in' && p.checked_in_local) return `Checked in at ${formatTime(p.checked_in_local)}`
  if (p.status === 'not_open') return `Check-in opens at ${formatTime(p.window_opens_local)}`
  if (p.status === 'closed') return `Check-in closed at ${formatTime(p.window_closes_local)}`
  return 'Show this code at the front desk'
}

// The gym's scanner is an API client (POST /checkins); this screen polls until
// it sees the result (docs/prd/qr-check-in.md AC-6).
export default function CheckinScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>()
  const [state, setState] = useState<Load<Data>>({ status: 'loading' })

  useEffect(() => {
    let current = true
    let timer: ReturnType<typeof setInterval> | undefined
    async function load() {
      const p = await request<Pass>('GET', `/bookings/${bookingId}/checkin`)
      if (!current) return
      if (!p.ok) {
        // A failed re-read keeps the last good content.
        setState((prev) => (prev.status === 'ready' ? prev : { status: 'error', error: p.error }))
        return
      }
      const c = await request<Schemas['StudioClass']>('GET', `/classes/${p.data.class_id}`)
      if (!current) return
      if (!c.ok) {
        setState((prev) => (prev.status === 'ready' ? prev : { status: 'error', error: c.error }))
        return
      }
      setState({ status: 'ready', data: { pass: p.data, studioClass: c.data } })
      if (p.data.status === 'checked_in' || p.data.status === 'closed') clearInterval(timer)
    }
    load()
    timer = setInterval(load, POLL_MS)
    return () => {
      current = false
      clearInterval(timer)
    }
  }, [bookingId])

  const data = state.status === 'ready' ? state.data : null
  return (
    <View style={ui.screen}>
      <AppBar
        title="Check-in"
        back={
          <Pressable
            testID="checkin.back.link"
            accessibilityRole="button"
            accessibilityLabel="Back"
            hitSlop={12}
            style={backStyle}
            onPress={() => (router.canDismiss() ? router.dismiss() : router.replace('/bookings'))}
          >
            <BackIcon />
          </Pressable>
        }
      />
      <View testID="checkin.screen" style={ui.content}>
        {state.status === 'loading' && <Text testID="checkin.loading" style={ui.muted}>Loading check-in code…</Text>}
        {state.status === 'error' && <Text testID="checkin.error" style={ui.error}>{state.error.message}</Text>}
        {data && (
          <View style={[ui.card, styles.card]}>
            <Text testID="checkin.class.name" style={ui.title}>{data.studioClass.name}</Text>
            <View testID="checkin.qr.image" style={styles.qr}>
              <QRCode value={data.pass.qr_payload} size={220} />
            </View>
            <Text testID="checkin.code.text" selectable style={styles.code}>{data.pass.code}</Text>
            <Text testID="checkin.status.text" style={[ui.body, data.pass.status === 'checked_in' && styles.done]}>
              {statusText(data.pass)}
            </Text>
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: { alignItems: 'center', gap: 16, paddingVertical: 24 },
  qr: { padding: 12, backgroundColor: colors.surface },
  code: { fontSize: 28, fontWeight: '700', letterSpacing: 3, fontFamily: 'monospace', color: colors.text },
  done: { color: colors.green, fontWeight: '600' },
})
