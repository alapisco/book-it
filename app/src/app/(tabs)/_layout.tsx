import { Redirect } from 'expo-router'
import { Tabs } from 'expo-router/js-tabs'
// Per-icon imports: Metro does not tree-shake, so the barrel would bundle every icon.
import CalendarDays from 'lucide-react-native/icons/calendar-days'
import CalendarRange from 'lucide-react-native/icons/calendar-range'
import ScrollText from 'lucide-react-native/icons/scroll-text'
import Ticket from 'lucide-react-native/icons/ticket'
import { Text } from 'react-native'
import { getToken } from '../../api'
import { flags } from '../../flags'
import { colors } from '../../theme'

// "BookIt · <title>" in the purple app bar on every tab root (docs/design/app-shell.md v2).
function HeaderTitle({ title }: { title: string }) {
  return (
    <Text style={{ color: colors.primaryText, fontSize: 18, fontWeight: '600' }}>
      <Text style={{ fontWeight: '800' }}>BookIt</Text>
      <Text style={{ color: colors.primaryMuted }}>{'  ·  '}</Text>
      {title}
    </Text>
  )
}

export default function TabsLayout() {
  if (!getToken()) return <Redirect href="/login" />
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.primaryText,
        headerTitleAlign: 'left',
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 12, fontWeight: '500' },
      }}
    >
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Schedule',
          headerTitle: () => <HeaderTitle title="Schedule" />,
          tabBarIcon: ({ color, size }) => <CalendarDays color={color} size={size} />,
          tabBarButtonTestID: 'nav.schedule.link',
        }}
      />
      <Tabs.Screen
        name="week"
        options={{
          title: 'Week',
          headerTitle: () => <HeaderTitle title="Week" />,
          tabBarIcon: ({ color, size }) => <CalendarRange color={color} size={size} />,
          tabBarButtonTestID: 'nav.week.link',
          // Both OSes have the week view today; the flag keeps the matrix the single source.
          href: flags.week_calendar ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Bookings',
          headerTitle: () => <HeaderTitle title="My bookings" />,
          tabBarIcon: ({ color, size }) => <Ticket color={color} size={size} />,
          tabBarButtonTestID: 'nav.bookings.link',
        }}
      />
      <Tabs.Screen
        name="policies"
        options={{
          title: 'Policies',
          headerTitle: () => <HeaderTitle title="Policies" />,
          tabBarIcon: ({ color, size }) => <ScrollText color={color} size={size} />,
          tabBarButtonTestID: 'nav.policies.link',
        }}
      />
    </Tabs>
  )
}
