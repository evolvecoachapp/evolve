import { StyleSheet, Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { SectionTitle } from "../../../components/SectionTitle";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { ExerciseAnalytics } from "../models/ExerciseAnalytics";
import { formatAnalyticsVolumeKg } from "./formatAnalyticsDisplay";

/** Max highlights shown — list must already be ordered by the domain layer. */
const HIGHLIGHT_LIMIT = 5;

export interface ExerciseHighlightsCardProps {
  /**
   * Ordered exercise analytics from the domain (sessionsPerformed desc).
   * This component does not sort — it only renders the first highlights.
   */
  exercises: readonly ExerciseAnalytics[];
}

/** Top exercise highlights — name, sessions, volume. */
export function ExerciseHighlightsCard({
  exercises,
}: ExerciseHighlightsCardProps) {
  const styles = useThemedStyles(({ colors, typography }) =>
    StyleSheet.create({
      section: {
        gap: spacing.sm,
      },
      list: {
        gap: spacing.md,
      },
      row: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
      },
      rank: {
        ...typography.caption,
        color: colors.pulse,
        fontWeight: "700",
        width: spacing.lg,
      },
      body: {
        flex: 1,
        minWidth: 0,
        gap: spacing.xs,
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

  const highlights = exercises.slice(0, HIGHLIGHT_LIMIT);

  return (
    <View style={styles.section} testID="exercise-highlights-card">
      <SectionTitle title="Exercise Highlights" />
      <AppCard variant="elevated">
        {highlights.length === 0 ? (
          <Text style={styles.empty}>No exercise data yet.</Text>
        ) : (
          <View style={styles.list}>
            {highlights.map((exercise, index) => (
              <View key={exercise.exerciseId} style={styles.row}>
                <Text style={styles.rank}>{index + 1}</Text>
                <View style={styles.body}>
                  <Text style={styles.name} numberOfLines={1}>
                    {exercise.exerciseName}
                  </Text>
                  <Text style={styles.meta}>
                    {exercise.sessionsPerformed}{" "}
                    {exercise.sessionsPerformed === 1 ? "session" : "sessions"}
                    {" · "}
                    {exercise.bestVolumeKg != null
                      ? formatAnalyticsVolumeKg(exercise.bestVolumeKg)
                      : "—"}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </AppCard>
    </View>
  );
}
