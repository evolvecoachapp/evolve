import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { AppButton } from "../../../components/AppButton";
import { AppCard } from "../../../components/AppCard";
import { useTheme } from "../../../theme/ThemeContext";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { RecoverySignal } from "../models";

export interface RecoverySignalsCardProps {
  readonly signals: readonly RecoverySignal[];
  readonly assessmentAvailable: boolean;
  readonly onAssess?: () => void;
}

export function RecoverySignalsCard({
  signals,
  assessmentAvailable,
  onAssess,
}: RecoverySignalsCardProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(({ colors, typography }) => ({
    title: { ...typography.title3, marginBottom: spacing.md },
    signalRow: {
      flexDirection: "row" as const,
      alignItems: "flex-start" as const,
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    signal: { ...typography.bodyRelaxed, color: colors.inkSecondary, flex: 1 },
    empty: { ...typography.callout, color: colors.inkMuted },
    action: { marginTop: spacing.sm, alignSelf: "flex-start" as const },
  }));

  return (
    <AppCard variant="elevated">
      <Text style={styles.title}>Recovery signals</Text>
      {signals.length === 0 ? (
        <Text style={styles.empty}>No recovery signals yet.</Text>
      ) : (
        signals.map((signal) => (
          <View key={signal.id} style={styles.signalRow}>
            <Ionicons name="ellipse" size={6} color={colors.pulse} style={{ marginTop: 8 }} />
            <Text style={styles.signal}>{signal.summary}</Text>
          </View>
        ))
      )}
      {assessmentAvailable && onAssess ? (
        <AppButton
          label="Run recovery assessment"
          onPress={onAssess}
          variant="ghost"
          size="sm"
          style={styles.action}
        />
      ) : null}
    </AppCard>
  );
}
