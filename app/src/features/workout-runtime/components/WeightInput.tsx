import { View } from "react-native";
import { AppInput } from "../../../components/AppInput";
import { useThemedStyles } from "../../../theme/useThemedStyles";

interface WeightInputProps {
  readonly value: number | null;
  readonly onChange: (value: number | null) => void;
}

/** Weight editor — presentation only. */
export function WeightInput({ value, onChange }: WeightInputProps) {
  const styles = useThemedStyles(() => ({
    wrap: {
      flex: 1,
      marginBottom: 0,
    },
  }));

  return (
    <View style={styles.wrap}>
      <AppInput
        label="Weight (kg)"
        keyboardType="decimal-pad"
        value={value == null ? "" : String(value)}
        onChangeText={(text) => {
          if (text.trim() === "") {
            onChange(null);
            return;
          }
          const parsed = Number(text.replace(",", "."));
          onChange(Number.isFinite(parsed) ? parsed : null);
        }}
        accessibilityLabel="Weight in kilograms"
      />
    </View>
  );
}
