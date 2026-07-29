import { View } from "react-native";
import { HeroSection } from "../../../components/HeroSection";
import { StatCard } from "../../../components/StatCard";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { ProgressDashboard } from "../models";

export interface ProgressHeaderProps { readonly dashboard: ProgressDashboard; }

export function ProgressHeader({ dashboard }: ProgressHeaderProps) {
  const styles = useThemedStyles(() => ({ row: { flexDirection: "row" as const, gap: spacing.md } }));
  return (
    <HeroSection overline="Athlete Analytics" title={dashboard.headline} subtitle={dashboard.summary} variant="gradient">
      <View style={styles.row}>
        <StatCard label="Workout Streak" value={dashboard.trainingStreak.currentDays} unit="days" trend={`Best ${dashboard.trainingStreak.bestDays} days`} icon="flame-outline" embedded />
        <StatCard label="Goal Completion" value={dashboard.goalProgress.completionPercent} unit="%" trend={dashboard.goalProgress.status} icon="flag-outline" progress={dashboard.goalProgress.completionPercent} embedded />
      </View>
    </HeroSection>
  );
}
