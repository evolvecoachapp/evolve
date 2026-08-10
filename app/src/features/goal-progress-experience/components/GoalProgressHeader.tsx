import { Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { GoalProgressDashboard } from "../models";

export interface GoalProgressHeaderProps {
  readonly dashboard: GoalProgressDashboard;
}

export function GoalProgressHeader({ dashboard }: GoalProgressHeaderProps) {
  const styles = useThemedStyles(({ colors, typography }) => ({
    body: { gap: spacing.xs },
    headline: { ...typography.title2 },
    summary: { ...typography.bodyRelaxed, color: colors.inkSecondary },
    meta: { ...typography.caption, color: colors.inkMuted },
  }));

  return (
    <AppCard variant="accent" glow>
      <View style={styles.body}>
        <Text style={styles.headline}>{dashboard.headline}</Text>
        <Text style={styles.summary}>{dashboard.summary}</Text>
        <Text style={styles.meta}>
          {dashboard.completionPercent}% · {dashboard.status || "pending"}
        </Text>
      </View>
    </AppCard>
  );
}
