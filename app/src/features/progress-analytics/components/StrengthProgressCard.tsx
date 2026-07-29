import { Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { StrengthProgress } from "../models";

export interface StrengthProgressCardProps {
  readonly progress: StrengthProgress;
}

export function StrengthProgressCard({ progress }: StrengthProgressCardProps) {
  const styles = useThemedStyles(({ colors, typography }) => ({
    body: { gap: spacing.xs },
    title: { ...typography.callout },
    row: { ...typography.body, color: colors.inkMuted },
  }));

  return (
    <AppCard variant="floating">
      <View style={styles.body}>
        <Text style={styles.title}>Strength Progress</Text>
        <Text style={styles.row}>Est. 1RM: {progress.estimatedOneRepMaxKg} kg</Text>
        <Text style={styles.row}>Change: {progress.changePercent}%</Text>
        <Text style={styles.row}>Strongest: {progress.strongestLift}</Text>
        <Text style={styles.row}>PRs: {progress.personalRecordsCount}</Text>
      </View>
    </AppCard>
  );
}
