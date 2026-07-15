import { StyleSheet, Text, View } from "react-native";
import { AppInput } from "../../../components/AppInput";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";

interface WorkoutFinishNotesProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

/** Optional notes field shown when the athlete is ready to finish. */
export function WorkoutFinishNotes({ value, onChange, disabled = false }: WorkoutFinishNotesProps) {
  const styles = useThemedStyles(({ colors, typography }) =>
    StyleSheet.create({
      container: {
        gap: spacing.xs,
      },
      hint: {
        ...typography.caption,
        color: colors.inkMuted,
      },
      input: {
        marginBottom: 0,
        minHeight: 96,
        textAlignVertical: "top",
      },
    }),
  );

  return (
    <View style={styles.container}>
      <Text style={styles.hint}>Optional — how did today feel?</Text>
      <AppInput
        label="Workout notes"
        value={value}
        onChangeText={onChange}
        editable={!disabled}
        multiline
        numberOfLines={4}
        placeholder="Energy, form cues, anything to remember…"
        style={styles.input}
      />
    </View>
  );
}
