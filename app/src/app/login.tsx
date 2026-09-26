import { router, useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import { ActivityIndicator, Pressable, Text, TextInput, View, StyleSheet } from 'react-native'
// Per-icon imports: Metro does not tree-shake, so the barrel would bundle every icon.
import Dumbbell from 'lucide-react-native/icons/dumbbell'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { request, setToken, type Schemas } from '../api'
import { colors, ui } from '../theme'

const EXPIRED = 'Your session has expired. Please log in again.'

export default function LoginScreen() {
  const insets = useSafeAreaInsets()
  const { reason } = useLocalSearchParams<{ reason?: string }>()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(reason === 'expired' ? EXPIRED : null)
  const disabled = !email || !password || submitting

  async function submit() {
    if (disabled) return
    setSubmitting(true)
    setError(null)
    const r = await request<Schemas['LoginResponse']>('POST', '/auth/login', { email, password })
    setSubmitting(false)
    if (!r.ok) return setError(r.error.message)
    setToken(r.data.token)
    router.replace('/schedule')
  }

  return (
    <View style={ui.screen}>
      {/* Brand block (docs/design/login.md v2). */}
      <View style={[styles.brand, { paddingTop: insets.top + 48 }]}>
        <View style={styles.wordmark}>
          <Dumbbell color={colors.primaryText} size={30} />
          <Text style={styles.wordmarkText}>BookIt</Text>
        </View>
        <Text style={styles.tagline}>Log in to book your classes</Text>
      </View>
      <View testID="login.screen" style={styles.form}>
        <Text style={ui.title}>Log in</Text>
        <Text style={styles.label}>Email</Text>
        <TextInput
          testID="login.email.input"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          style={styles.input}
        />
        <Text style={styles.label}>Password</Text>
        <TextInput
          testID="login.password.input"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          returnKeyType="go"
          onSubmitEditing={submit}
          style={styles.input}
        />
        {/* accessible={false}: otherwise iOS merges the nested loading testID into the button. */}
        <Pressable
          testID="login.submit"
          accessible={false}
          disabled={disabled}
          onPress={submit}
          style={[ui.button, disabled && ui.buttonDisabled]}
        >
          {submitting ? (
            <ActivityIndicator testID="login.submit.loading" color={colors.primaryText} />
          ) : (
            <Text style={ui.buttonText}>Log in</Text>
          )}
        </Pressable>
        {error && <Text testID="login.error.message" style={ui.error}>{error}</Text>}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  brand: { backgroundColor: colors.primary, alignItems: 'center', gap: 6, paddingBottom: 64 },
  wordmark: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  wordmarkText: { color: colors.primaryText, fontSize: 30, fontWeight: '800' },
  tagline: { color: colors.primarySoft, fontSize: 14 },
  form: { marginHorizontal: 16, marginTop: -40, padding: 20, gap: 8, backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border, shadowColor: '#0F172A', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  label: { fontSize: 14, fontWeight: '500', color: colors.text, marginTop: 8 },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, color: colors.text },
})
