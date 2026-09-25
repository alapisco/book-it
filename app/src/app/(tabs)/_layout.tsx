import { Redirect } from 'expo-router'
import { Tabs } from 'expo-router/js-tabs'
import { getToken } from '../../api'
import { colors } from '../../theme'

export default function TabsLayout() {
  if (!getToken()) return <Redirect href="/login" />
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: colors.primary }}>
      <Tabs.Screen name="schedule" options={{ title: 'Schedule', tabBarButtonTestID: 'nav.schedule.link' }} />
      <Tabs.Screen name="bookings" options={{ title: 'My bookings', tabBarButtonTestID: 'nav.bookings.link' }} />
    </Tabs>
  )
}
