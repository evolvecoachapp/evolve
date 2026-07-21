import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { GradientBackground } from "../components/GradientBackground";
import { ScreenContainer } from "../components/ScreenContainer";
import { SettingsHeader } from "../components/SettingsHeader";
import { SessionCompleteStats } from "../features/workout/components";
import type { WorkoutSessionSummary } from "../features/workout/types/workoutSessionSummary";
import { spacing } from "../theme/theme";
import { useThemedStyles } from "../theme/useThemedStyles";

interface WorkoutSessionCompleteScreenProps {
  summary: WorkoutSessionSummary | null;
}

/**
 * Local Workout Complete experience for Sprint 12 interactive sessions.
 * Presentation only — summary is already built; nothing is persisted.
 */
export function WorkoutSessionCompleteScreen({
  summary,
}: WorkoutSessionCompleteScreenProps) {
  const styles = useThemedStyles((theme) =>
    StyleSheet.create({
      screen: {
        flex: 1,
        backgroundColor: "transparent",
      },
      content: {
        gap: spacing.xl,
        paddingBottom: spacing["3xl"],
      },
      message: {
        color: theme.colors.textSecondary,
        fontSize: 16,
        lineHeight: 24,
        textAlign: "center",
      },
      doneButton: {
        minHeight: spacing["3xl"] + spacing.sm,
      },
    }),
  );

  return (
    <GradientBackground variant="canvas">
      <View style={styles.screen}>
        <SettingsHeader title="Workout Complete" />
        <ScreenContainer gradient={false} withHeader={false}>
          <View style={styles.content}>
            {summary ? (
              <>
                <SessionCompleteStats summary={summary} />
                <AppButton
                  label="Done"
                  size="lg"
                  onPress={() => router.replace("/(app)/(tabs)/workout")}
                  style={styles.doneButton}
                  haptic="medium"
                />
              </>
            ) : (
              <Text style={styles.message}>Workout summary unavailable.</Text>
            )}
          </View>
        </ScreenContainer>
      </View>
    </GradientBackground>
  );
}
