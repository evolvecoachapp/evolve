import { View } from "react-native";
import { HeroSection } from "../../../components/HeroSection";
import { StatCard } from "../../../components/StatCard";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { RecoveryDashboard } from "../models";

export interface RecoveryHeaderProps {
  readonly dashboard: RecoveryDashboard;
}

export function RecoveryHeader({ dashboard }: RecoveryHeaderProps) {
  const styles = useThemedStyles(() => ({
    row: { flexDirection: "row" as const, gap: spacing.md },
  }));

  return (
    <HeroSection
      overline="Recovery Command Center"
      title={dashboard.headline}
      subtitle={dashboard.summary}
      variant="gradient"
    >
      <View style={styles.row}>
        <StatCard
          label="Recovery Score"
          value={dashboard.recoveryScore}
          unit="%"
          progress={dashboard.recoveryScore}
          icon="heart-outline"
          embedded
        />
        <StatCard
          label="Readiness"
          value={dashboard.readiness.score}
          unit="%"
          trend={dashboard.status || dashboard.readiness.label}
          progress={dashboard.readiness.score}
          icon="pulse-outline"
          embedded
        />
      </View>
    </HeroSection>
  );
}
