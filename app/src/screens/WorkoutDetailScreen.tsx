import { StyleSheet, Text, View } from "react-native";
import { GradientBackground } from "../components/GradientBackground";
import { ScreenContainer } from "../components/ScreenContainer";
import { SettingsHeader } from "../components/SettingsHeader";
import { spacing } from "../theme/theme";
import { useThemedStyles } from "../theme/useThemedStyles";

interface WorkoutDetailScreenProps {
  sessionId?: string;
}

/**
 * Stub for a future Workout Detail screen (Sprint 13.1.0 navigation target).
 * No detail content, analytics, or repository lookups in this sprint.
 */
export function WorkoutDetailScreen({ sessionId }: WorkoutDetailScreenProps) {
  const styles = useThemedStyles(({ colors, typography }) =>
    StyleSheet.create({
      screen: {
        flex: 1,
        backgroundColor: "transparent",
      },
      message: {
        ...typography.callout,
        color: colors.inkMuted,
        textAlign: "center",
        marginTop: spacing.xl,
      },
    }),
  );

  return (
    <GradientBackground variant="canvas">
      <View style={styles.screen}>
        <SettingsHeader title="Workout Detail" />
        <ScreenContainer gradient={false} withHeader={false}>
          <Text style={styles.message}>
            {sessionId
              ? "Workout detail coming soon."
              : "Workout not found."}
          </Text>
        </ScreenContainer>
      </View>
    </GradientBackground>
  );
}
