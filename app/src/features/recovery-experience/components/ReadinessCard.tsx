import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { AppButton } from "../../../components/AppButton";
import { AppCard } from "../../../components/AppCard";
import { ProgressBar } from "../../../components/ProgressBar";
import { useTheme } from "../../../theme/ThemeContext";
import { radius, spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { ReadinessProgress } from "../models";

export interface ReadinessCardProps {
  readonly readiness: ReadinessProgress;
  readonly onUpdateReadiness?: (score: number) => void;
}

export function ReadinessCard({ readiness, onUpdateReadiness }: ReadinessCardProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(({ colors, typography }) => ({
    header: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      gap: spacing.sm,
    },
    iconRing: {
      width: spacing.avatar.sm,
      height: spacing.avatar.sm,
      borderRadius: radius.full,
      backgroundColor: colors.pulseMuted,
      alignItems: "center" as const,
      justifyContent: "center" as const,
    },
    label: { ...typography.caption, color: colors.inkMuted, flex: 1 },
    valueRow: {
      flexDirection: "row" as const,
      alignItems: "baseline" as const,
      gap: spacing.sm,
      marginTop: spacing.sm,
    },
    value: { ...typography.metricCompact },
    status: { ...typography.callout, color: colors.inkSecondary },
    progress: { marginTop: spacing.md },
    action: { marginTop: spacing.md, alignSelf: "flex-start" as const },
  }));

  const hasScore = readiness.score > 0;

  return (
    <AppCard variant="elevated">
      <View style={styles.header}>
        <View style={styles.iconRing}>
          <Ionicons name="pulse-outline" size={spacing.icon.sm} color={colors.pulse} />
        </View>
        <Text style={styles.label}>Readiness</Text>
      </View>
      <View style={styles.valueRow}>
        <Text style={styles.value}>{hasScore ? `${readiness.score}%` : "—"}</Text>
        <Text style={styles.status}>{hasScore ? readiness.label : "Not updated"}</Text>
      </View>
      <ProgressBar progress={hasScore ? readiness.score : 0} style={styles.progress} />
      {onUpdateReadiness ? (
        <AppButton
          label="Update readiness"
          onPress={() => onUpdateReadiness(78)}
          variant="ghost"
          size="sm"
          style={styles.action}
        />
      ) : null}
    </AppCard>
  );
}
