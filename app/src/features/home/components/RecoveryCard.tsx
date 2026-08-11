import { StyleSheet, Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { Chip } from "../../../components/Chip";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { RecoverySummaryCard } from "../models/RecoverySummaryCard";
import { DashboardSection } from "./DashboardSection";

interface RecoveryCardProps {
  readonly recovery: RecoverySummaryCard;
  readonly index?: number;
}

/** Recovery score card — presentation only. */
export function RecoveryCard({ recovery, index }: RecoveryCardProps) {
  const styles = useThemedStyles(({ colors, typography }) =>
    StyleSheet.create({
      recoveryHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: spacing.md,
      },
      recoveryLabel: {
        ...typography.caption,
        color: colors.inkMuted,
        marginBottom: spacing.xs,
      },
      recoveryScore: {
        ...typography.display,
        color: colors.pulse,
      },
      recoveryTip: {
        ...typography.bodyRelaxed,
        color: colors.inkSecondary,
      },
    }),
  );

  if (!recovery.present) {
    return null;
  }

  return (
    <DashboardSection title="Recovery" index={index}>
      <AppCard variant="accent" glow>
        <View
          accessible
          accessibilityRole="summary"
          accessibilityLabel={`Recovery score ${recovery.score}%, ${recovery.status}. ${recovery.tip}`}
        >
          <View style={styles.recoveryHeader}>
            <View>
              <Text style={styles.recoveryLabel}>Recovery score</Text>
              <Text style={styles.recoveryScore}>{recovery.score}%</Text>
            </View>
            <Chip label={recovery.status} variant="accent" size="md" />
          </View>
          <Text style={styles.recoveryTip}>{recovery.tip}</Text>
        </View>
      </AppCard>
    </DashboardSection>
  );
}
