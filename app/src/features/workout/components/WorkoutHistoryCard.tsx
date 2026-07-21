import { StyleSheet, Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { CompletedWorkout } from "../models/CompletedWorkout";
import {
  formatCompletedAt,
  formatSessionDuration,
  formatSessionVolumeKg,
} from "../utils/sessionSummaryFormatters";

interface WorkoutHistoryCardProps {
  workout: CompletedWorkout;
  onPress?: (workout: CompletedWorkout) => void;
}

interface MetaItemProps {
  label: string;
  value: string;
}

function MetaItem({ label, value }: MetaItemProps) {
  const styles = useThemedStyles(({ colors, typography }) =>
    StyleSheet.create({
      item: {
        flex: 1,
        minWidth: "40%",
        gap: spacing.xs,
      },
      label: {
        ...typography.caption,
        color: colors.inkSecondary,
        fontWeight: "600",
      },
      value: {
        ...typography.bodyMedium,
        color: colors.ink,
      },
    }),
  );

  return (
    <View style={styles.item}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

/** Reusable timeline row for a persisted `CompletedWorkout`. */
export function WorkoutHistoryCard({ workout, onPress }: WorkoutHistoryCardProps) {
  const styles = useThemedStyles(({ colors, typography }) =>
    StyleSheet.create({
      card: {
        gap: spacing.md,
      },
      header: {
        gap: spacing.xs,
      },
      title: {
        ...typography.title3,
        color: colors.ink,
      },
      programName: {
        ...typography.caption,
        color: colors.inkMuted,
      },
      completedAt: {
        ...typography.caption,
        color: colors.inkSecondary,
      },
      metaGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.md,
      },
    }),
  );

  return (
    <AppCard
      variant="elevated"
      style={styles.card}
      onPress={onPress ? () => onPress(workout) : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{workout.title}</Text>
        {workout.programName ? (
          <Text style={styles.programName} numberOfLines={1}>
            {workout.programName}
          </Text>
        ) : null}
        <Text style={styles.completedAt}>{formatCompletedAt(workout.completedAt)}</Text>
      </View>
      <View style={styles.metaGrid}>
        <MetaItem
          label="Duration"
          value={formatSessionDuration(workout.durationSeconds)}
        />
        <MetaItem
          label="Exercises"
          value={`${workout.completedExercises} / ${workout.totalExercises}`}
        />
        <MetaItem label="Sets" value={String(workout.completedSets)} />
        <MetaItem
          label="Volume"
          value={formatSessionVolumeKg(workout.estimatedVolumeKg)}
        />
      </View>
    </AppCard>
  );
}
