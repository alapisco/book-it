import { StyleSheet } from 'react-native'

// Tokens from docs/design/visual-language.md (shared with web and wap).
export const colors = {
  primary: '#4338CA',
  primaryText: '#FFFFFF',
  primarySoft: '#E0E7FF',
  primaryMuted: '#C7D2FE',
  text: '#0F172A',
  muted: '#475569',
  subtle: '#94A3B8',
  border: '#E2E8F0',
  surface: '#FFFFFF',
  background: '#F8FAFC',
  danger: '#DC2626',
  amber: '#B45309',
  green: '#047857',
}

export const ui = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, gap: 12 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 4,
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  accentCard: { borderLeftWidth: 4 },
  title: { fontSize: 22, fontWeight: '700', color: colors.text },
  cardTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  body: { fontSize: 15, color: colors.text },
  muted: { fontSize: 13, color: colors.muted },
  error: { fontSize: 14, color: colors.danger },
  link: { fontSize: 15, fontWeight: '500', color: colors.primary },
  button: { backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 13, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: colors.primaryText, fontWeight: '600', fontSize: 16 },
  ghostButton: { paddingVertical: 12, paddingHorizontal: 16, alignItems: 'center' },
  ghostText: { color: colors.text, fontSize: 15 },
  badge: { alignSelf: 'flex-start', backgroundColor: colors.primarySoft, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, color: colors.primary, fontSize: 13, fontWeight: '600', overflow: 'hidden' },
})
