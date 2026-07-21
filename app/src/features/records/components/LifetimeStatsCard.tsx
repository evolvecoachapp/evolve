import { StyleSheet, Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { SectionTitle } from "../../../components/SectionTitle";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { RecordSummary } from "../models/RecordSummary";
import {
  formatRecordCount,
  formatRecordDate,
  formatRecordVolumeKg,
} from "./formatRecordDisplay";

export interface LifetimeStatsCardProps {
  summary: RecordSummary;
}

/** Lifetime training statistics — volume, sessions, last record. */
export function LifetimeStatsCard({ summary }: LifetimeStatsCardProps) {
  const styles = useThemedStyles(({ colors, typography }) =>
    StyleSheet.create({
      section: {
        gap: spacing.sm,
      },
      grid: {
        gap: spacing.md,
      },
      row: {
        flexDirection: "row",
        gap: spacing.md,
      },
      cell: {
        flex: 1,
        minWidth: 0,
        gap: spacing.xs,
      },
      label: {
        ...typography.caption,
        color: colors.inkMuted,
      },
      value: {
        ...typography.title3,
        color: colors.ink,
      },
    }),
  );

  return (
    <View style={styles.section} testID="lifetime-stats-card">
      <SectionTitle title="Lifetime Stats" />
      <AppCard variant="elevated">
        <View style={styles.grid}>
          <View style={styles.row}>
            <View style={styles.cell}>
              <Text style={styles.label}>Total Volume</Text>
              <Text style={styles.value}>
                {formatRecordVolumeKg(summary.totalLifetimeVolumeKg)}
              </Text>
            </View>
            <View style={styles.cell}>
              <Text style={styles.label}>Sessions</Text>
              <Text style={styles.value}>
                {formatRecordCount(summary.totalLifetimeSessions)}
              </Text>
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.cell}>
              <Text style={styles.label}>Exercises</Text>
              <Text style={styles.value}>
                {formatRecordCount(summary.exerciseCount)}
              </Text>
            </View>
            <View style={styles.cell}>
              <Text style={styles.label}>Last Record</Text>
              <Text style={styles.value}>
                {formatRecordDate(summary.lastRecordAt)}
              </Text>
            </View>
          </View>
        </View>
      </AppCard>
    </View>
  );
}
