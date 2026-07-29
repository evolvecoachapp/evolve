import { Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { Reminder } from "../models";

export interface ReminderEditorProps {
  readonly reminder: Reminder | null;
  readonly onSave?: () => void;
  readonly onCancel?: () => void;
}

export function ReminderEditor({ reminder, onSave, onCancel }: ReminderEditorProps) {
  const styles = useThemedStyles(({ colors, typography }) => ({
    body: { gap: spacing.sm },
    title: { ...typography.title3 },
    label: { ...typography.callout, color: colors.inkMuted },
    row: { flexDirection: "row" as const, gap: spacing.md },
    action: { ...typography.callout, color: colors.pulse },
    cancel: { ...typography.callout, color: colors.inkMuted },
  }));

  return (
    <AppCard variant="glass">
      <View style={styles.body}>
        <Text style={styles.title}>{reminder ? "Edit Reminder" : "New Reminder"}</Text>
        {reminder ? (
          <>
            <Text style={styles.label}>Type: {reminder.type}</Text>
            <Text style={styles.label}>Time: {reminder.schedule.timeOfDay}</Text>
            <Text style={styles.label}>Policy: {reminder.deliveryPolicy}</Text>
          </>
        ) : (
          <Text style={styles.label}>Configure a new reminder to stay on track.</Text>
        )}
        <View style={styles.row}>
          {onSave ? <Text style={styles.action} onPress={onSave}>Save</Text> : null}
          {onCancel ? <Text style={styles.cancel} onPress={onCancel}>Cancel</Text> : null}
        </View>
      </View>
    </AppCard>
  );
}
