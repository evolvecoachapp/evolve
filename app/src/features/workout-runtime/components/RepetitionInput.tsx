import { View } from "react-native";
import { AppInput } from "../../../components/AppInput";
import { useThemedStyles } from "../../../theme/useThemedStyles";

interface RepetitionInputProps {
  readonly value: number | null;
  readonly onChange: (value: number | null) => void;
}

/** Repetition editor — presentation only. */
export function RepetitionInput({ value, onChange }: RepetitionInputProps) {
  const styles = useThemedStyles(() => ({
    wrap: {
      flex: 1,
      marginBottom: 0,
    },
  }));

  return (
    <View style={styles.wrap}>
      <AppInput
        label="Repetitions"
        keyboardType="number-pad"
        value={value == null ? "" : String(value)}
        onChangeText={(text) => {
          if (text.trim() === "") {
            onChange(null);
            return;
          }
          const parsed = Number.parseInt(text, 10);
          onChange(Number.isFinite(parsed) ? parsed : null);
        }}
        accessibilityLabel="Repetitions"
      />
    </View>
  );
}
