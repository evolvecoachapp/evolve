import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { useTheme } from "../theme/ThemeContext";
import { radius, spacing } from "../theme/theme";
import { useThemedStyles } from "../theme/useThemedStyles";

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
}

export function EmptyState({ icon, title, subtitle }: EmptyStateProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(({ colors, typography }) => ({
    container: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: spacing["3xl"],
      gap: spacing.md,
    },
    iconRing: {
      width: 72,
      height: 72,
      borderRadius: radius.full,
      backgroundColor: colors.overlayStrong,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      ...typography.title3,
      textAlign: "center",
    },
    subtitle: {
      ...typography.callout,
      textAlign: "center",
      maxWidth: 280,
      color: colors.inkMuted,
    },
  }));

  return (
    <View style={styles.container}>
      <View style={styles.iconRing}>
        <Ionicons name={icon} size={32} color={colors.inkMuted} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}
