import { AppCard } from "../../../components/AppCard";
import { AppInput } from "../../../components/AppInput";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { WorkoutNotes } from "../models/experience/WorkoutNotes";

interface NotesCardProps {
  readonly notes: WorkoutNotes;
  readonly onChange: (value: string) => void;
}

/** Session notes card — presentation only. */
export function NotesCard({ notes, onChange }: NotesCardProps) {
  const styles = useThemedStyles(() => ({
    card: {
      marginBottom: spacing.sm,
    },
  }));

  return (
    <AppCard variant="elevated" style={styles.card}>
      <AppInput
        label="Session notes"
        multiline
        numberOfLines={3}
        value={notes.sessionNotes}
        onChangeText={onChange}
        placeholder="How did the session feel?"
        accessibilityLabel="Session notes"
        style={{ minHeight: 88, textAlignVertical: "top" }}
      />
    </AppCard>
  );
}
