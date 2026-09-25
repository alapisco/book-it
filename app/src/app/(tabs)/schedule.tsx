import { router, useFocusEffect, useLocalSearchParams } from 'expo-router'
import { useCallback, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { request, type Load, type Schemas } from '../../api'
import { formatDate, spotsLabel, timeRange } from '../../format'
import { colors, ui } from '../../theme'

type ScheduleDay = Schemas['ScheduleDay']

export default function ScheduleScreen() {
  const { date } = useLocalSearchParams<{ date?: string }>()
  // Each result remembers which date it was for, so a date change reads as loading.
  const [result, setResult] = useState<{ date?: string; load: Load<ScheduleDay> }>()
  const state: Load<ScheduleDay> = result && result.date === date ? result.load : { status: 'loading' }

  useFocusEffect(
    useCallback(() => {
      let current = true
      request<ScheduleDay>('GET', date ? `/schedule?date=${date}` : '/schedule').then((r) => {
        if (current) setResult({ date, load: r.ok ? { status: 'ready', data: r.data } : { status: 'error', error: r.error } })
      })
      return () => {
        current = false
      }
    }, [date]),
  )

  const day = state.status === 'ready' ? state.data : null
  const shownDate = day?.date ?? date

  return (
    <ScrollView testID="schedule.screen" style={ui.screen} contentContainerStyle={ui.content}>
      <View style={styles.dateBar}>
        <Pressable testID="schedule.date.prev" disabled={!day} onPress={() => day && router.setParams({ date: day.previous_date })}>
          <Text style={[ui.link, !day && ui.buttonDisabled]}>‹ Previous day</Text>
        </Pressable>
        <Text testID="schedule.date.text" style={styles.date}>{shownDate ? formatDate(shownDate) : ''}</Text>
        <Pressable testID="schedule.date.next" disabled={!day} onPress={() => day && router.setParams({ date: day.next_date })}>
          <Text style={[ui.link, !day && ui.buttonDisabled]}>Next day ›</Text>
        </Pressable>
      </View>

      {state.status === 'loading' && <Text testID="schedule.loading" style={ui.muted}>Loading classes…</Text>}
      {state.status === 'error' && <Text testID="schedule.error" style={ui.error}>{state.error.message}</Text>}
      {day && day.classes.length === 0 && <Text testID="schedule.empty" style={ui.muted}>No classes on this day.</Text>}
      {day && day.classes.length > 0 && (
        <View testID="schedule.list" style={styles.list}>
          {day.classes.map((c) => (
            // accessible={false}: otherwise iOS merges the card's nested testIDs into one element.
            <Pressable
              key={c.id}
              testID="schedule.class.card"
              accessible={false}
              onPress={() => router.push(`/classes/${c.id}`)}
              style={styles.row}
            >
              <Text testID="schedule.class.time" style={[ui.muted, styles.time]}>{timeRange(c)}</Text>
              <View style={styles.middle}>
                <Text testID="schedule.class.name" style={styles.name} numberOfLines={1}>{c.name}</Text>
                <Text testID="schedule.class.studio" style={ui.muted} numberOfLines={1}>{c.studio_name}</Text>
              </View>
              <View style={styles.right}>
                <Text testID="schedule.class.spots" style={styles.spots}>{spotsLabel(c)}</Text>
                {c.my_booking_id && <Text testID="schedule.class.booked" style={ui.badge}>Booked</Text>}
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  dateBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  date: { fontSize: 16, fontWeight: '600', color: colors.text },
  list: { backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  time: { width: 92 },
  middle: { flex: 1 },
  name: { fontSize: 15, fontWeight: '500', color: colors.text },
  right: { alignItems: 'flex-end', gap: 4 },
  spots: { fontSize: 12, fontWeight: '500', color: colors.muted },
})
