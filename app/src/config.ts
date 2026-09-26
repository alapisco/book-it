import { Platform } from 'react-native'

// The web app, embedded by the policies webview (docs/tech/studio-policies.md).
// The Android emulator reaches the host machine at 10.0.2.2.
export const WEB_URL =
  process.env.EXPO_PUBLIC_WEB_URL ??
  (Platform.OS === 'android' ? 'http://10.0.2.2:5173' : 'http://localhost:5173')
