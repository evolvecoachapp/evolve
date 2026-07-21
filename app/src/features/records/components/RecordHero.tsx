import { StyleSheet, Text, View } from "react-native";
import { HeroEntrance } from "../../../animation/HeroEntrance";
import { Chip } from "../../../components/Chip";
import { FloatingStatChip } from "../../../components/FloatingStatChip";
import { HeroAmbientLayer } from "../../../components/HeroAmbientLayer";
import { heroLayout, spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { RecordSummary } from "../models/RecordSummary";
import type { WorkoutRecord } from "../models/WorkoutRecord";
import {
  formatRecordCount,
  formatRecordVolumeKg,
  formatRecordWeightKg,
} from "./formatRecordDisplay";

export interface RecordHeroProps {
  summary: RecordSummary;
  workoutRecord: WorkoutRecord;
}

/** Premium records hero — lifetime sessions and top lift highlights. */
export function RecordHero({ summary, workoutRecord }: RecordHeroProps) {
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
    <View testID="record-hero">
      <HeroAmbientLayer style={styles.hero}>
        <View style={styles.content}>
          <HeroEntrance delay={0}>
            <View style={styles.chipRow}>
              <Chip
                label="Personal Records"
                variant="accent"
                size="lg"
                icon="trophy-outline"
              />
            </View>

            <View style={styles.headlineBlock}>
              <Text style={styles.eyebrow}>Lifetime lifts</Text>
              <Text style={styles.title} numberOfLines={2}>
                Your strongest marks
              </Text>
              <Text style={styles.subtitle} numberOfLines={2}>
                Best performances from completed workout history
              </Text>
            </View>
          </HeroEntrance>

          <View style={styles.statGrid}>
            <View style={styles.statRow}>
              <FloatingStatChip
                label="Sessions"
                value={formatRecordCount(summary.totalLifetimeSessions)}
                icon="barbell-outline"
                tone="accent"
                style={styles.statChip}
                enterIndex={0}
              />
              <FloatingStatChip
                label="Best Weight"
                value={formatRecordWeightKg(workoutRecord.bestWeightKg)}
                icon="fitness-outline"
                tone="warm"
                style={styles.statChip}
                enterIndex={1}
              />
            </View>
            <View style={styles.statRow}>
              <FloatingStatChip
                label="Best Est. 1RM"
                value={formatRecordWeightKg(workoutRecord.bestEstimatedOneRMKg)}
                icon="flash-outline"
                tone="neutral"
                style={styles.statChip}
                enterIndex={2}
              />
              <FloatingStatChip
                label="Lifetime Volume"
                value={formatRecordVolumeKg(summary.totalLifetimeVolumeKg)}
                icon="layers-outline"
                tone="accent"
                style={styles.statChip}
                enterIndex={3}
              />
            </View>
          </View>
        </View>
      </HeroAmbientLayer>
    </View>
  );
}
