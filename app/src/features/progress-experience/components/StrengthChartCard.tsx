import { Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { ChartPlaceholder } from "../../../components/ChartPlaceholder";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { StrengthProgress } from "../models";

export interface StrengthChartCardProps { readonly progress: StrengthProgress; readonly onPress?: () => void; }

export function StrengthChartCard({ progress, onPress }: StrengthChartCardProps) {
  const styles = useThemedStyles(({ colors, typography }) => ({ body: { gap: spacing.md }, label: { ...typography.caption, color: colors.inkMuted }, value: { ...typography.metricCompact }, supporting: { ...typography.callout, color: colors.inkMuted } }));
  return (
    <AppCard variant="elevated" onPress={onPress}>
      <View style={styles.body}>
        <View>
          <Text style={styles.label}>Estimated 1RM</Text>
          <Text style={styles.value}>{progress.estimatedOneRepMaxKg} kg</Text>
          <Text style={styles.supporting}>{progress.strongestLift} · {progress.changePercent}% change</Text>
        </View>
        <ChartPlaceholder icon="trending-up-outline" label="Reusable strength visualization prepared" />
      </View>
    </AppCard>
  );
}
