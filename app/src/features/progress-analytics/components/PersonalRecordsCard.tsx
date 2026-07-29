import { Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { PersonalRecord } from "../models";

export interface PersonalRecordsCardProps {
  readonly records: readonly PersonalRecord[];
}

export function PersonalRecordsCard({ records }: PersonalRecordsCardProps) {
  const styles = useThemedStyles(({ colors, typography }) => ({
    body: { gap: spacing.sm },
    title: { ...typography.callout },
    recordTitle: { ...typography.body },
    meta: { ...typography.caption, color: colors.inkMuted },
  }));

  return (
    <AppCard variant="floating">
      <View style={styles.body}>
        <Text style={styles.title}>Personal Records</Text>
        {records.map((record) => (
          <View key={record.id}>
            <Text style={styles.recordTitle}>{record.exerciseName}</Text>
            <Text style={styles.meta}>
              {record.weightKg} kg × {record.reps} · e1RM {record.estimatedOneRepMaxKg} kg
            </Text>
          </View>
        ))}
      </View>
    </AppCard>
  );
}
