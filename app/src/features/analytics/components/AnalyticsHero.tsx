import { StyleSheet, Text, View } from "react-native";
import { HeroEntrance } from "../../../animation/HeroEntrance";
import { Chip } from "../../../components/Chip";
import { FloatingStatChip } from "../../../components/FloatingStatChip";
import { HeroAmbientLayer } from "../../../components/HeroAmbientLayer";
import { heroLayout, spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { WorkoutAnalytics } from "../models/WorkoutAnalytics";
import {
  formatAnalyticsCount,
  formatAnalyticsDuration,
  formatAnalyticsVolumeKg,
} from "./formatAnalyticsDisplay";

export interface AnalyticsHeroProps {
  workout: WorkoutAnalytics;
}

/** Premium analytics hero — totals and average duration. */
export function AnalyticsHero({ workout }: AnalyticsHeroProps) {
  const styles = useThemedStyles(({ colors, typography }) =>
    StyleSheet.create({
      hero: {
        marginHorizontal: -spacing.screenPadding,
        marginBottom: spacing.md,
        borderBottomLeftRadius: heroLayout.heroRadius,
        borderBottomRightRadius: heroLayout.heroRadius,
      },
      content: {
        paddingHorizontal: spacing.screenPadding,
        gap: heroLayout.contentGap,
      },
      chipRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: heroLayout.chipRowGap,
      },
      headlineBlock: {
        gap: heroLayout.headlineGap,
        paddingTop: spacing.sm,
      },
      eyebrow: {
        ...typography.eyebrow,
        color: colors.pulse,
      },
      title: {
        ...typography.metric,
      },
      subtitle: {
        ...typography.callout,
        color: colors.inkSecondary,
        marginTop: spacing.xs,
      },
      statGrid: {
        gap: spacing.md,
        marginTop: spacing.sm,
      },
      statRow: {
        flexDirection: "row",
        gap: spacing.md,
      },
      statChip: {
        flex: 1,
        minWidth: 0,
      },
    }),
  );

  return (
    <View testID="analytics-hero">
      <HeroAmbientLayer style={styles.hero}>
        <View style={styles.content}>
          <HeroEntrance delay={0}>
            <View style={styles.chipRow}>
              <Chip
                label="Workout Analytics"
                variant="accent"
                size="lg"
                icon="analytics-outline"
              />
            </View>

            <View style={styles.headlineBlock}>
              <Text style={styles.eyebrow}>Your training</Text>
              <Text style={styles.title} numberOfLines={2}>
                Performance overview
              </Text>
              <Text style={styles.subtitle} numberOfLines={2}>
                Totals from completed workout history
              </Text>
            </View>
          </HeroEntrance>

          <View style={styles.statGrid}>
            <View style={styles.statRow}>
              <FloatingStatChip
                label="Total Workouts"
                value={formatAnalyticsCount(workout.totalWorkouts)}
                icon="barbell-outline"
                tone="accent"
                style={styles.statChip}
                enterIndex={0}
              />
              <FloatingStatChip
                label="Total Volume"
                value={formatAnalyticsVolumeKg(workout.totalVolumeKg)}
                icon="fitness-outline"
                tone="warm"
                style={styles.statChip}
                enterIndex={1}
              />
            </View>
            <View style={styles.statRow}>
              <FloatingStatChip
                label="Avg Duration"
                value={formatAnalyticsDuration(workout.averageDurationSeconds)}
                icon="time-outline"
                tone="neutral"
                style={styles.statChip}
                enterIndex={2}
              />
            </View>
          </View>
        </View>
      </HeroAmbientLayer>
    </View>
  );
}
