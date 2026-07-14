import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppButton } from "../components/AppButton";
import { colors, spacing, typography } from "../theme/theme";

/**
 * Static introductory screen shown to a never-authenticated user on
 * launch. Deliberately minimal this sprint — a full multi-step onboarding
 * flow (profile completion for the Nutrition Engine, etc.) is deferred.
 */
export function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + spacing["3xl"], paddingBottom: insets.bottom + spacing["3xl"] },
      ]}
    >
      <View style={styles.hero}>
        <Text style={styles.title}>EVOLVE</Text>
        <Text style={styles.subtitle}>
          Your AI-first coach for training, nutrition, and recovery — all in one place.
        </Text>
      </View>
      <View style={styles.actions}>
        <AppButton label="Create account" onPress={() => router.push("/(auth)/register")} />
        <AppButton
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
    padding: spacing.xl,
    backgroundColor: colors.surface,
  },
  hero: {
    gap: spacing.md,
  },
  title: {
    fontSize: 40,
    fontWeight: "700",
    color: colors.text,
  },
  subtitle: {
    ...typography.body,
    fontSize: 17,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  actions: {
    gap: spacing.md,
  },
});
