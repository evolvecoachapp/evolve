import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { useTheme } from "../../../theme/ThemeContext";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { WorkoutRuntime } from "../models/experience/WorkoutRuntime";

interface WorkoutRuntimeHeaderProps {
  readonly runtime: WorkoutRuntime;
  readonly onHistoryPress?: () => void;
  readonly onStatisticsPress?: () => void;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

/** Runtime header — presentation only. */
export function WorkoutRuntimeHeader({
  runtime,
  onHistoryPress,
  onStatisticsPress,
}: WorkoutRuntimeHeaderProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(({ colors, typography }) => ({
    container: {
      gap: spacing.sm,
      marginBottom: spacing.lg,
    },
    topRow: {
      flexDirection: "row" as const,
      alignItems: "flex-start" as const,
      justifyContent: "space-between" as const,
    },
    titles: {
      flex: 1,
      gap: spacing.xs,
      paddingRight: spacing.md,
    },
    eyebrow: {
      ...typography.caption,
      color: colors.pulse,
      fontWeight: "700" as const,
      textTransform: "uppercase" as const,
      letterSpacing: 0.6,
    },
    title: {
      ...typography.title2,
      color: colors.ink,
    },
    subtitle: {
      ...typography.callout,
      color: colors.inkMuted,
    },
    actions: {
      flexDirection: "row" as const,
      gap: spacing.sm,
    },
    action: {
      width: spacing["3xl"],
      height: spacing["3xl"],
      borderRadius: spacing.md,
      alignItems: "center" as const,
      justifyContent: "center" as const,
      backgroundColor: colors.overlayStrong,
    },
    meta: {
      flexDirection: "row" as const,
      flexWrap: "wrap" as const,
      gap: spacing.md,
    },
    metaText: {
      ...typography.caption,
      color: colors.inkSecondary,
      fontWeight: "600" as const,
    },
  }));

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.titles}>
          <Text style={styles.eyebrow}>{runtime.subtitle}</Text>
          <Text style={styles.title}>{runtime.title}</Text>
          <Text style={styles.subtitle}>{runtime.muscleGroups}</Text>
        </View>
        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Workout history"
            onPress={onHistoryPress}
            style={({ pressed }) => [styles.action, pressed && { opacity: 0.7 }]}
          >
            <Ionicons name="time-outline" size={22} color={colors.ink} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Workout statistics"
            onPress={onStatisticsPress}
            style={({ pressed }) => [styles.action, pressed && { opacity: 0.7 }]}
          >
            <Ionicons name="analytics-outline" size={22} color={colors.ink} />
          </Pressable>
        </View>
      </View>
      <View style={styles.meta}>
        <Text style={styles.metaText}>
          Duration {formatDuration(runtime.progress.durationSeconds)}
        </Text>
        <Text style={styles.metaText}>
          {runtime.progress.completedSets}/{runtime.progress.totalSets} sets
        </Text>
      </View>
    </View>
  );
}
