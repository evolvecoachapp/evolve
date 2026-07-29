import { Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { WorkoutHistory } from "../models";

export interface WorkoutHistoryCardProps {
  readonly history: WorkoutHistory;
}

export function WorkoutHistoryCard({ history }: WorkoutHistoryCardProps) {
  const styles = useThemedStyles(({ colors, typography }) => ({
    body: { gap: spacing.sm },
    title: { ...typography.callout },
    entry: { gap: spacing.xs },
    entryTitle: { ...typography.body },
    meta: { ...typography.caption, color: colors.inkMuted },
  }));

  return (
    <AppCard variant="floating">
      <View style={styles.body}>
        <Text style={styles.title}>Workout History ({history.totalCount})</Text>
        {history.entries.map((entry) => (
          <View key={entry.id} style={styles.entry}>
            <Text style={styles.entryTitle}>{entry.title}</Text>
            <Text style={styles.meta}>
              {entry.durationMinutes} min · {entry.volumeKg} kg · {entry.exerciseCount} exercises
            </Text>
          </View>
        ))}
      </View>
    </AppCard>
  );
}
