import { Text, TextInput, TextInputProps, View } from "react-native";
import { useTheme } from "../theme/ThemeContext";
import { radius, spacing } from "../theme/theme";
import { useThemedStyles } from "../theme/useThemedStyles";

interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string | null;
}

export function AppInput({ label, error, style, ...inputProps }: AppInputProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(({ colors, typography, shadows }) => ({
    container: {
      marginBottom: spacing.lg,
    },
    label: {
      ...typography.caption,
      marginBottom: spacing.xs + spacing.xs,
      color: colors.inkSecondary,
      fontWeight: "600",
    },
    inputShell: {
      borderRadius: radius.lg,
      backgroundColor: colors.surfaceElevated,
      borderWidth: 1,
      borderColor: colors.border,
      ...shadows.card,
    },
    input: {
      ...typography.body,
      borderRadius: radius.lg,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md + spacing.xs,
      color: colors.ink,
      backgroundColor: "transparent",
    },
    inputError: {
      borderColor: colors.error,
    },
    errorText: {
      ...typography.caption,
      color: colors.error,
      marginTop: spacing.xs,
    },
  }));

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.inputShell}>
        <TextInput
          style={[styles.input, error ? styles.inputError : null, style]}
          placeholderTextColor={colors.inkMuted}
          autoCapitalize="none"
          autoCorrect={false}
          {...inputProps}
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}
