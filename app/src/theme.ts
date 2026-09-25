import { StyleSheet } from 'react-native'

export const colors = {
  primary: '#4338ca',
  primaryText: '#ffffff',
  text: '#0f172a',
  muted: '#475569',
  border: '#e2e8f0',
  surface: '#ffffff',
  background: '#f8fafc',
  danger: '#dc2626',
  badge: '#e0e7ff',
}

export const ui = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, gap: 12 },
  card: { backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 16, gap: 4 },
  title: { fontSize: 22, fontWeight: '600', color: colors.text },
  body: { fontSize: 15, color: colors.text },
  muted: { fontSize: 13, color: colors.muted },
  error: { fontSize: 14, color: colors.danger },
  link: { fontSize: 15, color: colors.primary },
  button: { backgroundColor: colors.primary, borderRadius: 8, paddingVertical: 12, paddingHorizontal: 20, alignItems: 'center' },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: colors.primaryText, fontWeight: '600', fontSize: 15 },
  ghostButton: { paddingVertical: 12, paddingHorizontal: 16, alignItems: 'center' },
  ghostText: { color: colors.text, fontSize: 15 },
  badge: { alignSelf: 'flex-start', backgroundColor: colors.badge, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, color: colors.primary, fontSize: 13, fontWeight: '500', overflow: 'hidden' },
})
