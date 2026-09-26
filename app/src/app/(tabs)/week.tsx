import { router, useFocusEffect, useLocalSearchParams } from 'expo-router'
// Per-icon imports: Metro does not tree-shake, so the barrel would bundle every icon.
import ChevronLeft from 'lucide-react-native/icons/chevron-left'
import ChevronRight from 'lucide-react-native/icons/chevron-right'
import { useCallback, useRef, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { request, type Load, type Schemas } from '../../api'
import { availabilityTone, toneColor } from '../../availability'
import { dayName, dayNumber, formatSectionHeader, formatWeekRange, spotsLabel, timeRange } from '../../format'
import { colors, ui } from '../../theme'

type Week = Schemas['ScheduleWeek']

// Selected day per PRD AC-4: today in the current week, otherwise Monday; or, coming
// back from class detail, the opened class's day (AC-7).
const inWeek = (w: Week, d: string | null) => d !== null && d >= w.week_start && d <= w.week_end
const initialDay = (w: Week, day: string | null) => (inWeek(w, day) ? day! : inWeek(w, w.today) ? w.today : w.week_start)

// Week view: day strip + list, tap jumps without filtering (docs/design/week-calendar.md v2).
export default function WeekScreen() {
  const { week } = useLocalSearchParams<{ week?: string }>()
  // Each result remembers which week it was for, so a week change reads as loading.
  const [result, setResult] = useState<{ week?: string; load: Load<Week> }>()
  const [selected, setSelected] = useState<string | null>(null)
  const state: Load<Week> = result && result.week === week ? result.load : { status: 'loading' }
  const scrollRef = useRef<ScrollView>(null)
  const offsets = useRef<Record<string, number>>({})
  const listY = useRef(0) // week.list's y inside the ScrollView content; section ys are relative to it
  const pendingJump = useRef<string | null>(null)
  const returnDay = useRef<string | null>(null) // set by a card press, used by the next focus reload

  useFocusEffect(
    useCallback(() => {
      let current = true
      request<Week>('GET', week ? `/schedule/week?date=${week}` : '/schedule/week').then((r) => {
        if (!current) return
        const back = returnDay.current
        returnDay.current = null
        setResult({ week, load: r.ok ? { status: 'ready', data: r.data } : { status: 'error', error: r.error } })
        if (r.ok) {
          const day = initialDay(r.data, back)
          setSelected(day)
          // Back from class detail: the sections are already laid out, so jump now.
          if (back === day && offsets.current[day] !== undefined) jump(day, false)
          else pendingJump.current = day // scroll once its section has been laid out
        }
      })
      return () => {
        current = false
      }
    }, [week]),
  )

  const data = state.status === 'ready' ? state.data : null
  const empty = data !== null && data.days.every((d) => d.classes.length === 0)

  function jump(date: string, animated = true) {
    setSelected(date)
    const y = offsets.current[date]
    if (y !== undefined) scrollRef.current?.scrollTo({ y: listY.current + y, animated })
  }

  // A section reports its y; if it is the pending initial day, jump there.
  function onSectionLayout(date: string, y: number) {
    offsets.current[date] = y
    if (pendingJump.current === date) {
      pendingJump.current = null
      scrollRef.current?.scrollTo({ y: listY.current + y, animated: false })
    }
  }

  return (
    <View testID="week.screen" style={ui.screen}>
      <View style={styles.header}>
        <Pressable testID="week.range.prev" disabled={!data} onPress={() => data && router.setParams({ week: data.previous_week })} accessibilityLabel="Previous week" hitSlop={10} style={!data && ui.buttonDisabled}>
          <ChevronLeft color={colors.primary} size={24} />
        </Pressable>
        <Text testID="week.range.text" style={styles.range}>{data ? formatWeekRange(data.week_start, data.week_end) : ''}</Text>
        <Pressable testID="week.range.next" disabled={!data} onPress={() => data && router.setParams({ week: data.next_week })} accessibilityLabel="Next week" hitSlop={10} style={!data && ui.buttonDisabled}>
          <ChevronRight color={colors.primary} size={24} />
        </Pressable>
      </View>

      {data && (
        <View testID="week.strip" style={styles.strip}>
          {data.days.map((d) => {
            const isSelected = d.date === selected
            const isToday = d.date === data.today
            return (
              // accessible={false}: otherwise iOS merges the pill's nested testIDs into one element.
              <Pressable
                key={d.date}
                testID="week.day.pill"
                accessible={false}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                accessibilityHint={isToday ? 'today' : undefined}
                onPress={() => jump(d.date)}
                style={[styles.pill, isToday && styles.pillToday, isSelected && styles.pillSelected]}
              >
                <Text testID="week.day.name" style={[styles.pillName, isSelected && styles.onPrimary]}>{dayName(d.date)}</Text>
                <Text testID="week.day.number" style={[styles.pillNumber, isSelected && styles.onPrimary]}>{dayNumber(d.date)}</Text>
                <Text testID="week.day.count" style={[styles.pillCount, isSelected && styles.onPrimaryMuted]}>{d.classes.length}</Text>
                {d.classes.some((c) => c.my_booking_id) ? (
                  <View testID="week.day.booked" style={[styles.dot, isSelected && styles.dotSelected]} />
                ) : (
                  <View style={styles.dotSpacer} />
                )}
              </Pressable>
            )
          })}
        </View>
      )}

      <ScrollView ref={scrollRef} contentContainerStyle={ui.content}>
        {state.status === 'loading' && <Text testID="week.loading" style={ui.muted}>Loading week…</Text>}
        {state.status === 'error' && <Text testID="week.error" style={ui.error}>{state.error.message}</Text>}
        {empty && <Text testID="week.empty" style={ui.muted}>No classes this week.</Text>}
        {data && !empty && (
          <View testID="week.list" style={styles.list} onLayout={(e) => (listY.current = e.nativeEvent.layout.y)}>
            {data.days.map((d) => (
              <View key={d.date} testID="week.section" style={styles.section} onLayout={(e) => onSectionLayout(d.date, e.nativeEvent.layout.y)}>
                <Text testID="week.section.header" style={styles.sectionHeader}>{formatSectionHeader(d.date, d.classes.length)}</Text>
                {d.classes.map((c) => (
                  // accessible={false}: otherwise iOS merges the card's nested testIDs into one element.
                  <Pressable
                    key={c.id}
                    testID="week.class.card"
                    accessible={false}
                    onPress={() => {
                      returnDay.current = d.date
                      router.push(`/classes/${c.id}`)
                    }}
                    style={[ui.card, ui.accentCard, styles.row, { borderLeftColor: c.studio_accent }]}
                  >
                    <Text testID="week.class.time" style={styles.time}>{timeRange(c)}</Text>
                    <View style={styles.middle}>
                      <Text testID="week.class.name" style={ui.cardTitle} numberOfLines={1}>{c.name}</Text>
                      <Text testID="week.class.studio" style={ui.muted} numberOfLines={1}>{c.studio_name} · {c.studio_neighborhood}</Text>
                    </View>
                    <View style={styles.right}>
                      <Text testID="week.class.spots" style={[styles.spots, { color: toneColor[availabilityTone(c)] }]}>{spotsLabel(c)}</Text>
                      {c.my_booking_id && <Text testID="week.class.booked" style={ui.badge}>Booked</Text>}
                    </View>
                  </Pressable>
                ))}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 12 },
  range: { fontSize: 16, fontWeight: '700', color: colors.text },
  strip: { flexDirection: 'row', gap: 6, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.border },
  pill: { flex: 1, alignItems: 'center', paddingVertical: 6, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  pillToday: { borderWidth: 2, borderColor: colors.primary },
  pillSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  pillName: { fontSize: 11, color: colors.muted },
  pillNumber: { fontSize: 16, fontWeight: '700', color: colors.text },
  pillCount: { fontSize: 11, color: colors.muted },
  onPrimary: { color: colors.primaryText },
  onPrimaryMuted: { color: colors.primaryMuted },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary, marginTop: 2 },
  dotSelected: { backgroundColor: colors.primaryText },
  dotSpacer: { width: 6, height: 6, marginTop: 2 },
  list: { gap: 20 },
  section: { gap: 10 },
  sectionHeader: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5, color: colors.muted },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  time: { width: 92, fontSize: 14, fontWeight: '500', color: colors.text },
  middle: { flex: 1, gap: 2 },
  right: { alignItems: 'flex-end', gap: 4 },
  spots: { fontSize: 12, fontWeight: '600' },
})
