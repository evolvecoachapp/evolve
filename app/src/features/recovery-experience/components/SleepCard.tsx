import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { AppButton } from "../../../components/AppButton";
import { AppCard } from "../../../components/AppCard";
import { ProgressBar } from "../../../components/ProgressBar";
import { useTheme } from "../../../theme/ThemeContext";
import { radius, spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { SleepState } from "../models";

export interface SleepCardProps {
  readonly sleep: SleepState;
  readonly onLogSleep?: (hours: number) => void;
}

export function SleepCard({ sleep, onLogSleep }: SleepCardProps) {
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
    qualityLabel: { ...typography.caption, color: colors.inkMuted, marginTop: spacing.md },
    progress: { marginTop: spacing.xs },
    action: { marginTop: spacing.md, alignSelf: "flex-start" as const },
  }));

  return (
    <AppCard variant="elevated">
      <View style={styles.header}>
        <View style={styles.iconRing}>
          <Ionicons name="moon-outline" size={spacing.icon.sm} color={colors.pulse} />
        </View>
        <Text style={styles.label}>Sleep</Text>
      </View>
      <View style={styles.valueRow}>
        <Text style={styles.value}>{sleep.logged ? `${sleep.hours}h` : "—"}</Text>
        <Text style={styles.status}>{sleep.logged ? sleep.label : "Not logged"}</Text>
      </View>
      {sleep.logged ? (
        <>
          <Text style={styles.qualityLabel}>Sleep quality</Text>
          <ProgressBar progress={sleep.quality} style={styles.progress} />
        </>
      ) : null}
      {onLogSleep ? (
        <AppButton
          label="Log 7.5h sleep"
          onPress={() => onLogSleep(7.5)}
          variant="ghost"
          size="sm"
          style={styles.action}
        />
      ) : null}
    </AppCard>
  );
}
