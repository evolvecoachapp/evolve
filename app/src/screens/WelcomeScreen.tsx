import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "../components/Button";

/**
 * Static introductory screen shown to a never-authenticated user on
 * launch. Deliberately minimal this sprint — a full multi-step onboarding
 * flow (profile completion for the Nutrition Engine, etc.) is deferred.
 */
export function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.title}>EVOLVE</Text>
        <Text style={styles.subtitle}>
          Your AI-first coach for training, nutrition, and recovery — all in one place.
        </Text>
      </View>
      <View style={styles.actions}>
        <Button label="Create account" onPress={() => router.push("/(auth)/register")} />
        <Button
          label="I already have an account"
          variant="secondary"
          onPress={() => router.push("/(auth)/login")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    padding: 24,
    paddingTop: 96,
    paddingBottom: 48,
    backgroundColor: "#FFFFFF",
  },
  hero: {
    gap: 12,
  },
  title: {
    fontSize: 40,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    fontSize: 17,
    color: "#4B5563",
    lineHeight: 24,
  },
  actions: {
    gap: 12,
  },
});
