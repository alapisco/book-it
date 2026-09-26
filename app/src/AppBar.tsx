// Per-icon imports: Metro does not tree-shake, so the barrel would bundle every icon.
import ChevronLeft from 'lucide-react-native/icons/chevron-left'
import { StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors } from './theme'

// Pushed-screen app bar (class detail, check-in): back control + title.
// Tab roots use the tab navigator's styled header instead (tabs/_layout.tsx).
// The screen passes its own back control, so its identifier stays a string
// literal at the call site (ADR 0002).
export function AppBar({ title, back }: { title: string; back: React.ReactElement }) {
  const insets = useSafeAreaInsets()
  return (
    <View style={[styles.bar, { paddingTop: insets.top }]}>
      <View style={styles.row}>
        {back}
        <Text style={styles.title}>{title}</Text>
      </View>
    </View>
  )
}

// Back icon for the pushed app bar. Each screen wraps it in its own Pressable
// with a literal testID (the validator rejects identifiers passed as props).
export function BackIcon() {
  return <ChevronLeft color={colors.primaryText} size={24} />
}

export const backStyle = { padding: 4 }

const styles = StyleSheet.create({
  bar: { backgroundColor: colors.primary },
  row: { height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 6 },
  title: { color: colors.primaryText, fontSize: 18, fontWeight: '600' },
})
