import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  loading?: boolean;
  disabled?: boolean;
}

/** Shared touchable used by every auth/onboarding screen — avoids duplicating button styling per screen. */
export function Button({ label, onPress, variant = "primary", loading = false, disabled = false }: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.base,
        variant === "primary" ? styles.primary : styles.secondary,
        isDisabled && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? "#FFFFFF" : "#111827"} />
      ) : (
        <Text style={variant === "primary" ? styles.primaryLabel : styles.secondaryLabel}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: {
    backgroundColor: "#111827",
  },
  secondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#111827",
  },
  disabled: {
    opacity: 0.5,
  },
  primaryLabel: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  secondaryLabel: {
    color: "#111827",
    fontWeight: "600",
    fontSize: 16,
  },
});
