import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HeroEntrance } from "../animation/HeroEntrance";
import { AppButton } from "../components/AppButton";
import { GlowOrb } from "../components/GlowOrb";
import { GradientBackground } from "../components/GradientBackground";
import { heroLayout, spacing } from "../theme/theme";
import { useThemedStyles } from "../theme/useThemedStyles";

/**
 * Static introductory screen shown to a never-authenticated user on
 * launch. Deliberately minimal this sprint — a full multi-step onboarding
 * flow (profile completion for the Nutrition Engine, etc.) is deferred.
 */
export function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const styles = useThemedStyles(({ colors, typography }) =>
    StyleSheet.create({
      container: {
        flex: 1,
        justifyContent: "space-between",
        padding: spacing.xl,
      },
      hero: {
        gap: spacing.md,
        position: "relative",
      },
      glow: {
        top: heroLayout.welcomeGlowOffset.top,
        right: heroLayout.welcomeGlowOffset.right,
      },
      overline: {
        ...typography.eyebrow,
        color: colors.pulse,
      },
      title: {
        ...typography.titleWelcome,
      },
      subtitle: {
        ...typography.bodyLead,
        maxWidth: 320,
      },
      actions: {
        gap: spacing.md,
      },
    }),
  );

  return (
    <GradientBackground variant="canvas">
      <View
        style={[
          styles.container,
          { paddingTop: insets.top + spacing["3xl"], paddingBottom: insets.bottom + spacing["3xl"] },
        ]}
      >
        <HeroEntrance>
          <View style={styles.hero}>
            <GlowOrb tone="pulse" size={heroLayout.welcomeGlowSize} style={styles.glow} animated />
            <Text style={styles.overline}>Performance coaching</Text>
            <Text style={styles.title}>EVOLVE</Text>
            <Text style={styles.subtitle}>
              Your AI-first coach for training, nutrition, and recovery — all in one place.
            </Text>
          </View>
        </HeroEntrance>
        <View style={styles.actions}>
          <AppButton label="Create account" size="lg" onPress={() => router.push("/(auth)/register")} />
          <AppButton
            label="I already have an account"
            variant="secondary"
            size="lg"
            onPress={() => router.push("/(auth)/login")}
          />
        </View>
      </View>
    </GradientBackground>
  );
}
