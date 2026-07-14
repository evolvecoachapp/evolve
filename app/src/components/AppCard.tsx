import { Pressable, StyleSheet, View, type ViewStyle } from "react-native";
import { colors, radius, shadows, spacing } from "../theme/theme";

interface AppCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: "default" | "accent";
  style?: ViewStyle;
}

export function AppCard({ children, onPress, variant = "default", style }: AppCardProps) {
  const cardStyle = [
    styles.card,
    variant === "accent" && styles.accent,
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [...cardStyle, pressed && styles.pressed]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  accent: {
    borderColor: colors.accent,
    borderLeftWidth: 3,
  },
  pressed: {
    backgroundColor: colors.overlay,
  },
});
