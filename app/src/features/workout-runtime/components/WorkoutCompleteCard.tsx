import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { useTheme } from "../../../theme/ThemeContext";
import { radius, spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { WorkoutRuntime } from "../models/experience/WorkoutRuntime";

interface WorkoutCompleteCardProps {
  readonly runtime: WorkoutRuntime;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

/**
 * Clear final state for a completed workout session — presentation only.
 * Replaces the active-set editors once `runtime.state.isCompleted` is true.
 */
export function WorkoutCompleteCard({ runtime }: WorkoutCompleteCardProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(({ colors, typography }) => ({
    body: {
      alignItems: "center" as const,
      gap: spacing.md,
      paddingVertical: spacing.lg,
    },
    iconRing: {
      width: 64,
      height: 64,
      borderRadius: radius.full,
      backgroundColor: colors.pulseMuted,
      borderWidth: 1,
      borderColor: colors.borderPulse,
      alignItems: "center" as const,
      justifyContent: "center" as const,
    },
    title: {
      ...typography.title3,
      color: colors.ink,
      textAlign: "center" as const,
    },
    subtitle: {
      ...typography.callout,
      color: colors.inkMuted,
      textAlign: "center" as const,
    },
  }));

  return (
    <AppCard variant="elevated">
      <View
        style={styles.body}
        accessible
        accessibilityRole="text"
        accessibilityLabel="Workout complete"
      >
        <View style={styles.iconRing}>
          <Ionicons name="checkmark-circle" size={32} color={colors.pulse} />
        </View>
        <Text style={styles.title}>Workout complete</Text>
        <Text style={styles.subtitle}>
          {formatDuration(runtime.progress.durationSeconds)} ·{" "}
          {runtime.progress.completedSets}/{runtime.progress.totalSets} sets
          finished
        </Text>
      </View>
    </AppCard>
  );
}
