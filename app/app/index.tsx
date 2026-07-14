import { Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useAuth } from "../src/auth/useAuth";

/**
 * Entry route: shows a splash/loading indicator while `AuthProvider` checks
 * secure storage for an existing session, then redirects to the
 * authenticated Home screen or the Welcome/onboarding screen accordingly.
 */
export default function Index() {
  const { isBootstrapping, isAuthenticated } = useAuth();

  if (isBootstrapping) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#111827" />
      </View>
    );
  }

  return <Redirect href={isAuthenticated ? "/(app)/home" : "/(onboarding)/welcome"} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
});
