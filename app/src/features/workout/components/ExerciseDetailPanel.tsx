import { StyleSheet, Text, View } from "react-native";
import { Chip } from "../../../components/Chip";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { Exercise } from "../models/Exercise";
import type { ExerciseMuscleGroup } from "../models/ExerciseMuscleGroup";
import { formatMuscleGroupLabel } from "../utils/presentationFormatters";

interface ExerciseDetailPanelProps {
  exercise: Exercise;
}

function formatMuscleList(groups: ExerciseMuscleGroup[]): string {
  return groups.map((group) => formatMuscleGroupLabel(group)).join(", ");
}

/** Instructions, muscle targets, and common mistakes for the current exercise. */
export function ExerciseDetailPanel({ exercise }: ExerciseDetailPanelProps) {
  const primaryMuscles = exercise.primaryMuscles ?? [exercise.muscleGroup];
  const secondaryMuscles = exercise.secondaryMuscles ?? [];
  const commonMistakes = exercise.commonMistakes ?? [];
  const hasContent =
    Boolean(exercise.instructions) || secondaryMuscles.length > 0 || commonMistakes.length > 0;

  const styles = useThemedStyles(({ colors, typography }) =>
    StyleSheet.create({
      container: {
        gap: spacing.md,
      },
      section: {
        gap: spacing.xs,
      },
      label: {
        ...typography.caption,
        color: colors.inkMuted,
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 0.6,
      },
      body: {
        ...typography.callout,
        color: colors.inkSecondary,
        lineHeight: 22,
      },
      chipRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.sm,
      },
      mistake: {
        ...typography.callout,
        color: colors.inkSecondary,
        lineHeight: 22,
      },
    }),
  );

  if (!hasContent) {
    return (
      <View style={styles.container}>
        <View style={styles.section}>
          <Text style={styles.label}>Primary muscles</Text>
          <View style={styles.chipRow}>
            {primaryMuscles.map((group) => (
              <Chip key={group} label={formatMuscleGroupLabel(group)} />
            ))}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.label}>Primary muscles</Text>
        <View style={styles.chipRow}>
          {primaryMuscles.map((group) => (
            <Chip key={group} label={formatMuscleGroupLabel(group)} />
          ))}
        </View>
      </View>

      {secondaryMuscles.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.label}>Secondary muscles</Text>
          <Text style={styles.body}>{formatMuscleList(secondaryMuscles)}</Text>
        </View>
      ) : null}

      {exercise.instructions ? (
        <View style={styles.section}>
          <Text style={styles.label}>Instructions</Text>
          <Text style={styles.body}>{exercise.instructions}</Text>
        </View>
      ) : null}

      {commonMistakes.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.label}>Common mistakes</Text>
          {commonMistakes.map((mistake) => (
            <Text key={mistake} style={styles.mistake}>
              · {mistake}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}
