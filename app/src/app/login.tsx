import { router, useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import { ActivityIndicator, Pressable, Text, TextInput, View, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { request, setToken, type Schemas } from '../api'
import { colors, ui } from '../theme'

const EXPIRED = 'Your session has expired. Please log in again.'

export default function LoginScreen() {
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
    <SafeAreaView style={ui.screen}>
      <View testID="login.screen" style={styles.form}>
        <Text style={ui.title}>Log in to BookIt</Text>
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
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  form: { margin: 16, marginTop: 64, padding: 20, gap: 8, backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border },
  label: { fontSize: 14, fontWeight: '500', color: colors.text, marginTop: 8 },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, color: colors.text },
})
