import { Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { CoachInsightSummary } from "../models";

export interface CoachInsightsCardProps { readonly insights: readonly CoachInsightSummary[]; readonly onPress?: (destination: string | null) => void; }

export function CoachInsightsCard({ insights, onPress }: CoachInsightsCardProps) {
  const styles = useThemedStyles(({ colors, typography }) => ({ body: { gap: spacing.md }, title: { ...typography.title3 }, item: { gap: spacing.xs }, itemTitle: { ...typography.bodyMedium }, metric: { ...typography.caption, color: colors.pulse }, summary: { ...typography.callout, color: colors.inkMuted } }));
  return (
    <AppCard variant="elevated">
      <View style={styles.body}>
        <Text style={styles.title}>Coach Insights</Text>
        {insights.map((insight) => (
          <AppCard key={insight.id} variant="inset" padding="compact" onPress={onPress ? () => onPress(insight.destination) : undefined}>
            <View style={styles.item}>
              <Text style={styles.itemTitle}>{insight.title}</Text>
              <Text style={styles.metric}>{insight.metric}</Text>
              <Text style={styles.summary}>{insight.summary}</Text>
            </View>
          </AppCard>
        ))}
      </View>
    </AppCard>
  );
}
