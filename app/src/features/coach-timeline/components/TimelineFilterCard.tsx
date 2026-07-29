import { Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { TimelineEventFilter } from "../models";

export interface TimelineFilterCardProps {
  readonly filter: TimelineEventFilter;
}

export function TimelineFilterCard({ filter }: TimelineFilterCardProps) {
  const styles = useThemedStyles(({ colors, typography }) => ({
    body: { gap: spacing.xs },
    title: { ...typography.callout },
    row: { ...typography.body, color: colors.inkMuted },
  }));

  return (
    <AppCard variant="glass">
      <View style={styles.body}>
        <Text style={styles.title}>Filters</Text>
        <Text style={styles.row}>Period: {filter.period.label}</Text>
        <Text style={styles.row}>Categories: {filter.categories.length}</Text>
        <Text style={styles.row}>Event types: {filter.eventTypes.length}</Text>
        <Text style={styles.row}>
          Search: {filter.searchQuery ?? "none"}
        </Text>
      </View>
    </AppCard>
  );
}
