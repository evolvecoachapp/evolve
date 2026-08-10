import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { SleepState } from "../models";

export interface SleepCardProps {
  readonly sleep: SleepState;
  readonly onLogSleep?: (hours: number) => void;
}

export function SleepCard({ sleep, onLogSleep }: SleepCardProps) {
  const styles = useThemedStyles(({ colors, typography }) =>
    StyleSheet.create({
      row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: spacing.sm,
      },
      label: { ...typography.caption, color: colors.inkMuted },
      value: { ...typography.title3, color: colors.text },
      action: { ...typography.caption, color: colors.pulse, marginTop: spacing.sm },
    }),
  );

  return (
    <AppCard>
      <View style={styles.row}>
        <Text style={styles.label}>Sleep</Text>
        <Text style={styles.value}>
          {sleep.hours > 0 ? `${sleep.hours}h · ${sleep.label}` : "Not logged"}
        </Text>
      </View>
      {onLogSleep ? (
        <Pressable onPress={() => onLogSleep(7.5)}>
          <Text style={styles.action}>Log 7.5h sleep</Text>
        </Pressable>
      ) : null}
    </AppCard>
  );
}
