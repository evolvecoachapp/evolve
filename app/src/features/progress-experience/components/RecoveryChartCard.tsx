import { Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { ChartPlaceholder } from "../../../components/ChartPlaceholder";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { RecoveryProgress } from "../models";

export interface RecoveryChartCardProps { readonly progress: RecoveryProgress; readonly onPress?: () => void; }

export function RecoveryChartCard({ progress, onPress }: RecoveryChartCardProps) {
  const styles = useThemedStyles(({ colors, typography }) => ({ body: { gap: spacing.md }, label: { ...typography.caption, color: colors.inkMuted }, value: { ...typography.metricCompact }, supporting: { ...typography.callout, color: colors.inkMuted } }));
  return (
    <AppCard variant="elevated" onPress={onPress}>
      <View style={styles.body}>
        <View>
          <Text style={styles.label}>Recovery Trend</Text>
          <Text style={styles.value}>{progress.averageScore}/100</Text>
          <Text style={styles.supporting}>{progress.readinessLabel} ? Sleep {progress.sleepAverageHours}h</Text>
        </View>
        <ChartPlaceholder icon="moon-outline" label="Reusable recovery visualization prepared" />
      </View>
    </AppCard>
  );
}
