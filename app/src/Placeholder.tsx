import { Text, View } from 'react-native'

// M1 walking skeleton only: replaced by the M2 feature screens.
export function Placeholder({ title }: { title: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 22, fontWeight: '600' }}>{title} (M2)</Text>
    </View>
  )
}
