import { View } from "react-native";
import { HeroSection } from "../../../components/HeroSection";
import { StatCard } from "../../../components/StatCard";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { ProgressSummary } from "../models";

export interface AnalyticsHeaderProps {
  readonly summary: ProgressSummary;
}

export function AnalyticsHeader({ summary }: AnalyticsHeaderProps) {
  const styles = useThemedStyles(() => ({
    row: { flexDirection: "row" as const, gap: spacing.md },
  }));

  return (
    <HeroSection
      overline="Progress Analytics"
      title={summary.headline}
      subtitle={summary.summary}
      variant="gradient"
    >
      <View style={styles.row}>
        <StatCard
          label="Workouts"
          value={summary.workoutsCompleted}
          unit="sessions"
          icon="barbell-outline"
          embedded
        />
        <StatCard
          label="Adherence"
          value={summary.adherencePercent}
          unit="%"
          icon="checkmark-circle-outline"
          embedded
        />
      </View>
    </HeroSection>
  );
}
