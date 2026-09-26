import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { WebView } from 'react-native-webview'
import { WEB_URL } from '../../config'
import { colors, ui } from '../../theme'

// Embeds the wap policies page (studio_policies flag = "webview"). Debuggable,
// so Appium can switch to the web context and use the wap identifiers.
export default function PoliciesScreen() {
  return (
    <WebView
      testID="policies.webview"
      source={{ uri: `${WEB_URL}/policies?embed=1` }}
      webviewDebuggingEnabled
      startInLoadingState
      renderLoading={() => (
        <View testID="policies.webview.loading" style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      )}
      renderError={() => (
        <View style={styles.center}>
          <Text testID="policies.webview.error" style={ui.error}>Could not load the policies page.</Text>
        </View>
      )}
    />
  )
}

const styles = StyleSheet.create({
  center: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
})
