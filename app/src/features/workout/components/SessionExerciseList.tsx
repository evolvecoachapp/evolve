import { StyleSheet, Text, View } from "react-native";
import type { WorkoutSessionExercise } from "../../training/application";
import { AppCard } from "../../../components/AppCard";
import { SectionTitle } from "../../../components/SectionTitle";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import {
  formatSessionExerciseIntensity,
  formatSessionSetLine,
  formatSessionSetsSummary,
} from "../utils/sessionPresentationFormatters";
import { WorkoutExercisePreviewRow } from "./WorkoutExercisePreviewRow";

interface SessionExerciseListProps {
  exercises: readonly WorkoutSessionExercise[];
}

/**
 * Read-only ordered exercise + set list for an executable application-layer session.
 * No logging, timers, or mutation — display only.
 */
export function SessionExerciseList({ exercises }: SessionExerciseListProps) {
  const styles = useThemedStyles(({ colors, typography }) =>
    StyleSheet.create({
      section: {
        gap: spacing.md,
      },
      header: {
        gap: spacing.xs,
      },
      countLabel: {
        ...typography.callout,
        color: colors.inkMuted,
        marginTop: -spacing.sm,
      },
      card: {
        overflow: "hidden",
      },
      setDetail: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.lg,
        gap: spacing.xs,
      },
      setLine: {
        ...typography.caption,
        color: colors.inkMuted,
        paddingLeft: spacing["3xl"] + spacing.md,
      },
      prescriptionNote: {
        ...typography.caption,
        color: colors.inkSecondary,
        paddingLeft: spacing["3xl"] + spacing.md,
        fontStyle: "italic",
      },
      progressionNote: {
        ...typography.caption,
        color: colors.pulse,
        paddingLeft: spacing["3xl"] + spacing.md,
        marginTop: spacing.xs,
      },
      dividerTrack: {
        paddingLeft: spacing["3xl"] + spacing.md + spacing.lg,
        paddingRight: spacing.lg,
      },
      divider: {
        height: 1,
        backgroundColor: colors.border,
        opacity: 0.9,
      },
    }),
  );

  const exerciseCountLabel =
    exercises.length === 1 ? "1 movement" : `${exercises.length} movements`;

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <SectionTitle title="Exercises" />
        <Text style={styles.countLabel}>{exerciseCountLabel}</Text>
      </View>

      <AppCard style={styles.card} variant="floating" padding="none">
        {exercises.map((exercise, index) => {
          const isLast = index === exercises.length - 1;

          return (
            <View key={exercise.id}>
              <WorkoutExercisePreviewRow
                orderNumber={index + 1}
                name={exercise.name}
                workingSetsSummary={formatSessionSetsSummary(exercise.sets)}
                intensity={formatSessionExerciseIntensity(exercise.sets)}
                isPrimary={index === 0}
                showDivider={false}
              />
              {exercise.sets.length > 0 ? (
                <View style={styles.setDetail}>
                  {exercise.sets.map((set) => (
                    <View key={set.id}>
                      <Text style={styles.setLine}>{formatSessionSetLine(set)}</Text>
                      {set.prescriptionNotes ? (
                        <Text style={styles.prescriptionNote}>{set.prescriptionNotes}</Text>
                      ) : null}
                    </View>
                  ))}
                  {exercise.progressionReference ? (
                    <Text style={styles.progressionNote} numberOfLines={2}>
                      {exercise.progressionReference}
                    </Text>
                  ) : null}
                </View>
              ) : null}
              {!isLast ? (
                <View style={styles.dividerTrack}>
                  <View style={styles.divider} />
                </View>
              ) : null}
            </View>
          );
        })}
      </AppCard>
    </View>
  );
}
