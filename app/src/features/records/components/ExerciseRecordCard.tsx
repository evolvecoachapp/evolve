import { StyleSheet, Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { SectionTitle } from "../../../components/SectionTitle";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { ExerciseRecord } from "../models/ExerciseRecord";
import {
  formatRecordCount,
  formatRecordDate,
  formatRecordVolumeKg,
  formatRecordWeightKg,
} from "./formatRecordDisplay";

/** Max exercise records shown — list must already be ordered by the domain. */
const EXERCISE_LIMIT = 8;

export interface ExerciseRecordCardProps {
  /**
   * Ordered exercise records from the domain (best estimated 1RM desc).
   * This component does not sort — it only renders the first entries.
   */
  exercises: readonly ExerciseRecord[];
}

/** Per-exercise personal records list. */
export function ExerciseRecordCard({ exercises }: ExerciseRecordCardProps) {
  const styles = useThemedStyles(({ colors, typography }) =>
    StyleSheet.create({
      section: {
        gap: spacing.sm,
      },
      list: {
        gap: spacing.md,
      },
      item: {
        gap: spacing.xs,
        paddingBottom: spacing.md,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
      },
      itemLast: {
        paddingBottom: 0,
        borderBottomWidth: 0,
      },
      name: {
        ...typography.callout,
        color: colors.ink,
        fontWeight: "600",
      },
      meta: {
        ...typography.caption,
        color: colors.inkMuted,
      },
      empty: {
        ...typography.callout,
        color: colors.inkMuted,
      },
    }),
  );

  const entries = exercises.slice(0, EXERCISE_LIMIT);

  return (
    <View style={styles.section} testID="exercise-record-card">
      <SectionTitle title="Exercise Records" />
      <AppCard variant="elevated">
        {entries.length === 0 ? (
          <Text style={styles.empty}>No exercise records yet.</Text>
        ) : (
          <View style={styles.list}>
            {entries.map((exercise, index) => (
              <View
                key={exercise.exerciseId}
                style={[
                  styles.item,
                  index === entries.length - 1 ? styles.itemLast : null,
                ]}
              >
                <Text style={styles.name} numberOfLines={1}>
                  {exercise.exerciseName}
                </Text>
                <Text style={styles.meta}>
                  {formatRecordWeightKg(exercise.bestWeightKg)}
                  {" · "}
                  Est. 1RM{" "}
                  {formatRecordWeightKg(
                    exercise.bestEstimatedOneRM?.estimatedKg ?? null,
                  )}
                  {" · "}
                  {formatRecordVolumeKg(exercise.bestSingleSetVolumeKg)}
                  {" · "}
                  {formatRecordCount(exercise.bestReps)} reps
                </Text>
                <Text style={styles.meta}>
                  Last {formatRecordDate(exercise.lastRecordAt)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </AppCard>
    </View>
  );
}
