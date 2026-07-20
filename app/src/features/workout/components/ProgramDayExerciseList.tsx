import { StyleSheet, Text, View } from "react-native";
import type { WorkoutPreviewDay } from "../../training/application";
import { AppCard } from "../../../components/AppCard";
import { SectionTitle } from "../../../components/SectionTitle";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import {
  formatPreviewIntensity,
  formatPreviewSetLine,
  formatPreviewSetsSummary,
} from "../utils/previewPresentationFormatters";
import { WorkoutExercisePreviewRow } from "./WorkoutExercisePreviewRow";

interface ProgramDayExerciseListProps {
  day: WorkoutPreviewDay;
}

export function ProgramDayExerciseList({ day }: ProgramDayExerciseListProps) {
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
      restCard: {
        gap: spacing.sm,
      },
      restTitle: {
        ...typography.title2,
      },
      restBody: {
        ...typography.body,
        color: colors.inkSecondary,
        lineHeight: 22,
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

  if (day.isRestDay) {
    return (
      <View style={styles.section}>
        <SectionTitle title={day.name} />
        <AppCard variant="elevated" style={styles.restCard}>
          <Text style={styles.restTitle}>Rest day</Text>
          <Text style={styles.restBody}>
            No prescribed training. Use this day for recovery, mobility, or light activity.
          </Text>
        </AppCard>
      </View>
    );
  }

  const exerciseCountLabel =
    day.exercises.length === 1 ? "1 movement" : `${day.exercises.length} movements`;

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <SectionTitle title={day.name} />
        <Text style={styles.countLabel}>{exerciseCountLabel}</Text>
      </View>

      <AppCard style={styles.card} variant="floating" padding="none">
        {day.exercises.map((exercise, index) => {
          const isLast = index === day.exercises.length - 1;

          return (
            <View key={exercise.id}>
              <WorkoutExercisePreviewRow
                orderNumber={index + 1}
                name={exercise.name}
                workingSetsSummary={formatPreviewSetsSummary(exercise.sets)}
                intensity={formatPreviewIntensity(exercise.sets)}
                isPrimary={index === 0}
                showDivider={false}
              />
              {exercise.sets.length > 0 ? (
                <View style={styles.setDetail}>
                  {exercise.sets.map((set) => (
                    <Text key={set.id} style={styles.setLine}>
                      {formatPreviewSetLine(set)}
                    </Text>
                  ))}
                  {exercise.progressionSummary ? (
                    <Text style={styles.progressionNote} numberOfLines={2}>
                      {exercise.progressionSummary}
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
