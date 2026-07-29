import { View } from "react-native";
import { HeroSection } from "../../../components/HeroSection";
import { StatCard } from "../../../components/StatCard";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { TimelineStatistics } from "../models";

export interface TimelineHeaderProps {
  readonly statistics: TimelineStatistics;
}

export function TimelineHeader({ statistics }: TimelineHeaderProps) {
  const styles = useThemedStyles(() => ({
    row: { flexDirection: "row" as const, gap: spacing.md },
  }));

  return (
    <HeroSection
      overline="Coach Timeline"
      title="Athlete timeline"
      subtitle={`${statistics.totalEvents} events · ${statistics.eventsThisWeek} this week`}
      variant="gradient"
    >
      <View style={styles.row}>
        <StatCard
          label="Today"
          value={statistics.eventsToday}
          unit="events"
          icon="today-outline"
          embedded
        />
        <StatCard
          label="Workouts"
          value={statistics.workoutEvents}
          unit="events"
          icon="barbell-outline"
          embedded
        />
      </View>
    </HeroSection>
  );
}
