import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { GradientBackground } from "../components/GradientBackground";
import { ScreenContainer } from "../components/ScreenContainer";
import { SettingsHeader } from "../components/SettingsHeader";
import { WorkoutSummaryStats } from "../features/workout/components";
import type { WorkoutSummary } from "../features/workout/models/WorkoutSummary";
import { spacing } from "../theme/theme";
import { useThemedStyles } from "../theme/useThemedStyles";

interface WorkoutSummaryScreenProps {
  summary: WorkoutSummary | null;
}

export function WorkoutSummaryScreen({ summary }: WorkoutSummaryScreenProps) {
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
                <WorkoutSummaryStats summary={summary} />
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
