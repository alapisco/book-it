import { Tabs } from 'expo-router/js-tabs'

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#4338ca' }}>
      <Tabs.Screen name="schedule" options={{ title: 'Schedule', tabBarButtonTestID: 'nav.schedule.link' }} />
      <Tabs.Screen name="bookings" options={{ title: 'My bookings', tabBarButtonTestID: 'nav.bookings.link' }} />
    </Tabs>
  )
}
