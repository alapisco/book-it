import * as Linking from 'expo-linking'
import { Stack } from 'expo-router'
import { useEffect } from 'react'
import { setTestSession } from '../api'

export default function RootLayout() {
  // bookit://<any route>?testSession=<id> pins the app to a test session.
  const url = Linking.useURL()
  useEffect(() => {
    if (!url) return
    const id = Linking.parse(url).queryParams?.testSession
    if (typeof id === 'string') setTestSession(id)
  }, [url])

  return <Stack screenOptions={{ headerShown: false }} />
}
