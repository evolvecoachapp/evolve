import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
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
  const styles = useThemedStyles(({ colors, typography }) =>
    StyleSheet.create({
      title: { ...typography.title3, color: colors.text, marginBottom: spacing.sm },
      signal: { ...typography.body, color: colors.inkSecondary, marginBottom: spacing.xs },
      action: { ...typography.caption, color: colors.pulse, marginTop: spacing.sm },
    }),
  );

  return (
    <AppCard>
      <Text style={styles.title}>Recovery signals</Text>
      {signals.length === 0 ? (
        <Text style={styles.signal}>No recovery signals yet.</Text>
      ) : (
        signals.map((signal) => (
          <Text key={signal.id} style={styles.signal}>
            {signal.summary}
          </Text>
        ))
      )}
      {assessmentAvailable && onAssess ? (
        <Pressable onPress={onAssess}>
          <Text style={styles.action}>Run recovery assessment</Text>
        </Pressable>
      ) : null}
    </AppCard>
  );
}
