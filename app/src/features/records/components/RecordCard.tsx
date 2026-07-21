import { StyleSheet, Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { SectionTitle } from "../../../components/SectionTitle";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { WorkoutRecord } from "../models/WorkoutRecord";
import {
  formatRecordCount,
  formatRecordDate,
  formatRecordVolumeKg,
  formatRecordWeightKg,
} from "./formatRecordDisplay";

export interface RecordCardProps {
  workoutRecord: WorkoutRecord;
}

interface RecordMetric {
  label: string;
  value: string;
}

/** Personal record highlights card — best weight, 1RM, volume, reps. */
export function RecordCard({ workoutRecord }: RecordCardProps) {
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
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: spacing.md,
      },
      label: {
        ...typography.callout,
        color: colors.inkSecondary,
        flex: 1,
        minWidth: 0,
      },
      value: {
        ...typography.title3,
        color: colors.ink,
      },
      footer: {
        ...typography.caption,
        color: colors.inkMuted,
        marginTop: spacing.xs,
      },
    }),
  );

  const metrics: readonly RecordMetric[] = [
    {
      label: "Best Weight",
      value: formatRecordWeightKg(workoutRecord.bestWeightKg),
    },
    {
      label: "Best Estimated 1RM",
      value: formatRecordWeightKg(workoutRecord.bestEstimatedOneRMKg),
    },
    {
      label: "Best Session Volume",
      value: formatRecordVolumeKg(workoutRecord.bestSessionVolumeKg),
    },
    {
      label: "Best Single-Set Volume",
      value: formatRecordVolumeKg(workoutRecord.bestSingleSetVolumeKg),
    },
    {
      label: "Best Reps",
      value: formatRecordCount(workoutRecord.bestReps),
    },
  ];

  return (
    <View style={styles.section} testID="record-card">
      <SectionTitle title="Personal Records" />
      <AppCard variant="elevated">
        <View style={styles.list}>
          {metrics.map((metric) => (
            <View key={metric.label} style={styles.row}>
              <Text style={styles.label}>{metric.label}</Text>
              <Text style={styles.value}>{metric.value}</Text>
            </View>
          ))}
          <Text style={styles.footer}>
            Last record {formatRecordDate(workoutRecord.lastRecordAt)}
          </Text>
        </View>
      </AppCard>
    </View>
  );
}
