import { Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { PersonalRecord } from "../models";

export interface PersonalRecordsCardProps { readonly records: readonly PersonalRecord[]; }

export function PersonalRecordsCard({ records }: PersonalRecordsCardProps) {
  const styles = useThemedStyles(({ colors, typography }) => ({ body: { gap: spacing.md }, title: { ...typography.title3 }, row: { flexDirection: "row" as const, justifyContent: "space-between" as const, gap: spacing.md }, exercise: { ...typography.bodyMedium }, meta: { ...typography.callout, color: colors.inkMuted } }));
  return (
    <AppCard variant="elevated">
      <View style={styles.body}>
        <Text style={styles.title}>Personal Records</Text>
        {records.slice(0, 3).map((record) => (
          <View key={record.id} style={styles.row}>
            <View>
              <Text style={styles.exercise}>{record.exerciseName}</Text>
              <Text style={styles.meta}>{record.weightKg} kg x {record.reps}</Text>
            </View>
            <Text style={styles.meta}>{record.estimatedOneRepMaxKg} kg est.</Text>
          </View>
        ))}
      </View>
    </AppCard>
  );
}
