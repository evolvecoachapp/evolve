import { StyleSheet, Text, View } from "react-native";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { ExerciseSet } from "../models/ExerciseSet";

interface WorkoutWarmupSetsListProps {
  warmupSets: ExerciseSet[];
}

function formatWarmupSet(set: ExerciseSet): string {
  const parts: string[] = [];
  if (set.targetWeight) {
    parts.push(`${set.targetWeight} kg`);
  }
  if (set.targetReps) {
    parts.push(`${set.targetReps} reps`);
  }
  if (set.percentage) {
    parts.push(`${set.percentage}%`);
  }
  return parts.length > 0 ? parts.join(" · ") : "Warm-up";
}

/** Presentation-only warm-up set list — not logged in the active session flow. */
export function WorkoutWarmupSetsList({ warmupSets }: WorkoutWarmupSetsListProps) {
  const styles = useThemedStyles(({ colors, typography, radius }) =>
    StyleSheet.create({
      container: {
        gap: spacing.sm,
      },
      label: {
        ...typography.caption,
        color: colors.inkMuted,
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 0.6,
      },
      row: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.sm,
      },
      chip: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: radius.full,
        backgroundColor: colors.overlayStrong,
      },
      chipText: {
        ...typography.caption,
        color: colors.inkSecondary,
        fontWeight: "600",
      },
    }),
  );

  if (warmupSets.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Warm-up sets</Text>
      <View style={styles.row}>
        {warmupSets.map((set, index) => (
          <View key={set.id} style={styles.chip}>
            <Text style={styles.chipText}>
              {index + 1}. {formatWarmupSet(set)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
